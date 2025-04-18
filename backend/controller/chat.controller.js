import Chat from "../model/chat.model.js";
import Message from "../model/message.model.js";
import User from "../model/user.model.js";
import Post from "../model/post.model.js";

export const getChats = async (req, res) => {
  try {
    const { sender, receiver } = req.params;
    const messages = await Message.find({
      chatId: req.params.chatId
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username profileImg');

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getChats controller:", error.message);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const getAllChats = async(req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ error: "User not found" });
        }

        const chats = await Chat.find({
            participants: userId
        })
        .sort({ lastMessageTime: -1 })
        .populate('participants', 'username profileImg');

        // Format the response
        const formattedChats = chats.map(chat => {
            const otherParticipant = chat.participants.find(
                p => p._id.toString() !== userId.toString()
            );
            return {
                _id: chat._id,
                lastMessage: chat.lastMessage,
                lastMessageTime: chat.lastMessageTime,
                user: otherParticipant
            };
        });

        res.status(200).json(formattedChats);
    } catch (error) {
        console.log("Error in getAllChats controller:", error.message);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

export const getChatById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Find the chat
        const chat = await Chat.findOne({
            _id: id,
            participants: userId
        }).populate('participants', 'username profileImg');

        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        // Get all messages for this chat
        const messages = await Message.find({
            chatId: chat._id
        })
        .sort({ createdAt: 1 })
        .populate('sender', 'username profileImg');

        // Get the other participant's details
        const receiver = chat.participants.find(
            p => p._id.toString() !== userId.toString()
        );

        res.status(200).json({
            messages,
            receiver
        });
    } catch (error) {
        console.log("Error in getChatById controller:", error.message);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

export const createChat = async (req, res) => {
    try {
        const { receiver } = req.body;
        const sender = req.user._id;

        // Check if chat already exists
        const existingChat = await Chat.findOne({
            participants: { $all: [sender, receiver] }
        });

        if (existingChat) {
            return res.status(200).json(existingChat);
        }

        // Create a new chat
        const newChat = new Chat({
            participants: [sender, receiver],
            lastMessage: "",
            lastMessageTime: new Date()
        });

        await newChat.save();
        
        // Populate the chat with participant details before sending response
        const populatedChat = await Chat.findById(newChat._id)
            .populate('participants', 'username profileImg');

        res.status(201).json(populatedChat);
    } catch (error) {
        console.log("Error in createChat controller:", error.message);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

export const shareChat = async(req,res)=>{
    try {
        const { userIds, postId } = req.body;
        const sender = req.user._id;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: "Please select at least one user to share with" });
        }

        if (!postId) {
            return res.status(400).json({ error: "Post ID is required" });
        }


        const post = await Post.findById(postId).populate('user', 'username profileImg');
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const results = [];

        for (const receiverId of userIds) {
            
            let chat = await Chat.findOne({
                participants: { $all: [sender, receiverId] }
            });

            if (!chat) {
                chat = new Chat({
                    participants: [sender, receiverId],
                    lastMessage: "Shared a post",
                    lastMessageTime: new Date()
                });
                await chat.save();
            }

            const message = new Message({
                chatId: chat._id,
                sender,
                text: `Shared a post from ${post.user.username} [postId:${postId}]`,
                image: post.image || "",
                video: post.video || ""
            });

            await message.save();

           
            chat.lastMessage = `Shared a post from ${post.user.username}`;
            chat.lastMessageTime = new Date();
            await chat.save();

            results.push({
                chatId: chat._id,
                messageId: message._id
            });
        }

        res.status(200).json({ 
            message: "Post shared successfully",
            results 
        });
    } catch (error) {
        console.log("Error in shareChat controller:", error.message);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};