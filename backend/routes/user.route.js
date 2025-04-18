import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { followUnfollow, getAllFollowers, getAllFollowings, getAllUsers, getProfile, getSuggestions, updateHighlights, updateNote, updateProfile, updateStory } from "../controller/user.controller.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get("/profile/:username",protectRoute,getProfile);
router.post("/follow/:id",protectRoute,followUnfollow);
router.get("/suggestions",protectRoute,getSuggestions);
router.post("/update",protectRoute,updateProfile);

router.post("/updatenote",protectRoute,upload.array("notes"),updateNote);
router.post("/updatestory",protectRoute ,upload.array("story"), updateStory);
router.post("/updatehighlights",protectRoute,updateHighlights);
router.get("/getfollowers",protectRoute,getAllFollowers);
router.get("/getfollowing",protectRoute,getAllFollowings);
router.get("/alluser",protectRoute,getAllUsers);


export default router;