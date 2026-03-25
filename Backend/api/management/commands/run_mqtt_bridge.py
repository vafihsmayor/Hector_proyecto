import json
import os
import re
from datetime import datetime, timezone as dt_timezone
from decimal import Decimal, InvalidOperation

import paho.mqtt.client as mqtt
from django.core.management.base import BaseCommand
from django.db import IntegrityError
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from api.models import Beacon, Metric


def to_decimal(value):
    if value is None:
        return None

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def get_payload_battery(payload):
    candidates = [
        payload.get("battery_level"),
        payload.get("battery"),
        payload.get("bat"),
        payload.get("battery_percentage"),
    ]

    for raw in candidates:
        battery = to_decimal(raw)
        if battery is None:
            continue
        # Some firmware variants report unknown battery as 0 or -1.
        if battery == Decimal("0"):
            continue
        if Decimal("0") <= battery <= Decimal("100"):
            return battery

    return None


def parse_payload_timestamp(raw_value):
    if raw_value is None:
        return timezone.now()

    if isinstance(raw_value, (int, float)):
        timestamp = float(raw_value)
        if timestamp > 1_000_000_000_000:
            timestamp = timestamp / 1000.0
        return datetime.fromtimestamp(timestamp, tz=dt_timezone.utc)

    raw_str = str(raw_value).strip()
    if not raw_str:
        return timezone.now()

    try:
        numeric = float(raw_str)
        if numeric > 1_000_000_000_000:
            numeric = numeric / 1000.0
        return datetime.fromtimestamp(numeric, tz=dt_timezone.utc)
    except ValueError:
        pass

    normalized = raw_str.replace("Z", "+00:00")
    parsed = parse_datetime(normalized)
    if parsed is None:
        return timezone.now()

    if timezone.is_naive(parsed):
        return timezone.make_aware(parsed, timezone=dt_timezone.utc)

    return parsed


def normalize_identifier(value):
    if value is None:
        return ""

    text = str(value).strip().upper()
    return re.sub(r"[^A-Z0-9]", "", text)


def sanitize_device_id(value):
    if value is None:
        return ""

    # Remove surrounding quotes often introduced when creating beacons manually.
    return str(value).strip().strip('"').strip("'")


def find_beacon_by_device_id(device_id):
    normalized_target = normalize_identifier(device_id)
    if not normalized_target:
        return None

    candidates = []
    for candidate in Beacon.objects.only("id", "device_id", "created_at").order_by("created_at"):
        if normalize_identifier(candidate.device_id) == normalized_target:
            candidates.append(candidate)

    if candidates:
        return candidates[0]

    return None


def load_device_id_map(raw_mapping):
    mapping = {}
    if not raw_mapping:
        return mapping

    entries = [item.strip() for item in raw_mapping.split(",") if item.strip()]
    for entry in entries:
        if "=" not in entry:
            continue

        source, target = entry.split("=", 1)
        source_key = normalize_identifier(source)
        target_value = target.strip().upper()

        if source_key and target_value:
            mapping[source_key] = target_value

    return mapping


class Command(BaseCommand):
    help = "Consume telemetria BLE por MQTT y guarda metricas en PostgreSQL."

    def handle(self, *args, **options):
        broker = os.getenv("MQTT_BROKER", "broker.hivemq.com")
        port = int(os.getenv("MQTT_PORT", "1883"))
        topic = os.getenv("MQTT_TOPIC", "sigi/ble/telemetry").strip()
        username = os.getenv("MQTT_USER", "").strip()
        password = os.getenv("MQTT_PASSWORD", "").strip()
        qos = int(os.getenv("MQTT_QOS", "0"))
        device_id_map = load_device_id_map(os.getenv("MQTT_DEVICE_ID_MAP", ""))

        client_id = f"django-mqtt-bridge-{os.getpid()}"
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=client_id)

        if username:
            client.username_pw_set(username, password if password else None)

        def on_connect(mqtt_client, _userdata, _flags, reason_code, _properties):
            if reason_code == 0:
                self.stdout.write(self.style.SUCCESS(f"Conectado a MQTT {broker}:{port}"))
                mqtt_client.subscribe(topic, qos=qos)
                self.stdout.write(self.style.SUCCESS(f"Suscrito al topic: {topic}"))
            else:
                self.stderr.write(
                    self.style.ERROR(f"Fallo en conexion MQTT. reason_code={reason_code}")
                )

        def on_message(_mqtt_client, _userdata, message):
            try:
                payload = json.loads(message.payload.decode("utf-8"))
            except json.JSONDecodeError:
                self.stderr.write(self.style.WARNING("Payload invalido (JSON). Mensaje ignorado."))
                return

            raw_device_id = payload.get("device_id") or payload.get("beacon_id")
            device_id = sanitize_device_id(raw_device_id).upper() if raw_device_id else ""
            if not device_id:
                self.stderr.write(self.style.WARNING("Mensaje sin device_id/beacon_id. Ignorado."))
                return

            normalized_key = normalize_identifier(device_id)
            resolved_device_id = device_id_map.get(normalized_key, device_id)

            if resolved_device_id != device_id:
                self.stdout.write(
                    self.style.NOTICE(
                        f"Map aplicado MQTT_DEVICE_ID_MAP: {device_id} -> {resolved_device_id}"
                    )
                )

            beacon = find_beacon_by_device_id(resolved_device_id)
            if not beacon:
                self.stdout.write(
                    self.style.WARNING(
                        f"Beacon no registrado ({resolved_device_id}). Mensaje filtrado."
                    )
                )
                return

            battery = get_payload_battery(payload)
            signal = to_decimal(payload.get("signal_strength", payload.get("rssi")))

            if signal is None:
                self.stderr.write(
                    self.style.WARNING(
                        f"Datos incompletos para {resolved_device_id}. signal_strength={signal}."
                    )
                )
                return

            if battery is None:
                latest_valid = (
                    Metric.objects.filter(
                        beacon=beacon,
                        battery_level__isnull=False,
                        battery_level__gt=0,
                        battery_level__lte=100,
                    )
                    .order_by("-timestamp")
                    .values("battery_level")
                    .first()
                )
                battery = latest_valid["battery_level"] if latest_valid else None

            event_timestamp = parse_payload_timestamp(payload.get("timestamp") or payload.get("timestamp_dispositivo"))

            try:
                Metric.objects.create(
                    beacon=beacon,
                    battery_level=battery,
                    signal_strength=signal,
                    timestamp=event_timestamp,
                )
            except IntegrityError as exc:
                self.stderr.write(
                    self.style.ERROR(
                        f"Error guardando metrica para {resolved_device_id}: {exc}"
                    )
                )
                return

            beacon.last_seen = timezone.now()
            beacon.status = "active"
            beacon.save(update_fields=["last_seen", "status", "updated_at"])

            self.stdout.write(
                self.style.SUCCESS(
                    f"Metric guardada | beacon={resolved_device_id} | battery={battery if battery is not None else 'N/A'} | RSSI={signal} dBm"
                )
            )

        client.on_connect = on_connect
        client.on_message = on_message

        self.stdout.write(
            self.style.HTTP_INFO(
                f"Iniciando MQTT bridge | broker={broker}:{port} | topic={topic} | qos={qos}"
            )
        )

        client.connect(broker, port, keepalive=60)
        client.loop_forever()
