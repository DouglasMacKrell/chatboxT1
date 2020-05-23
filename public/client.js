const socket = io();

const message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    output = document.getElementById('output'),
    typing = document.getElementById('typing'),
    button = document.getElementById('button');

// send active typing message to all other users
message.addEventListener('keypress', () => {
    socket.emit('userTyping', handle.value)
});

// send messages to clients
button.addEventListener('click', () => {
    event.preventDefault();
    socket.emit('userMessage', {
        handle: handle.value,
        message: message.value
    });
    document.getElementById('message').value = "";
});

// listen for events from the server
socket.on("userMessage", (data) => {
    typing.innerHTML = "";
    output.innerHTML += '<p> <strong>' + data.handle + ': </strong>' + data.message + '</p>'
});

// listen for user typing keypress
socket.on("userTyping", (data) => {
    typing.innerHTML = '<p> <em>' + data + ' is typing... </em> </p>'
})
