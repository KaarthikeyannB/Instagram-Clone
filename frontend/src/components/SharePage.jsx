import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { baseUrl } from '../constant/url';
import { toast } from 'react-hot-toast';

const SharePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const postToShare = location.state?.post;
  const [selectedUsers, setSelectedUsers] = useState([]);

  const authUser = queryClient.getQueryData(['authUser']);

  const { data: followers, isLoading: followersLoading } = useQuery({
    queryKey: ['followers'],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/users/getfollowers`, {
        method: 'GET',
        credentials: 'include',
        headers:{
          'Content-Type': 'application/json',
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });

  const { data: following, isLoading: followingLoading } = useQuery({
    queryKey: ['following'],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/users/getfollowing`, {
        method:"GET",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    enabled: !!authUser?._id,
  });

  const { mutate: sharePost, isPending } = useMutation({
    mutationFn: async ({ userIds, postId }) => {
      const res = await fetch(`${baseUrl}/api/chats/sharepost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userIds, postId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success('Post shared successfully');
      navigate('/');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleShare = () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user to share with');
      return;
    }
    sharePost({ userIds: selectedUsers, postId: postToShare._id });
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handlePostClick = () => {
    navigate(`/postpage/${postToShare._id}`);
  };

  if (!postToShare) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No post selected to share</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex items-center border-b p-2">
        <IoIosArrowBack 
          className="text-2xl cursor-pointer" 
          onClick={() => navigate(-1)}
        />
        <h1 className="text-xl font-semibold ml-4">Share to...</h1>
      </div>

      {/* Post Preview */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <img 
            src={postToShare.user?.profileImg || "/avatar-placeholder.png"} 
            alt={postToShare.user?.username}
            className="w-8 h-8 rounded-full"
          />
          <span className="font-medium">{postToShare.user?.username}</span>
        </div>
        <div 
          className="cursor-pointer"
          onClick={handlePostClick}
        >
          {postToShare.image ? (
            <img 
              src={postToShare.image} 
              alt="Post preview" 
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : postToShare.video ? (
            <video 
              src={postToShare.video} 
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No media</p>
            </div>
          )}
          <p className="mt-2 text-sm">{postToShare.text}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Followers</h2>
          {followersLoading ? (
            <p>Loading followers...</p>
          ) : followers?.length === 0 ? (
            <p className="text-gray-500">No followers</p>
          ) : (
            <div className="space-y-2">
              {followers?.map((user) => (
                <div 
                  key={user._id}
                  className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleUserSelection(user._id)}
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={user.profileImg || "/avatar-placeholder.png"} 
                      alt={user.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <span>{user.username}</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => {}}
                    className="h-4 w-4"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Following</h2>
          {followingLoading ? (
            <p>Loading following...</p>
          ) : following?.length === 0 ? (
            <p className="text-gray-500">Not following anyone</p>
          ) : (
            <div className="space-y-2">
              {following?.map((user) => (
                <div 
                  key={user._id}
                  className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleUserSelection(user._id)}
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={user.profileImg || "/avatar-placeholder.png"} 
                      alt={user.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <span>{user.username}</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => {}}
                    className="h-4 w-4"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleShare}
          disabled={isPending || selectedUsers.length === 0}
          className={`w-full py-2 rounded-lg ${
            isPending || selectedUsers.length === 0
              ? 'bg-gray-300'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-semibold`}
        >
          {isPending ? 'Sharing...' : 'Share'}
        </button>
      </div>
    </div>
  );
};

export default SharePage;