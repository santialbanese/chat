const socket = io();

let message = document.getElementById("message");
let messageLog = document.getElementById("messageLog");
let boton = document.getElementById("button");
let user;

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
    socket.emit("newUser", user);
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
    Swal.fire({
      text: `Se conectó ${data}`,
      toast: true,
      position: "top-right",
      timer: 2000,
    });
  });