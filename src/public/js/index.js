'use strict';
// get form  
const file_sender = document.getElementById('file_sender');

// sockets
const socket = io();

socket.emit('data' , 'from front end');


// random name generator

  
  


file_sender?.addEventListener('submit' , async event =>{
    event.preventDefault();
    const { file } = event.target;
    // text || file should be present before upload
    console.log(file);
    const form_data = new FormData();
    form_data.set('file' , file.files[0]);

    // reset form if everything goes well
    await fetch('/files/' , {
        method:'POST',
        headers: new Headers({
            // 'Content-Type':'application/json',
        }),
        body: form_data,
    })
    .then(data => data.json())
    .then(result => {
        console.log(result)
    })
    .catch(error =>{
        console.log(error);
    });
    event.target?.reset();
});