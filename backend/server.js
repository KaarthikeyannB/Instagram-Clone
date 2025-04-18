import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import connectDB from "./db/connectDB.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import notficationRoute from "./routes/notification.route.js";
import chatRoute from "./routes/chat.route.js";
import Chat from "./model/chat.model.js";
import Message from "./model/message.model.js";


dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
})

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
//socket

const io = new Server(server,{
  cors: {
    origin: "http://localhost:5173",  // React frontend URL
    credentials: true,
  }
})

io.on("connection", (socket) => {
  console.log("A user is connected", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", async ({ roomId, sender, receiver, text, image, video }) => {
    try {
      // Find the chat
      const chat = await Chat.findById(roomId);
      if (!chat) {
        throw new Error("Chat not found");
      }

      // Create and save the new message
      const newMessage = new Message({
        chatId: chat._id,
        sender,
        text,
        image,
        video
      });

      const savedMessage = await newMessage.save();
      
      // Update the chat's last message
      chat.lastMessage = text;
      chat.lastMessageTime = new Date();
      await chat.save();
      
      // Populate sender details
      const populatedMessage = await Message.findById(savedMessage._id)
        .populate('sender', 'username profileImg');
      
      // Emit the saved message to all users in the room
      io.to(roomId).emit("receiveMessage", populatedMessage);
      
      console.log(`Message sent in room ${roomId}`);
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("messageError", { error: "Failed to save message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});


app.use(cors({
  origin:"http://localhost:5173",
  credentials:true,
}));
app.use(express.json(
  {
    limit:"50mb",
  }
));
app.use(express.urlencoded({limit: '50mb', extended: true }));
app.use(cookieParser());

app.use("/api/auth",authRoute);
app.use("/api/users",userRoute);
app.use("/api/posts",postRoute);
app.use("/api/notifications",notficationRoute);
app.use("/api/chats",chatRoute);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // Use the correct path to the frontend dist directory
  const frontendPath = path.join(__dirname, "/frontend/dist");
  
  // Serve static files from the React app
  app.use(express.static(frontendPath));
  
  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
  
  // This is the catch-all route for client-side routing
  app.get("/:path", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}
server.timeout = 300000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
