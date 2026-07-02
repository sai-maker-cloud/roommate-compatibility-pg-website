import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import pgRoutes from "./routes/pgRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

import initializeSocket from "./socket/socket.js";
import { setBookingIO } from "./controllers/bookingController.js";

dotenv.config();

connectDB();

const app = express();

const server = http.createServer(app);

const io = initializeSocket(server);
setBookingIO(io);






app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));





app.get("/", (req, res) => {
  res.json({
    message: "RoomMateAI Backend Running"
  });
});





app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/matches",
  matchRoutes
);

app.use(
  "/api/pg",
  pgRoutes
);

app.use(
  "/api/bookings",
  bookingRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/conversations",
  conversationRoutes
);

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(
  "/api/messages",
  messageRoutes
);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
  });
}





app.use((err, req, res, next) => {

  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Server Error"
  });

});



const PORT =
process.env.PORT || 5000;



server.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);
