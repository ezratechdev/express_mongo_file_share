'use strict';
// get form  
const file_sender = document.getElementById('file_sender');

// sockets
const socket = io();

socket.emit('data' , 'from front end');


file_sender?.addEventListener('submit' , async event =>{
    event.preventDefault();
    const { text } = event.target;
    // text || file should be present before upload
    console.log(text.value);

    // reset form if everything goes well
    event.target?.reset();
});