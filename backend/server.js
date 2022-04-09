const express = require("express");
const cors = require("cors");
const connectToDB = require("./config/db");
const userRouter = require("./routes/userRoutes");
const chatRouter = require("./routes/chatRoutes");
const messageRouter = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
// const mongoose = require("mongoose");

const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

connectToDB();

app.use(cors());
app.use(express.json());
//app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/users", userRouter);
app.use("/chats", chatRouter);
app.use("/messages", messageRouter);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`My backend is listening at http://localhost:${port}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    // origin: "http://localhost:3000",
  },
});
let users = [];
const addUser = (userData, socketId) => {
  !users.some((user) => user._id === userData._id) &&
    users.push({ ...userData, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((u) => u.socketId !== socketId);
};
io.on("connection", (socket) => {
  console.log("Connect to socket" + socket.id);

  socket.on("getOnline", (userData) => {
    addUser(userData, socket.id);
    io.emit("onlineUser", users);
  });

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log("setup done!");
    // users.push(userData);
    // socket.emit("connected", users);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
    console.log("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
    console.log("stop typing");
  });

  socket.on("new message", (message) => {
    var chat = message.chat;
    console.log("sending message");
    chat.users.forEach((user) => {
      if (user._id == message.sender._id) return;
      socket.in(user._id).emit("message received", message);
    });
  });

  socket.on("disconnect", () => {
    console.log("disconnecting" + socket.id);
    removeUser(socket.id);
    io.emit("onlineUser", users);
  });
});
