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

import initializeSocket from "./socket/socket.js";

dotenv.config();

connectDB();

const app = express();

const server = http.createServer(app);

initializeSocket(server);





app.use(cors());

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