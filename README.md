# 🏫 Gestión Administrativa AAC
### Institución Educativa Privada "Andrés Avelino Cáceres"

Sistema integral de gestión escolar diseñado para optimizar los procesos administrativos y académicos de la I.E.P. Andrés Avelino Cáceres.

![Dashboard Preview](src/assets/logo_aac.png)

## 🚀 Funcionalidades Principales

- **Panel Administrativo (Dashboard)**: Visualización en tiempo real de métricas clave (estudiantes, docentes, secciones).
- **Gestión de Estudiantes**: Registro y seguimiento de matrícula sincronizado con Firebase.
- **Gestión de Docentes**: Administración del personal académico y cargos.
- **Malla Curricular**: Control total sobre los cursos por niveles (Inicial, Primaria, Secundaria).
- **Reportes Inteligentes**: Generación de indicadores institucionales y distribución de alumnos.
- **Configuración Global**: Personalización de datos oficiales y apariencia del sistema.
- **Sincronización en Tiempo Real**: Base de datos NoSQL con Firestore para actualizaciones instantáneas entre usuarios.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Bundler**: Vite
- **Base de Datos**: Firebase Firestore
- **Estilos**: CSS3 moderno (Gradients, Glassmorphism, CSS Variables)
- **Deployment**: Preparado para Vercel / GitHub Pages

## 📦 Instalación y Desarrollo

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/AngelMamani/horario-aac.git
   cd horario-aac
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno:**
   Crea un archivo `.env.local` con tus credenciales de Firebase:
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

4. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

## 🌐 Despliegue en Vercel

Este proyecto está listo para ser desplegado en **Vercel**. Asegúrate de configurar las variables de entorno en el panel de Vercel con el prefijo `VITE_`.

---
Desarrollado para la **I.E.P. Andrés Avelino Cáceres**.
