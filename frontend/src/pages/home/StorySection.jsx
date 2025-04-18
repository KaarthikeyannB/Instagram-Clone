import React from "react";
import { IoMdAddCircle } from "react-icons/io";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const StorySection = () => {

  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(["authUser"]);

  const navigate = useNavigate();
  const hasStories = user?.story && Array.isArray(user.story) && user.story.length > 0;

  const seeStory = (storyOwner) => {
    if (storyOwner?.story && Array.isArray(storyOwner.story) && storyOwner.story.length > 0) {
      navigate("/viewstory", { state: { storyOwner } });
    } else {
      toast.error("No stories available to view");
    }
  };

  
  return (
    <div className="flex gap-2 h-21 items-center mx-2">
      <div className="flex gap-0 flex-col items-center">
        <div className="relative">
          <img
            src={user?.profileImg || "/avatar-placeholder.png"}
            alt="Story"
            className={`w-14 h-14 rounded-full border-2 ${hasStories ? 'border-blue-500' : 'border-gray-300'}`}
            onClick={()=>seeStory(user)}
          />
          <span className="absolute bottom-0 right-0 text-blue-600 bg-white rounded-full">
            <IoMdAddCircle size={20} />
          </span>
        </div>
        <h1 className="text-sm">Your Story</h1>
      </div>

      {user?.followers?.length > 0
        ? user.followers
            .filter((follower) => follower?.story) 
            .map((follower) => (
              <div
                key={follower._id}
                className="flex gap-0 flex-col items-center"
                onClick={()=>seeStory(follower)}
              >
                <div className="relative">
                  <img
                    src={follower?.profileImg || "/avatar-placeholder.png"}
                    alt="Story"
                    className="w-14 h-14 rounded-full border-2 border-white"
                  />
                </div>
                <h1 className="text-sm">{follower?.username}</h1>
              </div>
            ))
        : null}
    </div>
  );
};

export default StorySection;
