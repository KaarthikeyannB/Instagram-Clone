import React from "react";
import { IoClose } from "react-icons/io5";
import { CiText } from "react-icons/ci";
import { FaDownload } from "react-icons/fa6";
import { PiPaintBrushLight } from "react-icons/pi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant/url";

const CreateStory = () => {
  const location = useLocation();
  const { media, type } = location.state || {};
  const navigate = useNavigate();

  if (!media) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-4">No media selected</h2>
        <Link to="/" className="text-blue-500 hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  const queryClient = useQueryClient();
  const {
    mutate: createStory,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ media }) => {
      try {
        // Convert base64 to Blob
        const fetchMedia = async (mediaUrl) => {
          const response = await fetch(mediaUrl);
          const blob = await response.blob();
          return new File([blob], `story.${type === 'image' ? 'jpg' : 'mp4'}`, {
            type: type === 'image' ? 'image/jpeg' : 'video/mp4'
          });
        };

        const formData = new FormData();
        if (Array.isArray(media)) {
          for (const mediaItem of media) {
            const file = await fetchMedia(mediaItem);
            formData.append("story", file);
          }
        } else {
          const file = await fetchMedia(media);
          formData.append("story", file);
        }

        const res = await fetch(`${baseUrl}/api/users/updatestory`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.error || "Something went wrong");
        }
        return responseData;
      } catch (error) {
        console.error("Error creating story:", error);
        throw new Error(error.message || "Failed to create story");
      }
    },
    onSuccess: () => {
      toast.success("Story posted successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create story");
    },
  });

  const handleStory = (e) => {
    e.preventDefault();
    createStory({ media });
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center object-cover mx-auto">
      <form onSubmit={handleStory}>
        <div className="relative w-full h-96 mb-4">
          {type === "image" ? (
            <img
              src={media}
              alt="story"
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              src={media}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          )}
        </div>
        <div className="flex gap-2 items-center">
          <div className="absolute left-0 top-0 flex gap-2">
            <Link to="/">
              <IoClose className="w-10 h-10" />
            </Link>
          </div>
          <div className="flex absolute right-0 top-0 gap-10">
            <button type="button" onClick={() => window.open(media, '_blank')}>
              <FaDownload className="w-7 h-7" />
            </button>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            className="text-white p-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Posting..." : "Post Story"}
          </button>
        </div>
      </form>
      {isError && (
        <div className="text-red-500 text-center mt-4">{error.message}</div>
      )}
    </div>
  );
};

export default CreateStory;
