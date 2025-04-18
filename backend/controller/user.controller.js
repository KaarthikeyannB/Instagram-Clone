import User from "../model/user.model.js";
import Notification from "../model/notification.model.js";
import cloudinary from "cloudinary";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getProfile controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const followUnfollow = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (!user || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }

    const isFollowing = currentUser.followings.includes(id);
    if (isFollowing) {
      //unfollow
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { followings: id } });

      res.status(200).json({ message: "Unfollow successful" });
    } else {
      //follow
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { followings: id } });
      //send notification

      const newNotification = new Notification({
        from: req.user._id,
        to: id,
        type: "follow",
      });
      await newNotification.save();

      res.status(200).json({ message: "Follow successful" });
    }
  } catch (error) {
    console.log("Error in followUnfollow controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const combinedIds = [...user.followers, ...user.followings];

    // Find users who are either followers or following of the current user
    const networkUsers = await User.find({ _id: { $in: combinedIds } });

    let suggestedFollowersOfNetwork = new Set();

    for (const networkUser of networkUsers) {
      // Find followers of each network user
      const followersOfNetworkUser = await User.find({
        _id: { $in: networkUser.followers },
        _id: { $ne: userId }, // Exclude the current user
        _id: { $nin: combinedIds }, // Exclude users already followed or following
      }).select("_id");
      followersOfNetworkUser.forEach((follower) =>
        suggestedFollowersOfNetwork.add(follower._id)
      );

      // Find followings of each network user (if you want to include them)
      const followingsOfNetworkUser = await User.find({
        _id: { $in: networkUser.followings },
        _id: { $ne: userId }, // Exclude the current user
        _id: { $nin: combinedIds }, // Exclude users already followed or following
      }).select("_id");
      followingsOfNetworkUser.forEach((following) =>
        suggestedFollowersOfNetwork.add(following._id)
      );
    }

    const suggestedUsersFromNetwork = await User.find({
      _id: { $in: [...suggestedFollowersOfNetwork] },
    }).select("-password");

    const excludeIds = [...combinedIds, userId, ...suggestedFollowersOfNetwork];

    const randomUsers = await User.aggregate([
      {
        $match: {
          _id: { $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(id)) },
        },
      },
      { $sample: { size: 10 } },
      { $project: { password: 0 } },
    ]);

    const finalSuggestions = [...suggestedUsersFromNetwork, ...randomUsers];

    res.status(200).json(finalSuggestions);
  } catch (error) {
    console.log("Error in getSuggestions controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const { username, name, bio, currentpassword, newpassword, link } =
      req.body;
    let { profileImg, highlights, story, notes } = req.body;
    const userId = req.user._id;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (
      (currentpassword && !newpassword) ||
      (!currentpassword && newpassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }

    if (currentpassword && newpassword) {
      const isMatch = await bcrypt.compare(currentpassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newpassword, salt);
      user.password = hashedPassword;
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploaderResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploaderResponse.secure_url;
    }

    user.name = name || user.name;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;

    user = await user.save();
    user.password = null;
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateNote = async (req, res) => {
  try {
    const files = req.files;
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No note files provided" });
    }
    
    
    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { 
            resource_type: "raw",
            timeout: 120000 // 2 minutes timeout
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    });
    
    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url);
      
      user.notes = [...user.notes, ...validUrls];
      await user.save();
      
      res.status(200).json({ 
        message: "Notes uploaded successfully", 
        notes: user.notes 
      });
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      res.status(500).json({ error: "Error uploading to cloud storage" });
    }
    
  } catch (error) {
    console.error("Error in updateNote controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateStory = async (req, res) => {
  try {
    const files = req.files;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No story files provided" });
    }

    // Initialize story array if it doesn't exist
    if (!user.story) {
      user.story = [];
    }

    // Upload and append new stories
    for (const file of files) {
      try {
        console.log("Uploading to Cloudinary...");
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            { 
              resource_type: "auto",
              folder: "instagram_stories"
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        if (!result?.secure_url) {
          throw new Error("No secure URL received from Cloudinary");
        }

        // Add the new story to the beginning of the array
        user.story.unshift(result.secure_url);
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(500).json({
          error: "Failed to upload media to cloud storage",
          details: err.message,
        });
      }
    }

    // Keep only the last 24 hours of stories
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    user.story = user.story.slice(0, 10); // Keep maximum 10 stories

    await user.save();
    res.status(200).json({
      message: "Story uploaded successfully",
      story: user.story,
    });
  } catch (error) {
    console.error("Error in updateStory controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const updateHighlights = async (req, res) => {
  try {
    const { highlights } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (highlights && highlights.length > 0) {
      user.highlights = [];
      for (const highlight of highlights) {
        const uploaded = await cloudinary.uploader.upload(highlight, {
          resource_type: "auto",
        });
        user.highlights.push(uploaded.secure_url);
      }
    }
  } catch (error) {
    console.log("Error in updateHighlights controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllFollowers = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const allFollowers = await User.find({
      _id: { $in: user.followers },
    }).select("-password");
    res.status(200).json(allFollowers);
  } catch (error) {
    console.log("Error in getallfollwer controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllFollowings = async (req,res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({ error: "User not found" });
    }

    const allFollowings = await User.find({
      _id: { $in: user.followings },
    }).select("-password");
    res.status(200).json(allFollowings);
  } catch (error) {
    console.log("Error in getallfollwer controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const ids = await User.find({}, "username profileImg name");
    res.status(200).json(ids);
  } catch (error) {
    console.log("Error in getAllUsers controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};