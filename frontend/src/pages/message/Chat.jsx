import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { FaArrowLeft } from "react-icons/fa6";
import { FiAlertCircle } from "react-icons/fi";
import { Link, useParams, useNavigate } from "react-router-dom";
import { IoSend } from "react-icons/io5";
import { GrGallery } from "react-icons/gr";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Chat = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);
  const [message, setMessage] = useState("");
  const [chatList, setChatList] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:5000", { 
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Socket connection handlers
    socketRef.current.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error("Connection error. Please try again.");
    });

    // Fetch chat details and receiver info
    const fetchChatDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/chats/${id}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch chat details");
        }
        const data = await res.json();
        setReceiver(data.receiver);
        setChatList(data.messages || []);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching chat details:", error);
        toast.error("Failed to load chat history");
      }
    };

    fetchChatDetails();

    // Join room
    if (socketRef.current) {
      socketRef.current.emit("joinRoom", id);
    }

    // Listen for new messages
    socketRef.current.on("receiveMessage", (newMessage) => {
      setChatList(prev => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(msg => 
          msg._id === newMessage._id || 
          (msg.sender === newMessage.sender && 
           msg.text === newMessage.text && 
           msg.createdAt === newMessage.createdAt)
        );
        
        if (!messageExists) {
          return [...prev, newMessage];
        }
        return prev;
      });
      scrollToBottom();
    });

    socketRef.current.on("messageError", (error) => {
      console.error("Message error:", error);
      toast.error("Failed to send message");
      setIsSending(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  // Scroll to bottom when chat list updates
  useEffect(() => {
    scrollToBottom();
  }, [chatList]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Not connected to chat server");
      return;
    }
    
    if (message.trim() !== "" && socketRef.current && !isSending) {
      setIsSending(true);
      const messageData = {
        roomId: id,
        sender: authUser._id,
        receiver: receiver._id,
        text: message.trim(),
        image: "",
        video: "",
      };

      try {
        socketRef.current.emit("sendMessage", messageData);
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
      } finally {
        setIsSending(false);
      }
    }
  };

  const extractPostId = (text) => {
    const match = text.match(/\[postId:([^\]]+)\]/);
    return match ? match[1] : null;
  };

  const handlePostClick = (postId) => {
    navigate(`/postpage/${postId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header - Instagram style */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Link to="/message" className="text-black">
          <FaArrowLeft className="text-xl" />
        </Link>
        <img
          src={receiver?.profileImg || "/avatar-placeholder.png"}
          alt={receiver?.username}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="font-medium">{receiver?.username}</span>
        {isConnected && <span className="w-2 h-2 rounded-full bg-green-500 ml-auto"></span>}
      </div>

      {/* Messages - Instagram style */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {chatList.map((msg, index) => {
          const postId = extractPostId(msg.text);
          const isSharedPost = postId !== null;
          
          return (
            <div
              key={msg._id || index}
              className={`flex ${msg.sender._id === authUser._id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[70%] ${msg.sender._id === authUser._id ? 'flex-row-reverse' : ''}`}>
                {msg.sender._id !== authUser._id && (
                  <img
                    src={msg.sender.profileImg || "/avatar-placeholder.png"}
                    alt={msg.sender.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div className="flex flex-col gap-1">
                  <div
                    className={`p-3 break-words ${
                      msg.sender._id === authUser._id
                        ? 'bg-blue-500 text-white rounded-l-2xl rounded-tr-2xl'
                        : 'bg-gray-100 rounded-r-2xl rounded-tl-2xl'
                    }`}
                  >
                    <p className="text-sm">{msg.text.replace(/\[postId:[^\]]+\]/, '')}</p>
                    
                    {isSharedPost && (
                      <div 
                        className="mt-2 cursor-pointer"
                        onClick={() => handlePostClick(postId)}
                      >
                        {msg.image ? (
                          <img 
                            src={msg.image} 
                            alt="Shared post" 
                            className="max-w-full rounded-lg"
                          />
                        ) : msg.video ? (
                          <video 
                            src={msg.video} 
                            className="max-w-full rounded-lg"
                          />
                        ) : (
                          <div className="bg-gray-200 p-4 rounded-lg text-center">
                            <p>Click to view post</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Instagram style */}
      <div className="border-t p-4">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isConnected || isSending}
            className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:border-blue-500 text-sm
                     disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={!isConnected || !message.trim() || isSending}
            className={`text-blue-500 px-4 font-medium disabled:opacity-50`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
