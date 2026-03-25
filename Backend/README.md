# Backend Django - Beacon Monitor

## 1) Instalar dependencias

```bash
pip install -r requirements.txt
```

## 2) Configurar entorno

Crea un archivo `.env` en esta carpeta usando `.env.example` como base.

Variables principales:
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

Variables para ingesta MQTT (ESP32 -> backend):
- `MQTT_BROKER` (ej. `broker.hivemq.com`)
- `MQTT_PORT` (ej. `1883`)
- `MQTT_TOPIC` (topic que publica el ESP32)
- `MQTT_USER` (opcional)
- `MQTT_PASSWORD` (opcional)
- `MQTT_QOS` (opcional, default `0`)
- `MQTT_DEVICE_ID_MAP` (opcional, formato `MAC=device_id_db`, separado por comas)

## 3) Levantar servidor

```bash
python manage.py runserver 0.0.0.0:8000
```

## Endpoints

- `GET /api/health/`
- `POST /api/auth/login/`
- `GET /api/beacons/`
- `GET /api/beacons/<uuid>/`
- `GET /api/beacons/<uuid>/metrics/?limit=30`
- `GET /api/dashboard/summary/`

## Ingesta MQTT de telemetria

Este backend incluye un bridge MQTT para guardar metricas en la tabla `metrics`.

Ejecutar:

```bash
python manage.py run_mqtt_bridge
```

Payload esperado por mensaje MQTT:

```json
{
	"device_id": "DD:34:02:0B:FF:79",
	"battery_level": 87,
	"signal_strength": -61,
	"timestamp": "2026-03-25T18:20:30Z",
	"esp32_id": "INNOVA",
	"device_name": "BlueCharm-BC04P"
}
```

Notas:
- `device_id` debe coincidir con `beacons.device_id` en la base de datos.
- Si el beacon no esta registrado, el bridge lo filtra y no guarda la metrica.
- Si tu ESP32 publica MAC y en DB usas IDs como `TEST-001`, usa `MQTT_DEVICE_ID_MAP`.
	Ejemplo: `MQTT_DEVICE_ID_MAP=DD:34:02:0B:FF:79=TEST-001`

## Nota sobre tablas

Este backend usa las tablas existentes de PostgreSQL (`users`, `beacons`, `metrics`) con modelos no gestionados por migraciones (`managed = False`).
