import express from "express";
import { getMe, login, logout, sendOtp, signup, verifyOtp } from "../controller/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/sendotp",sendOtp);
router.post("/verifyotp",verifyOtp);
router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);
//To authenticate which user is logged in
router.get("/me",protectRoute,getMe);

export default router;