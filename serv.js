const { get } = require('http');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let clients = [];
let poswords = ["HELLO", "GHOST", "BIOME"];

function matchClients() {
  while (clients.length >= 2) {
    const [client1, client2] = clients.splice(0, 2);
    let word = poswords[Math.floor(Math.random()*poswords.length)];
    client1.send("word "+word);
    client2.send("word "+word);
    
    client1.on('message', (message) => {
      client2.send(message.toString());      
    });

    client2.on('message', (message) => {
      client1.send(message.toString());
    });

    const closeConnection = (other) => {
      return () => {
        console.log('Client disconnected, notifying the partner...');
        other.send('Your partner has disconnected.');
        other.close();
      };
    };

    client1.on('close', closeConnection(client2));
    client2.on('close', closeConnection(client1));
  }
}

wss.on('connection', (ws) => {
  console.log('clicon!');
  clients.push(ws);

  matchClients();

  ws.on('close', () => {
    console.log('Client has disconnected');
    clients = clients.filter(client => client !== ws);
  });
});

console.log('started on ws://localhost:8080');
