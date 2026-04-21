
# 🚀 Eipril - Catálogo Minimalista

Este es el catálogo de productos oficial de **Eipril**, construido con **Next.js 15**, **Firebase** y **Genkit AI**. Diseñado para ser rápido, elegante y fácil de gestionar.

## 🛠️ Requisitos previos

1.  Una cuenta en [GitHub](https://github.com).
2.  Una cuenta en [Netlify](https://netlify.com).
3.  Un proyecto en [Firebase Console](https://console.firebase.google.com).

## 📦 Guía de Despliegue en Netlify

Sigue estos pasos para poner tu tienda online en menos de 5 minutos:

### 1. Preparar GitHub
- Crea un nuevo repositorio en GitHub (ej. `nombre-de-tu-tienda`).
- Sube todos los archivos del proyecto a este repositorio.

### 2. Conectar con Netlify
- Inicia sesión en Netlify y selecciona **"Add new site"** > **"Import an existing project"**.
- Conecta tu cuenta de GitHub y elige el repositorio que acabas de crear.
- Netlify detectará automáticamente que es un proyecto de **Next.js**.

### 3. Configurar Variables de Entorno (CRÍTICO)
Antes de desplegar, ve a **Site configuration > Build & deploy > Environment variables** y añade las siguientes:

- `GOOGLE_GENAI_API_KEY`: Tu clave de API de Google AI (Gemini).
- `NEXT_PUBLIC_FIREBASE_API_KEY`: La API Key de tu proyecto Firebase.
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: El dominio de auth de Firebase.
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: El ID de tu proyecto Firebase.
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: (Opcional) Tu bucket de storage.
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Tu ID de mensajería.
- `NEXT_PUBLIC_FIREBASE_APP_ID`: El App ID de Firebase.

### 4. Desplegar
- Haz clic en **"Deploy site"**. Netlify compilará tu aplicación y te dará una URL pública (ej. `mi-tienda.netlify.app`).

## 📱 Características principales

- **Panel Admin**: Gestión total de productos, categorías y banners.
- **Personalización**: Cambia colores y fuentes en tiempo real.
- **WhatsApp**: Integración directa para pedidos y consultas.
- **Optimizado**: Configuración lista para producción y SEO.

---
Hecho con ❤️ para **Eipril**.
