import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "../../constant/url";
import Post from "../home/Post";
import { IoIosArrowBack } from "react-icons/io";

const ViewPost = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const {
    data: post,
    isPending: isPostLoading,
    error: postError,
  } = useQuery({
    queryKey: ["post",  String(postId)],
    queryFn: async ({ queryKey }) => {
      const [, postId] = queryKey;
      try {
        const res = await fetch(`${baseUrl}/api/posts/post/${postId}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.error || "Failed to fetch post data");
        }
        return responseData;
      } catch (error) {
        throw new Error(error.message || "Error fetching post data");
      }
    },
    retry: 1,
  });

  // Handle loading state
  if (isPostLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading post...</p>
      </div>
    );
  }

  // Handle error state
  if (postError || !post) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        <p className="text-red-500">
          {postError?.message || "Post not found or could not be loaded"}
        </p>
        <Link to="/" className="text-blue-500 hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex mx-auto items-center border-b p-1">
        <IoIosArrowBack
          className="text-2xl cursor-pointer w-10 h-10"
          onClick={() => navigate("/")}
        />
        <div className="w-full flex justify-center">
          <h1 className="text-2xl font-semibold ml-2">Post</h1>
        </div>
      </div>
      <div className="mt-3">
      <Post post={post} key={postId} />
      </div>
    </div>
  );
};

export default ViewPost;
