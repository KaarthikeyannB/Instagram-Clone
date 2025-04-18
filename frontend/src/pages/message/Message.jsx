import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { BsChatRightTextFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import Notes from "./Notes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Chats from "./Chats";
import { baseUrl } from "../../constant/url";
import FollowersList from "./FollowersList";

const Message = () => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(["authUser"]);
  const navigate = useNavigate();
  const [showFollowers, setShowFollowers] = useState(false);

  const {data:chats,isPending} = useQuery({
    queryKey:["chats"],
    queryFn:async()=>{
      try {
        const res = await fetch(`${baseUrl}/api/chats/all`,{
          method:"GET",
          credentials:"include",
          headers:{
            "Content-Type":"application/json",
          }
        });
        const responseData = await res.json();
        if(!res.ok){
          throw new Error(responseData.message || "Something went wrong");
        }
        return responseData;
      }
      catch (error) {
        throw new Error(error);
      }
    },
  });

  const follower = queryClient.getQueryData(["followers"]);

  const {mutate:startChat,isPending:startChatPending } = useMutation({
    mutationFn: async (userId) => {
      try {
         const res = await fetch(`${baseUrl}/api/chats/create`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ receiver: userId }),
              });
        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.error || 'Failed to create chat');
        }
        return responseData;
      } catch (error) {
        throw new Error(error);
      }
    }
  });

  if (showFollowers) {
    return <FollowersList />;
  }

  return (
    <div className="min-h-screen mx-3">
      {/* Header part of search*/}
      <div className="flex justify-between items-center p-2">
        <Link to='/'><FaArrowLeft className="text-3xl" /></Link>
        <h1 className="text-2xl font-semibold">{user?.username}</h1>
        <HiOutlinePencilSquare className="text-3xl" />
      </div>
      {/* Notes part*/}
      <Notes/>
      {/* Message part*/}
      <div className="flex flex-col mt-3">
        <div className="flex justify-between">
          <p className="font-semibold text-xl">Messages</p>
          <button className="text-blue-500">Requests</button>
        </div>
        <div className="flex flex-col mt-4 w-full border-b">
          {isPending ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : !chats || chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <BsChatRightTextFill className="text-3xl text-gray-400" />
              </div>
              <p className="text-gray-500 text-center">No messages yet</p>
              <button 
                onClick={() => setShowFollowers(true)} 
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start a New Chat
              </button>
            </div>
          ) : (
            chats?.map(chat => (
              <Chats 
                key={chat._id} 
                chat={{
                  ...chat,
                  timestamp: chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                }}
              />
            ))
          )}
        </div>

        <div className="fixed bottom-18 right-6">
          <button 
            onClick={() => setShowFollowers(true)}
            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
          >
            <BsChatRightTextFill className="text-2xl"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Message;
