# Guía de Despliegue en Azure - Backend

Has recibido un error porque Azure intenta buscar el archivo `requirements.txt` en la raíz del proyecto, pero en tu estructura está dentro de la carpeta `/Backend`.

## Solución 1: Desplegar solo la carpeta Backend (Recomendado)

Si estás usando el CLI de Azure, asegúrate de entrar en la carpeta `Backend` antes de realizar el despliegue:

```bash
cd Backend
az webapp up --name <nombre-de-tu-app> --runtime "PYTHON:3.9"
```

## Solución 2: Configurar Azure para usar una Subcarpeta

Si estás usando despliegue automático desde GitHub, puedes configurar Azure para que busque en la subcarpeta:

1.  Ve al **Azure Portal**.
2.  Busca tu **App Service**.
3.  Ve a **Configuración** -> **Configuración de la aplicación**.
4.  Agrega una nueva configuración: `PRE_BUILD_COMMAND` con el valor `cd Backend`.
5.  O mejor aún, configura `PYTHON_PROJECT_ROOT` si tu versión de Azure lo soporta.

## Estructura de Despliegue Correcta

Para que el servidor `gunicorn` funcione (como lo configuramos en el `Procfile`), el contenido de la carpeta `Backend/` debe ser tratado como la raíz del sitio en Azure.

### Verifica que estos archivos estén en el "sitio raíz" de Azure:
- `manage.py`
- `requirements.txt`
- `Procfile`
- `startup.sh`
- Carpeta `core/`
- Carpeta `api/`
