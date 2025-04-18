import Notification from "../model/notification.model.js";
import Post from "../model/post.model.js";
import User from "../model/user.model.js";
import cloudinary from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text, descriptions, hashtags } = req.body;
    let { image, video } = req.body;
    const userId = req.user._id;
    let img = "";
    let vid = "";

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!text && !image && !video) return res.status(400).json({ error: "Please provide text, image, or video" });

    if (image) {
      try {
        const uploadedResponse = await cloudinary.v2.uploader.upload(image);
        img = uploadedResponse.secure_url;
      } catch (err) {
        console.error("Image upload failed:", err);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    if (video) {
      try {
        const uploadedResponse = await cloudinary.v2.uploader.upload_large(video, { resource_type: "video" });
        vid = uploadedResponse.secure_url;
      } catch (err) {
        console.error("Video upload failed:", err);
        return res.status(500).json({ error: "Video upload failed" });
      }
    }

    const newPost = new Post({
      user: userId,
      text,
      image: img,
      video: vid,
      descriptions: descriptions ? [descriptions] : [],
      hashtags: hashtags ? [hashtags] : [],
    });

    await newPost.save();
    res.status(201).json(newPost);

  } catch (error) {
    console.error("Error in createPost controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.likes.includes(userId)) {
      //unlike
      await Post.updateOne({ _id: id }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: id } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(200).json(updatedLikes);
    } else {
      //like
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: id } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in likePost controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!text) {
      return res.status(400).json({ error: "Please provide text" });
    }

    const comment = { text, user: userId };
    post.comments.push(comment);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in commentPost controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (post.image) {
      const imgId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    if (post.video) {
      const videoId = post.video.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(videoId);
    }
    await Post.deleteOne({ _id: id });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const savePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isSaved = user.saved.map(String).includes(id);

    if (isSaved) {
      // unsave
      await Post.updateOne({ _id: id }, { $pull: { saved: userId } });
      await User.updateOne({ _id: userId }, { $pull: { saved: id } });
    } else {
      // save
      await Post.updateOne({ _id: id }, { $push: { saved: userId } });
      await User.updateOne({ _id: userId }, { $push: { saved: id } });
    }

    // Get the updated post with the new saved array
    const updatedPost = await Post.findById(id);
    
    return res.status(200).json({
      message: isSaved ? "Post unsaved successfully" : "Post saved successfully",
      saved: updatedPost.saved
    });
  } catch (error) {
    console.log("Error in savePost controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const savedPosts = await User.findById(userId)
      .populate({
        path: "saved",
        populate: {
          path: "user",
          select: "-password",
        },
      })
      .populate({
        path: "saved",
        populate: {
          path: "comments.user",
          select: "-password",
        },
      });

    if (savedPosts.saved.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(savedPosts);
  } catch (error) {
    console.log("Error in getSavedPosts controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getLikedPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    return res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getLikedPost controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserPost = async (req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username});
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});
		res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getUserPost controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const viewPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Validate postId
    if (!postId || !postId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }
    
    const post = await Post.findById(postId)
      .populate({
        path: 'user',
        select: '-password' // This will include all user fields except password
      })
      .populate({
        path: 'comments.user',
        select: '-password'
      });
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    return res.status(200).json(post);
  } catch (error) {
    console.log("Error in viewPost controller", error.message);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
