import Otp from "../model/otp.model.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import generateToken from "../utils/generateToken.js";

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    await Otp.deleteMany({ email });
    await new Otp({ email, otp: otpCode, expiresAt }).save();
    
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your app password (not your regular Gmail password)
      },
    });
    
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>OTP Verification</h2>
          <p>Use the following OTP to verify your account. This OTP will expire in 5 minutes.</p>
          <h1 style="font-size: 32px; background-color: #f0f0f0; padding: 10px; text-align: center;">${otpCode}</h1>
          <p>Expires at: ${new Date(expiresAt).toLocaleString()}</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
      `,
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.log("Error in OTP controller", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (otpRecord.used) {
      return res.status(400).json({ msg: "OTP already used" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    otpRecord.used = true;
    await otpRecord.save();

    res.status(200).json({ msg: "OTP verified successfully" });
  } catch (error) {
    console.log("Error in Otp controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const signup = async (req, res) => {
  try {
    const { email,username,name,password} = req.body;

    if(!email || !username || !name || !password){
        return res.status(400).json({ message: "Some fields are Missing" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    //Verify whether the email is verified within 30 mins
    const otpRecord = await Otp.findOne({ email , used: true,expiresAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) } });

    if (!otpRecord) {
      return res.status(400).json({ message: "Email is not verified within 30 minutes so Verify again" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    if(password.length < 8){
        return res.status(400).json({ message: "Password must be at least 8 characters long" });    
    }    

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        email,
        username,
        name,
        password: hashedPassword
    })

    if(user){
        generateToken(user._id,res);
        await user.save();
        res.status(201).json({ message: "User created successfully" });
    }
    else{
        res.status(400).json({ error: "Invalid user data" });
    }


  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email});
        if (!user) {
          return res.status(400).json({ message: "Invalid credentials (user not found)" });
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!email || !isPasswordCorrect){
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id,res);
        res.status(200).json({ message: "Login successful" });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt","",{maxAge:0});
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getMe = async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
      .populate({
        path: "followers",
        select: "username profileImg notes story"
      })
      .populate({
        path: "followings",
        select: "username profileImg notes story"
      });
    
        if(!user){  
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};