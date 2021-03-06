const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { PeerServer } = require('peer');
const PORT = process.env.PORT || 3007;

var cors = require('cors')
app.use(cors())

http.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
});
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log("client is connected " + socket.id);

    socket.on('userMessage', (data) => {
        io.sockets.emit("userMessage", data)
    });

    socket.on('userTyping', (data) => {
        socket.broadcast.emit("userTyping", data)
    })
});

const customGenerationFunction = () => (Math.random().toString(36) + '0000000000000000000').substr(2, 16);

const peerServer = PeerServer({
    port: 443,
    path: '/',
    generateClientId: customGenerationFunction
});



