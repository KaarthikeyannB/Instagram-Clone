import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { commentPost, createPost, deletePost, getAllPosts, getLikedPost, getSavedPosts, getUserPost, likePost, savePost, viewPost } from "../controller/post.controller.js";
import multer from "multer";

const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage: storage });

const upload = uploadMiddleware.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);

const router = express.Router();

router.post('/create', protectRoute,upload, createPost);
router.post("/like/:id",protectRoute,likePost);
router.post("/comment/:id",protectRoute,commentPost);
router.delete("/:id",protectRoute,deletePost);
router.get("/post/:postId",protectRoute,viewPost);

router.get("/all",protectRoute,getAllPosts);
router.post("/save/:id",protectRoute,savePost);
router.get("/savedpost",protectRoute,getSavedPosts);
router.get("/likedpost",protectRoute,getLikedPost);
router.get("/user/:username",protectRoute,getUserPost);

export default router;