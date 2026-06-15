const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" }
  });

  io.on("connection", (socket) => {
    socket.on("joinCity", (city) => socket.join(`city:${city}`));
    socket.on("disconnect", () => {});
  });
}

function emitToCity(city, event, data) {
  if (io) io.to(`city:${city}`).emit(event, data);
}

module.exports = { initSocket, emitToCity };