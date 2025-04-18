import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { baseUrl } from '../../constant/url';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const FollowersList = () => {
  const navigate = useNavigate();

  const { data: followers, isLoading } = useQuery({
    queryKey: ['followers'],
    queryFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/users/getfollowers`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch followers');
        }
        return data;
      } catch (error) {
        console.error('Error fetching followers:', error);
        throw error;
      }
    },
  });

  const startChat = async (userId) => {
    try {
      // Create a new chat with the selected user
      const res = await fetch(`${baseUrl}/api/chats/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiver: userId }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create chat');
      }
      
      // Navigate to the chat page
      navigate(`/chats/${data._id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 w-full p-2 border-b bg-white">
        <Link to="/message">
          <FaArrowLeft className="text-3xl" />
        </Link>
        <h1 className="text-xl font-semibold">Start a New Chat</h1>
      </div>

      {/* Followers List */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : followers && followers.length > 0 ? (
          <div className="flex flex-col gap-4">
            {followers.map((follower) => (
              <div 
                key={follower._id} 
                className="flex items-center justify-between p-2 border-b"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={follower.profileImg || "/avatar-placeholder.png"}
                    alt={follower.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h2 className="font-semibold">{follower.username}</h2>
                    <p className="text-sm text-gray-500">{follower.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => startChat(follower._id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Message
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <p className="text-gray-500">No followers found</p>
            <p className="text-sm text-gray-400">Follow people to start chatting with them</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowersList; 