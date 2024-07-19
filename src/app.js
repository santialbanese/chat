import { v4 as uuid } from "uuid";
import express from "express";
import handlebars from "express-handlebars";
import _dirname from "./dirname.js";
import viewRoutes from "./routes/views.routes.js";
import { Server } from "socket.io";

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", handlebars.engine());
app.set("views", _dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static("public"));

app.use("/", viewRoutes);

const httpServer = app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
}); 

const io = new Server(httpServer);

let messages = [];

let conectados = [];

io.on("connection", (socket) => {
    console.log(`Nuevo usuario con el id: ${socket.id} conectado`);

    socket.on("newUser", (data) => { 
        socket.broadcast.emit("newUser", data); 
        const user = {
          id: socket.id,
          user: data
        }
        conectados.push(user);
        io.emit("conectados", conectados);
    })


    socket.on("message", (data) => { 
        messages.push(data);
        io.emit("messageLog", messages)
    })

    //evento de socket.io
    socket.on('disconnect', () => {
      socket.broadcast.emit('userDisconnected', 'Un usuario se ha desconectado');
      const userIndex = conectados.findIndex(user => user.id === socket.id);
        if (userIndex !== -1) {
            const [user] = conectados.splice(userIndex, 1);
            socket.broadcast.emit('userDisconnected', `${user.user} se ha desconectado`);
        }
        io.emit("conectados", conectados);
    });

    //escribiendo
    socket.on("typing", (user) => {
        socket.broadcast.emit("typing", user);
      });
    
      socket.on("stopTyping", () => {
        socket.broadcast.emit("stopTyping");
      });
})
