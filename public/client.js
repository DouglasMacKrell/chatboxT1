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

/*  VIDEO CHAT  */

// STEP 1: Get local video & display it (with permission)
function getLVideo(callbacks){
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    let constraints = {
        video: true,
        audio: true
    }
    navigator.getUserMedia(constraints, callbacks.success, callbacks.error)
};

const recStream = (stream, elemId) => {
    let video = document.getElementById(elemId);

    video.srcObject = stream;

    window.peer_stream = stream;
}
getLVideo({
    success: function(stream){
        window.local_stream = stream;
        recStream(stream, 'lVideo');
    },
    error: function(err){
        alert("Can't access your camera!");
        console.log(err);
    }
})

let conn;
let peer_id;

// STEP 2: Create a PEER CONNECTION with the PEER OBJECT
let peer = new Peer({
    host: 'localhost',
    port: 9000,
    path: '/myapp'
});

// STEP 3: Display the PEER ID on the DOM
peer.on('open', function(id){
    document.getElementById('displayId').innerHTML = peer.id;
    console.log('My peer ID is: ' + id);
});

peer.on('connection', function(connection){
    conn = connection;
    peer_id = connection.peer;

    document.getElementById('connId').value = peer_id;
});

peer.on('error', function(err){
    alert("An error has happened " + err)
    console.log(err)
})

// STEP 4: EXCHANGE PEER IDs with onClick on CONNECTION button => Expose ICE info with each other
document.getElementById('conn-button').addEventListener('click', function(){
    peer_id = document.getElementById('connId').value;

    if(peer_id){
        conn = peer.connect(peer_id)
    } else {
        alert("Please enter an ID");
        return false;
    }
})

// STEP 5: CALL ON CLICK => Offer and Answer is exchanged 
peer.on('call', function(call){
    let acceptCall = confirm("Do you want to answer this call?");

    if(acceptCall){
        call.answer(window.local_stream);

        call.on('stream', function(stream){
            window.peer_stream = stream;
            recStream(stream, 'rVideo')
        });

        call.on('close', function(){
            alert("The call has ended");
        });
    } else {
        console.log("Call denied")
    }
});

// STEP 6: Ask to call
document.getElementById('call-button').addEventListener('click', function(){
    console.log(`Calling a peer: ${peer_id}`);
    console.log(peer);

    let call = peer.call(peer_id, window.local_stream);

    call.on('stream', function(stream){
        window.peer_stream = stream;

        recStream(stream, 'rVideo')
    })
})

// STEP 7: If accepted => accept call
// STEP 8: Display remote video and local video on the client
