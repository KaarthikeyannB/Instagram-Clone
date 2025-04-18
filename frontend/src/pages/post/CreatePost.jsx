import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { FcAddImage } from "react-icons/fc";
import { MdVideoCameraBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant/url";
import { IoCloseSharp } from "react-icons/io5";

const CreatePost = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);

  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [video, setVideo] = useState(null);
  const [descriptions, setDescriptions] = useState("");
  const [hashtag, setHashtag] = useState("");
  const fileRef = useRef();
  const videoRef = useRef();

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async ({ text, video, image, descriptions, hashtag }) => {
      try {
        const res = await fetch(`${baseUrl}/api/posts/create`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, video, image, descriptions, hashtag }),
        });
        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.message || "Something went wrong");
        }
        return responseData;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Post created");
      setText("");
      setImg(null);
      setVideo(null);
      setDescriptions("");
      setHashtag("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/");
    },
  });

  const handleImageClose = () => {
    setImg(null);
    if (fileRef.current) {
      fileRef.current.value = null;
    }
  };

  const handleVideoClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current.load();
    }
    setVideo(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.type.startsWith("image/")) {
      reader.onload = () => setImg(reader.result);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      reader.onload = () => setVideo(reader.result);
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select an image or video file!");
    }
  };

  const handleDoneSubmit = (e) => {
    e.preventDefault();
    createPost({
      text,
      video: video,
      image: img,
      descriptions,
      hashtag,
    });
  };

  return (
    <div className="min-h-screen mx-2">
      <div className="flex items-center border-b py-2 gap-8">
        <IoIosArrowBack
          className="cursor-pointer text-xl"
          onClick={() => navigate("/")}
        />
        <h1 className="text-lg font-medium">New Post</h1>
      </div>
      <div className="flex flex-col gap-2">
        <img
          src={authUser?.profileImg || "/avatar-placeholder.png"}
          alt="Profile"
          className="w-12 h-12 rounded-full mt-4"
        />
        <form onSubmit={handleDoneSubmit} className="flex flex-col gap-2">
          <textarea
            className="w-full h-12 border border-gray-300 rounded-lg p-2"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a caption..."
          ></textarea>
          <textarea
            className="w-full h-32 border border-gray-300 rounded-lg p-2"
            value={descriptions}
            onChange={(e) => setDescriptions(e.target.value)}
            placeholder="Write a Description..."
          ></textarea>
          <textarea
            className="w-full h-12 border border-gray-300 rounded-lg p-2"
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
            placeholder="Write a Hashtag (without #)..."
          ></textarea>

          {img && (
            <div className="relative w-72 mx-auto">
              <IoCloseSharp
                className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
                onClick={handleImageClose}
              />
              <img
                src={img}
                className="w-full mx-auto h-72 object-contain rounded"
                alt="Post preview"
              />
            </div>
          )}

          {video && (
            <div className="relative w-72 mx-auto">
              <IoCloseSharp
                className="absolute -top-3 -right-3 text-white bg-gray-800 rounded-full w-6 h-6 cursor-pointer z-50"
                onClick={handleVideoClose}
              />
              <video
                ref={videoRef}
                src={video}
                controls
                className="w-full rounded-lg"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <div
              className="cursor-pointer"
              onClick={() => {
                if (fileRef.current) fileRef.current.value = null;
                fileRef.current.click();
              }}
            >
              {video ? (
                <MdVideoCameraBack className="w-10 h-10 text-blue-500" />
              ) : (
                <FcAddImage className="w-10 h-10" />
              )}
            </div>

            <input
              type="file"
              accept="image/*,video/*"
              ref={fileRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="submit"
              disabled={isPending || (!text && !img && !video)}
              className={`py-2 px-4 rounded-lg ml-auto ${
                isPending || (!text && !img && !video)
                  ? "bg-blue-300"
                  : "bg-blue-500"
              } text-white`}
            >
              {isPending ? "Sharing..." : "Share"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
