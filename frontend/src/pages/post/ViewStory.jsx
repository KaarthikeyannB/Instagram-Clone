import { useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect, useRef } from "react";
import { FaRegHeart } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { GoUnmute } from "react-icons/go";
import { BsThreeDots } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate ,useLocation} from "react-router-dom";
import { BiVolumeMute } from "react-icons/bi";
import { toast } from "react-hot-toast";

const IMAGE_DURATION = 10000; // 10 seconds for images

const ViewStory = () => {
  const queryClient = useQueryClient();
  
  const location = useLocation();
  const storyOwner = location.state?.storyOwner;

  const authUser = storyOwner;

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressInterval = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [mute, setMute] = useState(false);

  // Check if user has stories
  const hasStories = authUser?.story && Array.isArray(authUser.story) && authUser.story.length > 0;

  // Redirect to home if no stories
  useEffect(() => {
    if (!hasStories) {
      toast.error("No stories available to view");
      navigate("/");
      return;
    }
  }, [hasStories, navigate]);

  // If no stories, don't render anything while redirecting
  if (!hasStories) {
    return null;
  }

  const currentStory = authUser.story[currentStoryIndex];
  const isVideo = currentStory?.match(/\.(mp4|webm|ogg)$/i);

  // Handle story timing and progression
  useEffect(() => {
    if (!currentStory) return;

    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    setProgress(0);

    // Handle video stories
    if (isVideo && videoRef.current) {
      const video = videoRef.current;
      
      const handleVideoProgress = () => {
        if (!video.duration) return;
        const progressPercent = (video.currentTime / video.duration) * 100;
        setProgress(progressPercent);
      };

      const handleVideoEnd = () => {
        if (currentStoryIndex < authUser.story.length - 1) {
          setCurrentStoryIndex(prev => prev + 1);
        } else {
          navigate("/");
        }
      };

      video.addEventListener('timeupdate', handleVideoProgress);
      video.addEventListener('ended', handleVideoEnd);

      return () => {
        video.removeEventListener('timeupdate', handleVideoProgress);
        video.removeEventListener('ended', handleVideoEnd);
      };
    } 
    // Handle image stories
    else {
      const startTime = Date.now();
      progressInterval.current = setInterval(() => {
        if (!isPaused) {
          const elapsedTime = Date.now() - startTime;
          const progressPercent = Math.min((elapsedTime / IMAGE_DURATION) * 100, 100);
          setProgress(progressPercent);

          if (progressPercent >= 100) {
            clearInterval(progressInterval.current);
            if (currentStoryIndex < authUser.story.length - 1) {
              setCurrentStoryIndex(prev => prev + 1);
            } else {
              navigate("/");
            }
          }
        }
      }, 100); // Update progress every 100ms for smooth animation

      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [currentStoryIndex, currentStory, isVideo, isPaused, navigate, authUser.story.length]);

  // Handle story navigation
  const goToNextStory = () => {
    if (currentStoryIndex < authUser.story.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      navigate("/");
    }
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  // Handle story pause/resume
  const handleStoryHold = (isPause) => {
    setIsPaused(isPause);
    if (isVideo && videoRef.current) {
      if (isPause) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col object-cover mx-auto gap-10">
      {/* Progress bar */}
      <div className="flex gap-1 px-2 pt-2">
        {authUser.story.map((_, index) => (
          <div key={index} className="h-1 flex-1 bg-gray-300 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-blue-500 transition-all duration-100 ease-linear ${
                index < currentStoryIndex ? 'w-full' : 
                index === currentStoryIndex ? '' : 'w-0'
              }`}
              style={{
                width: index === currentStoryIndex ? `${progress}%` : 
                      index < currentStoryIndex ? '100%' : '0%'
              }}
            />
          </div>
        ))}
      </div>
      
      {/* header */}
      <div>
        <div className="flex items-center gap-3">
          <img
            src={authUser?.profileImg || "/avatar-placeholder.png"}
            alt="Story"
            className="w-14 h-14 rounded-full border-2 border-white"
          />
          <div className="flex justify-between w-full">
            <div onClick={()=>navigate(`/profile/${authUser?.username}`)} className="flex flex-col gap-1 cursor-pointer">
              <h1 className="text-2xl font-semibold text-center tracking-wider">
                {authUser?.username}
              </h1>
            </div>
            <div className="flex gap-5">
                {
                    mute ? (
                        <BiVolumeMute size={30} className="cursor-pointer" onClick={()=>setMute(false)} />
                    ) : (
                        <GoUnmute size={30} className="cursor-pointer" onClick={()=>setMute(true)} />
                    )
                }
                <BsThreeDots size={30} className="cursor-pointer" />
                <Link to="/"><IoClose size={30} className="cursor-pointer" /></Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Story content */}
      <div className="h-full w-full flex justify-center items-center">
        <div className="relative w-full h-full">
          {/* Navigation buttons */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
            onClick={goToPreviousStory}
            onMouseDown={() => handleStoryHold(true)}
            onMouseUp={() => handleStoryHold(false)}
            onTouchStart={() => handleStoryHold(true)}
            onTouchEnd={() => handleStoryHold(false)}
          ></div>
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
            onClick={goToNextStory}
            onMouseDown={() => handleStoryHold(true)}
            onMouseUp={() => handleStoryHold(false)}
            onTouchStart={() => handleStoryHold(true)}
            onTouchEnd={() => handleStoryHold(false)}
          ></div>
          
          {/* Story media */}
          {currentStory && (
            <div className="w-full h-full flex justify-center items-center">
              {currentStory.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                <img 
                  src={currentStory} 
                  alt="story" 
                  className="max-h-full max-w-full object-contain"
                />
              ) : currentStory.match(/\.(mp4|webm|ogg)$/i) ? (
                <video 
                  ref={videoRef}
                  src={currentStory} 
                  controls={false}
                  muted={mute}
                  autoPlay
                  playsInline
                  className="max-h-full max-w-full object-contain"
                />
              ) : null}
            </div>
          )}
        </div>
      </div>
      
      {/* footer */}
      <div className="flex items-center gap-3 justify-evenly fixed bottom-4 w-full">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          type="text"
          placeholder="Send a message"
          className="rounded-lg p-2 border"
        />
        <FaRegHeart size={20} className="text-red-600 cursor-pointer" />
        <FiSend size={20} className="text-blue-600 cursor-pointer" />
      </div>
    </div>
  );
};

export default ViewStory;
