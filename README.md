# facebook-messenger-bot
# Facebook Messenger Chatbot

Este es un chatbot para Facebook Messenger construido con Node.js y desplegado en Azure.

## Configuración

1. Clona este repositorio
2. Instala las dependencias: `npm install`
3. Configura las variables de entorno en Azure:
   - PAGE_ACCESS_TOKEN: Tu token de acceso de página de Facebook
   - VERIFY_TOKEN: Tu token de verificación personalizado
4. Despliega en Azure App Service

## Desarrollo local

Para desarrollo local:
1. Crea un archivo `.env` con tus tokens
2. Ejecuta: `npm start`
3. Usa ngrok o similar para exponer tu puerto 8080

## Funcionalidades

- Respuestas automáticas a mensajes básicos
- Gestión de eventos de Facebook Messenger
- Respuestas personalizadas basadas en palabras clave