const socket = io();

let message = document.getElementById("message");
let messageLog = document.getElementById("messageLog");
let boton = document.getElementById("button");
let escribiendo = document.getElementById("estaEscribiendo")
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





message.addEventListener("keyup", (data) => { 
    if(data.key === "Enter" && message.value.trim().length > 0){
        socket.emit("message", {user: user, mensaje: message.value})
        message.value = "";
    }
}) 

boton.addEventListener("click", () => { 
    if(message.value.trim().length > 0){
        socket.emit("message", {user: user, mensaje: message.value})
        message.value = ""; 
    }
})




message.addEventListener("input", () => {
    socket.emit("typing", user);
});

let timeout;
message.addEventListener("input", () => {
    socket.emit("typing", user);
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        socket.emit("stopTyping", user);
    }, 1000);
});

socket.on("typing", (data) => {
    escribiendo.innerText = `${data} está escribiendo...`;
});

socket.on("stopTyping", (data) => {
    escribiendo.innerText = "";
});




socket.on("messageLog", (data) => { 
    let messages = ""; 

    data.forEach((userMessage) => {
        if(userMessage.user === user){ 
            const msj = "Yo"
            messages = messages + ` ${msj} : ${userMessage.mensaje} </br>`
        }else
        messages = messages + ` ${userMessage.user} : ${userMessage.mensaje} </br>`
    }); 

    messageLog.innerHTML = messages;
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