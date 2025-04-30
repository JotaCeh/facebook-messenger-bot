const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

// Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.json());

// Definir variables para los tokens (se configurarán en Azure)
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'mi_token_secreto';

// Ruta principal para comprobar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('¡El servidor del chatbot está funcionando correctamente!');
});

// Ruta para la verificación del webhook de Facebook
app.get('/webhook', (req, res) => {
  // El token que proporcionaste al configurar el webhook
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Comprueba si se recibió un token y si coincide con el token de verificación
  if (mode && token === VERIFY_TOKEN) {
    // Responde con el desafío enviado por Facebook
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    // Responde con '403 Forbidden' si los tokens no coinciden
    console.error('Verification failed. Tokens do not match.');
    res.sendStatus(403);
  }
});

// Ruta para recibir mensajes del webhook de Facebook
app.post('/webhook', (req, res) => {
  const body = req.body;

  // Comprueba si este es un evento de una página
  if (body.object === 'page') {
    // Itera sobre cada entrada - puede haber múltiples si ocurren al mismo tiempo
    body.entry.forEach(function(entry) {
      // Obtiene el cuerpo del webhook
      const webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Obtiene el PSID del remitente
      const sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Comprueba si el evento es un mensaje o un postback y
      // pasa el evento a la función apropiada
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Devuelve una respuesta '200 OK' a todas las solicitudes
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Devuelve una respuesta '404 Not Found' si el evento no es de una página
    res.sendStatus(404);
  }
});

// Maneja los mensajes recibidos
async function handleMessage(sender_psid, received_message) {
  let response;

  // Comprueba si el mensaje contiene texto
  if (received_message.text) {
    // Crea la respuesta basada en el texto recibido
    const messageText = received_message.text.toLowerCase();
    
    if (messageText.includes('hola')) {
      response = {
        "text": "¡Hola! Soy el chatbot de nuestra página. ¿En qué puedo ayudarte hoy?"
      };
    } else if (messageText.includes('ayuda')) {
      response = {
        "text": "Puedo ayudarte con información sobre nuestros productos, horarios de atención o responder preguntas frecuentes. ¿Qué necesitas saber?"
      };
    } else if (messageText.includes('gracias')) {
      response = {
        "text": "¡De nada! Estoy aquí para ayudarte. ¿Hay algo más en lo que pueda asistirte?"
      };
    } else {
      // Respuesta por defecto
      response = {
        "text": `Gracias por contactarnos. Hemos recibido tu mensaje: "${received_message.text}". Pronto te responderemos.`
      };
    }
  } else if (received_message.attachments) {
    // Responde a los archivos adjuntos
    response = {
      "text": "Gracias por compartir este archivo. Nuestro equipo lo revisará pronto."
    };
  }

  // Envía la respuesta
  await callSendAPI(sender_psid, response);
}

// Maneja los eventos de postback
async function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Obtiene el payload del postback
  const payload = received_postback.payload;

  // Establece la respuesta basada en el payload del postback
  if (payload === 'yes') {
    response = { "text": "¡Gracias!" };
  } else if (payload === 'no') {
    response = { "text": "Oops, intenta enviar otro mensaje." };
  }
  
  // Envía la respuesta
  await callSendAPI(sender_psid, response);
}

// Envía respuestas a través de la API de Messenger
async function callSendAPI(sender_psid, response) {
  try {
    // Construye el cuerpo del mensaje
    const request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    };

    // Envía la solicitud HTTP a la API de Messenger
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      request_body
    );
    console.log('Mensaje enviado exitosamente');
  } catch (error) {
    console.error('No se pudo enviar el mensaje:', error.response ? error.response.data : error.message);
  }
}

// Puerto dinámico asignado por Azure o 8080 para desarrollo local
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log('Verificar webhook en: /webhook');
});