import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getAllChats, getChats, getChatById, createChat, shareChat } from "../controller/chat.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllChats);
router.get("/:id", protectRoute, getChatById);
router.get("/:sender/:receiver", protectRoute, getChats);

router.post("/create", protectRoute, createChat);
router.post("/sharepost",protectRoute,shareChat);

export default router;