# Hector_proyecto
# 🚀 Beacon Monitor - Sistema de Monitoreo

Aplicación web desarrollada con **Next.js + TypeScript + Tailwind CSS**, orientada a la visualización y monitoreo de dispositivos tipo beacon, incluyendo métricas, alertas, simulaciones y reportes.

---

## 📦 Tecnologías utilizadas

* Next.js 13
* React 18
* TypeScript
* Tailwind CSS
* Supabase (configurado)
* Recharts (gráficas)
* jsPDF / XLSX (reportes)

---

## ⚙️ Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

* Node.js (v18 o superior)
* npm o yarn

---

## 🛠️ Instalación y ejecución

Sigue estos pasos para correr el proyecto en tu entorno local:

### 1. Clonar el repositorio

```bash
git clone https://github.com/vafihsmayor/Hector_proyecto.git
```

### 2. Entrar a la carpeta del proyecto

```bash
cd Hector_proyecto/project
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar el proyecto

```bash
npm run dev
```

---

## 🌐 Acceso a la aplicación

Una vez ejecutado, abre tu navegador en:

```
http://localhost:3000
```

---

## 🔐 Credenciales de prueba

El sistema actualmente utiliza autenticación simulada:

* Usuario: `admin`
* Contraseña: `admin123`

---

# Beacon Monitor - Mantenimiento Predictivo

## 🎯 PROPÓSITO DEL SISTEMA

El propósito del sistema es proporcionar una plataforma web que permita el monitoreo en tiempo real, análisis histórico y predicción de fallas en dispositivos beacon BLE, facilitando la toma de decisiones para mantenimiento preventivo y predictivo, con el fin de mejorar la disponibilidad, eficiencia y vida útil de los dispositivos.

### 🧠 ¿Para qué sirve?
- **Monitorear**: Ver cómo están funcionando los dispositivos (beacons) en tiempo real.
- **Predecir**: Detectar problemas antes de que ocurran mediante análisis de batería, uso y señal.
- **Analizar**: Revisar historiales y generar alertas inteligentes.
- **Simular**: Probar escenarios de falla para optimizar la toma de decisiones.

---

## 📁 Estructura del proyecto

```
project/
│── app/            # Rutas principales (Next.js App Router)
│── components/     # Componentes reutilizables
│── contexts/       # Manejo de estado global (Auth)
│── lib/            # Configuración 
│── public/         # Recursos estáticos
│── supabase/       # Migraciones de base de datos
```

---

## ⚠️ Notas importantes

* El proyecto actualmente usa **datos simulados (mock data)**.
* La autenticación no está conectada a un backend real.


---

## 📌 Próximas mejoras

* Integrar autenticación real con Postgresql
* Conectar datos reales al dashboard
* Implementar control de roles
* Mejorar seguridad (variables de entorno)

---

## 👨‍💻 Autor

Proyecto desarrollado por:

* Hector (Repositorio original)


---

