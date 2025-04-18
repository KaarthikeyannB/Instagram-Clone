import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
const protectRoute = async(req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({ error: "Unauthorized : Invalid token " });
        }        

        const user = await User.findOne({ _id: decoded.userId }).select("-password");
        if(!user){
            return res.status(401).json({ error: "Unauthorized : User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default protectRoute;