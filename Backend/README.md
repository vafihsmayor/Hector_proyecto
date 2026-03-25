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

## Nota sobre tablas

Este backend usa las tablas existentes de PostgreSQL (`users`, `beacons`, `metrics`) con modelos no gestionados por migraciones (`managed = False`).
