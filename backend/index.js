import fs from 'fs';
import https from 'https';
import { WebSocket, WebSocketServer } from 'ws';

const port = 8080;

// Read the SSL certificate files
const privateKey = fs.readFileSync('./key.pem', 'utf8');
const certificate = fs.readFileSync('./cert.pem', 'utf8');

// Create an HTTPS server
const server = https.createServer({
  key: privateKey,
  cert: certificate
});

// Pass the HTTPS server to WebSocketServer
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      console.log('Received:', parsedMessage);

      // Broadcast the parsed message to all connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage));
          console.log('Broadcasted:', parsedMessage);
        }
      });
    } catch (error) {
      console.error('Invalid JSON data received:', message);
    }
  });
});

server.listen(port, () => {
  console.log(`WebSocket server started on port ${port}`);
});