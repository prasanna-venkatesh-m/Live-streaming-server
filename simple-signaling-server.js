const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8888 });

const rooms = {};

wss.on('connection', function connection(ws) {
  console.log('🔗 New client connected');

  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'join':
        const room = data.room;
        ws.room = room;
        if (!rooms[room]) rooms[room] = [];
        rooms[room].push(ws);
        console.log(`📥 Client joined room: ${room}`);
        console.log(`🧑‍🤝‍🧑 Total clients in ${room}: ${rooms[room].length}`);
        break;

      case 'offer':
        console.log(`📤 OFFER received from client in room: ${ws.room}`);
        if (ws.room && rooms[ws.room]) {
          rooms[ws.room].forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message);
              console.log('📩 OFFER forwarded to another client');
            }
          });
        }
        break;

      case 'answer':
        console.log(`📤 ANSWER received from client in room: ${ws.room}`);
        if (ws.room && rooms[ws.room]) {
          rooms[ws.room].forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message);
              console.log('📩 ANSWER forwarded to another client');
            }
          });
        }
        break;

      case 'candidate':
        console.log(`💡 ICE CANDIDATE received from client in room: ${ws.room}`);
        if (ws.room && rooms[ws.room]) {
          rooms[ws.room].forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message);
              console.log('💌 ICE CANDIDATE forwarded to another client');
            }
          });
        }
        break;

      default:
        console.log('⚠️ Unknown message type:', data.type);
    }
  });

  ws.on('close', () => {
    const room = ws.room;
    if (room && rooms[room]) {
      rooms[room] = rooms[room].filter(client => client !== ws);
      console.log(`❌ Client disconnected from room: ${room}`);
      console.log(`🧑‍🤝‍🧑 Clients left in ${room}: ${rooms[room].length}`);
    } else {
      console.log('❌ Client disconnected (was not in a room)');
    }
  });
});

console.log('🚀 WebSocket signaling server running on ws://localhost:8888');
