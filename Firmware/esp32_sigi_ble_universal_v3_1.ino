/*
 * SIGI BLE UNIVERSAL TRACKER - v3.1
 *
 * Cambios clave:
 * - Publica signal_strength (RSSI) y battery_level por MQTT.
 * - Mantiene modo universal (puede enviar todos los dispositivos).
 * - Lee bateria por GATT Battery Service (0x180F / 0x2A19) para el beacon objetivo.
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <BLEDevice.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <BLEClient.h>
#include <BLERemoteService.h>
#include <BLERemoteCharacteristic.h>
#include <ArduinoJson.h>
#include <time.h>

// User configuration
#define WIFI_SSID      "Encryptada"
#define WIFI_PASS      "$Kl25Is15Da04Sz15"
#define ESP32_ID       "INNOVA"
#define MQTT_BROKER    "broker.hivemq.com"
#define MQTT_PORT      1883
#define MQTT_TOPIC     "sigi/ble/telemetry"   // Debe coincidir con MQTT_TOPIC del backend
#define MQTT_CLIENT_ID "sigi-esp32-universal"
#define MQTT_USER      ""
#define MQTT_PASSWORD  ""

// Operation modes
#define SEND_ALL_DEVICES true
#define FILTER_DEVICE_NAME ""                 // Solo usado si SEND_ALL_DEVICES = false
#define FILTER_DEVICE_MAC "DD:34:02:0B:FF:79" // Solo usado si SEND_ALL_DEVICES = false

// Battery read configuration
#define ENABLE_BATTERY_READ true
#define BATTERY_TARGET_MAC "DD:34:02:0B:FF:79" // Recomendado para BlueCharm objetivo
#define BATTERY_CACHE_MS 120000

// Advanced settings
#define BLE_SCAN_DURATION_SEC 5
#define RSSI_THRESHOLD -100
#define MAX_DEVICES 50
#define DEBUG_BLE true
#define MQTT_RETRY_DELAY_MS 5000

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
BLEScan* pBLEScan;

struct DetectedBleDevice {
  String mac;
  String name;
  int rssi;
  int batteryLevel; // -1 = unknown
  unsigned long timestampMs;
};

struct BatteryCacheEntry {
  String mac;
  int batteryLevel;
  unsigned long readAtMs;
};

DetectedBleDevice detectedDevices[MAX_DEVICES];
BatteryCacheEntry batteryCache[MAX_DEVICES];
int deviceCount = 0;
unsigned long lastMqttAttemptMs = 0;
bool ntpReady = false;

class ScannerCallbacks : public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) override {}
};

bool shouldReadBattery(const String& mac, const String& name) {
  if (!ENABLE_BATTERY_READ) return false;

  if (strlen(BATTERY_TARGET_MAC) > 0) {
    String target = BATTERY_TARGET_MAC;
    String current = mac;
    target.toUpperCase();
    current.toUpperCase();
    return current == target;
  }

  String lowerName = name;
  lowerName.toLowerCase();
  return lowerName.indexOf("blue") >= 0 || lowerName.indexOf("charm") >= 0;
}

int getCachedBattery(const String& mac) {
  for (int i = 0; i < MAX_DEVICES; i++) {
    if (batteryCache[i].mac.length() == 0) continue;
    String a = batteryCache[i].mac;
    String b = mac;
    a.toUpperCase();
    b.toUpperCase();

    if (a == b) {
      if (millis() - batteryCache[i].readAtMs <= BATTERY_CACHE_MS) {
        return batteryCache[i].batteryLevel;
      }
      return -1;
    }
  }
  return -1;
}

void putCachedBattery(const String& mac, int batteryLevel) {
  int freeSlot = -1;

  for (int i = 0; i < MAX_DEVICES; i++) {
    if (batteryCache[i].mac.length() == 0 && freeSlot < 0) {
      freeSlot = i;
      continue;
    }

    String a = batteryCache[i].mac;
    String b = mac;
    a.toUpperCase();
    b.toUpperCase();

    if (a == b) {
      batteryCache[i].batteryLevel = batteryLevel;
      batteryCache[i].readAtMs = millis();
      return;
    }
  }

  if (freeSlot >= 0) {
    batteryCache[freeSlot].mac = mac;
    batteryCache[freeSlot].batteryLevel = batteryLevel;
    batteryCache[freeSlot].readAtMs = millis();
  }
}

int readBatteryLevel(const String& mac) {
  int cached = getCachedBattery(mac);
  if (cached >= 0) {
    return cached;
  }

  BLEAddress address(mac.c_str());
  BLEClient* client = BLEDevice::createClient();
  if (!client) {
    return -1;
  }

  bool connected = false;
  int battery = -1;

  connected = client->connect(address, BLE_ADDR_TYPE_PUBLIC);
  if (connected) {
    BLERemoteService* batteryService = client->getService(BLEUUID((uint16_t)0x180F));
    if (batteryService) {
      BLERemoteCharacteristic* batteryCharacteristic = batteryService->getCharacteristic(BLEUUID((uint16_t)0x2A19));
      if (batteryCharacteristic && batteryCharacteristic->canRead()) {
        String value = batteryCharacteristic->readValue().c_str();
        if (value.length() > 0) {
          battery = (uint8_t)value[0];
          if (battery >= 0 && battery <= 100) {
            putCachedBattery(mac, battery);
          } else {
            battery = -1;
          }
        }
      }
    }
    client->disconnect();
  }

  delete client;
  return battery;
}

void setupTimeSync() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov", "time.google.com");
  Serial.print("[NTP] Sincronizando hora");

  time_t now = time(nullptr);
  int attempts = 0;
  while (now < 1700000000 && attempts < 20) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
    attempts++;
  }

  if (now >= 1700000000) {
    ntpReady = true;
    Serial.println(" ok");
  } else {
    ntpReady = false;
    Serial.println(" fallo (se usara timestamp del servidor)");
  }
}

String nowIso8601() {
  if (!ntpReady) return "";

  time_t now = time(nullptr);
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);

  char buffer[30];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buffer);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n");
  Serial.println("============================================================");
  Serial.println("      SIGI BLE UNIVERSAL TRACKER v3.1");
  Serial.println("      Battery + RSSI Telemetry over MQTT");
  Serial.println("============================================================\n");

  Serial.printf("[CONFIG] WiFi: %s\n", WIFI_SSID);
  Serial.printf("[CONFIG] MQTT: %s:%d / %s\n", MQTT_BROKER, MQTT_PORT, MQTT_TOPIC);
  Serial.printf("[CONFIG] ESP32 ID: %s\n", ESP32_ID);

  if (SEND_ALL_DEVICES) {
    Serial.println("[CONFIG] MODE: SEND_ALL_DEVICES=true");
  } else {
    Serial.println("[CONFIG] MODE: Filtered by name/MAC");
  }

  connectWiFi();
  setupTimeSync();

  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setKeepAlive(30);
  mqttClient.setSocketTimeout(8);

  connectMQTT();

  BLEDevice::init("");
  pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new ScannerCallbacks(), false);
  pBLEScan->setActiveScan(true);
  pBLEScan->setInterval(97);
  pBLEScan->setWindow(37);

  Serial.println("[BLE] Scanner initialized\n");
}

void loop() {
  if (!mqttClient.connected() && millis() - lastMqttAttemptMs >= MQTT_RETRY_DELAY_MS) {
    connectMQTT();
  }
  mqttClient.loop();

  performBLEScan();
  delay(2000);
}

void performBLEScan() {
  Serial.printf("[SCAN] BLE scan start (%d sec)...\n", BLE_SCAN_DURATION_SEC);

  deviceCount = 0;
  memset(detectedDevices, 0, sizeof(detectedDevices));

  BLEScanResults* pResults = pBLEScan->start(BLE_SCAN_DURATION_SEC, false);

  int devicesFound = pResults->getCount();
  Serial.printf("[SCAN] Total BLE devices: %d\n", devicesFound);

  if (devicesFound == 0) {
    Serial.println("[RESULT] No devices detected\n");
    pBLEScan->clearResults();
    return;
  }

  for (int i = 0; i < devicesFound && deviceCount < MAX_DEVICES; i++) {
    BLEAdvertisedDevice device = pResults->getDevice(i);

    String mac = device.getAddress().toString().c_str();
    String name = device.haveName() ? device.getName().c_str() : "";
    int rssi = device.getRSSI();

    if (rssi < RSSI_THRESHOLD) continue;

    if (!SEND_ALL_DEVICES) {
      bool passesFilter = true;

      if (strlen(FILTER_DEVICE_NAME) > 0 && name.indexOf(FILTER_DEVICE_NAME) < 0) {
        passesFilter = false;
      }

      if (strlen(FILTER_DEVICE_MAC) > 0) {
        String targetMac = FILTER_DEVICE_MAC;
        targetMac.toUpperCase();
        String currentMac = mac;
        currentMac.toUpperCase();
        if (currentMac != targetMac) {
          passesFilter = false;
        }
      }

      if (!passesFilter) continue;
    }

    int battery = -1;
    if (shouldReadBattery(mac, name)) {
      battery = readBatteryLevel(mac);
    }

    if (DEBUG_BLE) {
      Serial.printf("[BLE][DEBUG] MAC=%s | Name=%s | RSSI=%d | Battery=%d\n",
                    mac.c_str(),
                    name.length() ? name.c_str() : "(no_name)",
                    rssi,
                    battery);
    }

    detectedDevices[deviceCount].mac = mac;
    detectedDevices[deviceCount].name = name;
    detectedDevices[deviceCount].rssi = rssi;
    detectedDevices[deviceCount].batteryLevel = battery;
    detectedDevices[deviceCount].timestampMs = millis();
    deviceCount++;
  }

  pBLEScan->clearResults();

  if (deviceCount > 0) {
    Serial.printf("[RESULT] Publishing %d devices\n", deviceCount);
    for (int i = 0; i < deviceCount; i++) {
      publishDevice(i);
    }
    Serial.println();
  } else {
    Serial.println("[RESULT] No devices to publish\n");
  }
}

void publishDevice(int index) {
  if (index >= deviceCount) return;

  if (!mqttClient.connected()) {
    Serial.println("  [MQTT] No connection; publish skipped in this cycle");
    return;
  }

  String deviceId = detectedDevices[index].mac;
  String deviceName = detectedDevices[index].name;
  int rssi = detectedDevices[index].rssi;
  int battery = detectedDevices[index].batteryLevel;

  StaticJsonDocument<512> doc;
  doc["device_id"] = deviceId;            // Backend uses this to map beacons.device_id
  doc["beacon_id"] = deviceId;            // Backward compatibility
  doc["esp32_id"] = ESP32_ID;
  doc["device_name"] = deviceName.length() > 0 ? deviceName : "unknown";
  doc["signal_strength"] = rssi;
  doc["rssi"] = rssi;

  if (battery >= 0) {
    doc["battery_level"] = battery;
  } else {
    doc["battery_level"] = nullptr;
  }

  String ts = nowIso8601();
  if (ts.length() > 0) {
    doc["timestamp"] = ts;
  } else {
    doc["timestamp_dispositivo"] = detectedDevices[index].timestampMs;
  }

  char payload[512];
  size_t len = serializeJson(doc, payload, sizeof(payload));

  bool ok = mqttClient.publish(MQTT_TOPIC, (const uint8_t*)payload, len, false);
  if (ok) {
    Serial.printf("  [MQTT] OK %s | RSSI=%d | BAT=%d | %s\n",
                  deviceId.c_str(),
                  rssi,
                  battery,
                  deviceName.length() ? deviceName.c_str() : "no_name");
  } else {
    Serial.printf("  [MQTT] FAIL %s\n", deviceId.c_str());
  }
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  Serial.printf("[WiFi] Connecting to %s", WIFI_SSID);
  WiFi.disconnect(true, true);
  delay(200);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] Connected | IP: %s | RSSI: %d dBm\n\n",
                  WiFi.localIP().toString().c_str(),
                  WiFi.RSSI());
  } else {
    Serial.println("\n[WiFi] Failed. Restarting...");
    ESP.restart();
  }
}

void connectMQTT() {
  lastMqttAttemptMs = millis();
  IPAddress brokerIp;
  if (!WiFi.hostByName(MQTT_BROKER, brokerIp)) {
    Serial.printf("[MQTT] DNS failed for %s\n", MQTT_BROKER);
    return;
  }

  Serial.printf("[MQTT] Connecting to %s:%d (%s)...\n",
                MQTT_BROKER,
                MQTT_PORT,
                brokerIp.toString().c_str());

  String clientId = String(MQTT_CLIENT_ID);
  clientId += "-";
  clientId += String((uint32_t)ESP.getEfuseMac(), HEX);

  bool ok;
  if (strlen(MQTT_USER) > 0) {
    ok = mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD);
  } else {
    ok = mqttClient.connect(clientId.c_str());
  }

  if (ok) {
    Serial.println("[MQTT] Connected\n");
  } else {
    Serial.printf("[MQTT] Failed state=%d | WiFi=%d | Retry in %d ms\n",
                  mqttClient.state(),
                  WiFi.status(),
                  MQTT_RETRY_DELAY_MS);
  }
}
