require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Add a strong secret to the backend environment.");
  }

  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`SafeHood API listening on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("SafeHood startup failed:", error.message);
  process.exit(1);
});
