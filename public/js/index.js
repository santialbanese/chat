const socket = io();

let message = document.getElementById("message");
let messageLog = document.getElementById("messageLog");
let boton = document.getElementById("button");
let user;
let userIdentificado = false; 
let nuevoUsuarioConectado = null;
let usuarioAbandono = null;

Swal.fire({
    title: "Indentificate",
    input: "text",
    text: "Ingresa el usuario para identificarse en el chat",
    inputValidator: (value) => {
      return !value && "Por favor ingrese el nombre de usuario";
    },
    allowOutsideClick: false,
  }).then((result) => {
    user = result.value;
    userIdentificado = true;
    socket.emit("newUser", user);
    if (nuevoUsuarioConectado) {
        notification(nuevoUsuarioConectado);
        nuevoUsuarioConectado = null;
        usuarioAbandono = null;
    }
}); 

function scrollToBottom() {
    messageLog.scrollTop = messageLog.scrollHeight;
}

message.addEventListener("keyup", (data) => { 
    if(data.key === "Enter" && message.value.trim().length > 0){
        socket.emit("message", {user: user, mensaje: message.value})
        message.value = "";
        scrollToBottom();
    }
}) 

boton.addEventListener("click", (data) => { 
    if(message.value.trim().length > 0){
        socket.emit("message", {user: user, mensaje: message.value})
        message.value = ""; 
        scrollToBottom();
    }
})
   
socket.on("messageLog", (data) => { 
    let messages = ""; 

    data.forEach((userMessage) => {
        messages = messages + ` ${userMessage.user} : ${userMessage.mensaje} </br>`
    }); 

    messageLog.innerHTML = messages;
    scrollToBottom();
})   

//NUEVO USUARIO 
socket.on("newUser", (data) => {
    if (userIdentificado) {
        notification(data);
    } else {
        nuevoUsuarioConectado = data; 
    }
});

const notification = (data) => { 
    Swal.fire({
        text: `Se conectó ${data}`,
        toast: true,
        position: "top-right",
        timer: 2000,
    });
}
//usuario desconectado

socket.on("userDisconnected", (data) => {
    if (userIdentificado) {
        notificationSalir(data);
    } else {
        usuarioAbandono = data; 
    }
});

const notificationSalir = (data) => { 
    Swal.fire({
        text: `${data}`,
        toast: true,
        position: "top-right",
        timer: 1500,
    });
}