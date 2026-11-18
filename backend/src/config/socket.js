const { Server } = require("socket.io");

let io;

function getAllowedOrigins() {
  return (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinCity", (city) => {
      if (typeof city === "string" && city.trim()) {
        socket.join(`city:${city.trim()}`);
      }
    });
  });
}

function emitToCity(city, event, data) {
  if (io && city) io.to(`city:${city}`).emit(event, data);
}

module.exports = { initSocket, emitToCity };
