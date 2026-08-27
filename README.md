# 🛡️ Supervivencia ITSE

> **Plataforma comunitaria de consejos, supervivencia académica y mentoría estudiantil para el Instituto Tecnológico Superior de Escárcega (ITSE).**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Turso](https://img.shields.io/badge/Turso-libSQL-00e5bf?style=flat-square&logo=sqlite)](https://turso.tech/)
[![JWT Auth](https://img.shields.io/badge/Auth-JWT_(jose)-black?style=flat-square&logo=json-web-tokens)](https://github.com/panva/jose)

---

## 📖 Descripción del Proyecto

**Supervivencia ITSE** es una aplicación web Full-Stack diseñada para que estudiantes veteranos y egresados compartan consejos, advertencias, recomendaciones de asignaturas y lecciones aprendidas con los alumnos de nuevo ingreso (primer semestre).

La plataforma cuenta con un sistema de autenticación seguro, feed público interactivo, sistema de reacciones (likes) con integridad relacional, gamificación basada en rangos y un panel de control exclusivo para administradores.

---

## 🚀 Stack Tecnológico y Arquitectura

El proyecto está construido bajo una arquitectura moderna enfocada en rendimiento en el Edge, seguridad, tipado estricto y una experiencia de usuario (UX) fluida y minimalista:

### 1. Frontend y Capa de Presentación
* **[Next.js 16 (App Router)](https://nextjs.org/)**: Framework principal que aprovecha los **React Server Components (RSC)** para renderizar el contenido desde el servidor, optimizar tiempos de carga (FCP), mejorar SEO y minimizar el bundle de JavaScript enviado al cliente.
* **[React 19](https://react.dev/)**: Utiliza las nuevas APIs y hooks concurrentes:
  * `useActionState`: Manejo de estados de formularios y Server Actions sin dependencias externas.
  * `useOptimistic`: Actualización optimista en la interfaz para interacciones instantáneas (como el sistema de likes sin latencia percibida).
  * `useTransition`: Manejo no bloqueante de transiciones de estado en el cliente.
* **[Tailwind CSS v4](https://tailwindcss.com/)**: Motor de estilos de última generación sin configuración pesada. Se implementó una estética oscura y minimalista (*Dark Mode*) basada en tonos `zinc` (`zinc-950`, `zinc-900`), efectos *Glassmorphism* (`backdrop-blur-xl`, `border-white/10`) y ambient glow blobs.
* **[Lucide React](https://lucide.dev/)**: Colección de iconos SVG consistentes, ligeros y accesibles.

---

### 2. Backend y Lógica de Servidor
* **Next.js Server Actions**: Funciones asíncronas ejecutadas directamente en el servidor Node.js que procesan mutaciones de datos, validaciones y revalidación de caché (`revalidatePath`) sin necesidad de configurar APIs REST tradicionales.
* **[Jose](https://github.com/panva/jose)**: Librería ligera y universal para la firma y verificación criptográfica de tokens **JWT (HS256)**. Es 100% compatible con runtimes en el Edge (Next.js Middleware/Proxy) y no depende de módulos nativos de Node.
* **[Bcryptjs](https://www.npmjs.com/package/bcryptjs)**: Implementación optimizada de hashing para contraseñas con salting seguro (12 rondas) antes de persistirlas en la base de datos.
* **Next.js Proxy (Middleware)**: Interceptor de rutas en el Edge para proteger accesos no autorizados a rutas privadas (`/profile`, `/publicar`, `/admin`) y redirigir usuarios autenticados fuera de las páginas de invitados (`/login`, `/register`).

---

### 3. Base de Datos y Persistencia
* **[Turso Database (libSQL)](https://turso.tech/)**: Base de datos relacional distribuida basada en SQLite y optimizada para la nube y el Edge. Permite consultas SQL estándar con latencias de milisegundos y réplicas globales.
* **[@libsql/client](https://github.com/tursodatabase/libsql-client-ts)**: Cliente oficial de conexión segura mediante HTTPS/WebSockets para ejecutar sentencias SQL parametrizadas contra la instancia remota de Turso.

---

## 🗄️ Modelo Relacional de Base de Datos

El esquema relacional cuenta con restricciones de integridad referencial, borrado en cascada y checks de validación:

```sql
-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 2. Tabla de Publicaciones (Consejos)
CREATE TABLE IF NOT EXISTS posts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT    NOT NULL,
  content    TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 3. Tabla de Likes (Reacciones con Integridad Única)
CREATE TABLE IF NOT EXISTS likes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(post_id, user_id) -- Evita likes duplicados a nivel de motor
);
```

---

## ✨ Funcionalidades Principales

| Módulo | Descripción |
|---|---|
| 🔐 **Autenticación Completa** | Registro con validaciones, inicio de sesión con JWT en cookies HttpOnly y protección contra el fondo blanco de autofill en navegadores. |
| 📜 **El Muro de Consejos** | Feed de publicaciones con fechas relativas en español (`Hace 2 horas`, `Ayer`), ordenado cronológicamente y optimizado con agregaciones SQL. |
| ✍️ **Vista de Publicación (`/publicar`)** | Formulario dedicado y protegido para redactar consejos de calidad con validaciones mínimas y máximas de caracteres. |
| ❤️ **Sistema de Likes Inteligente** | Reacciones con toggle (`dar/quitar like`), prevención de auto-like (un autor no puede reaccionar a su propio post) e interfaz optimista instantánea. |
| 🎖️ **Gamificación por Rangos** | Insignias dinámicas basadas en métricas históricas de aportes y likes: `Recluta`, `Estudiante`, `Veterano` y `Leyenda`. |
| 👤 **Perfil de Usuario (`/profile`)** | Estadísticas del usuario, actualización de nombre de usuario en tiempo real y panel de *"Mis Consejos"* con opción de eliminación propia validada. |
| 👑 **Panel de Moderación (`/admin`)** | Dashboard administrativo para usuarios con rol `admin` con capacidad de eliminar contenido no deseado mediante borrado en cascada. |

---

## 🛠️ Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/SebastianSKS/supervivencia-itse.git
cd supervivencia-itse
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto tomando como base `.env.example`:

```env
TURSO_DATABASE_URL=libsql://tu-base-de-datos.turso.io
TURSO_AUTH_TOKEN=tu-auth-token-de-turso
AUTH_SECRET=tu-clave-secreta-de-32-caracteres-para-jwt
```

### 4. Inicializar base de datos y usuario Administrador
```bash
# Ejecutar migraciones para crear las tablas
node migrate.js

# Crear usuario Administrador por defecto
node seed-admin.js
```

### 5. Iniciar servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📂 Estructura del Proyecto

```text
supervivencia-itse/
├── public/                 # Archivos y activos estáticos
├── scripts/                # Scripts auxiliares de base de datos
├── src/
│   ├── actions/            # Server Actions de Next.js (Auth, Posts, Likes, Admin, User)
│   ├── app/                # Rutas del App Router (Landing, Auth, Muro, Perfil, Admin, Publicar)
│   ├── components/         # Componentes reutilizables (Navbar, Cards, Forms, Badges)
│   ├── lib/                # Utilidades, cliente Turso (@/lib/db) y lógica JWT (@/lib/auth)
│   └── proxy.ts            # Next.js Proxy/Middleware para protección de rutas
├── .env.example            # Plantilla de variables de entorno
├── migrate.js              # Script de migración de tablas
├── seed-admin.js           # Script para crear el usuario admin por defecto
└── package.json            # Dependencias y scripts del proyecto
```

---

## 👨‍💻 Autor y Créditos

Desarrollado con ❤️ para la comunidad de estudiantes del **Instituto Tecnológico Superior de Escárcega (ITSE)**.
