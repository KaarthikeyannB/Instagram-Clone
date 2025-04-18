import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import { baseUrl } from "../../constant/url";
import toast from "react-hot-toast";
import LoadSpinner from "../../common/LoadSpinner"

const CommentPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");

  // Add a state to track if data is loaded
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const { 
    data: post, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/posts/post/${id}`, {
          credentials: "include",
        });
        if (!res.ok) {
          const responseData = await res.json();
          throw new Error(responseData.error || "Failed to fetch post");
        }
        const data = await res.json();
        setIsDataLoaded(true);
        return data;
      } catch (error) {
        console.error("Error fetching post:", error);
        setIsDataLoaded(false);
        throw error;
      }
    },
    // Add these options to help with data loading
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  // Use effect to refetch when needed
  useEffect(() => {
    if (id && !isDataLoaded) {
      refetch();
    }
  }, [id, isDataLoaded, refetch]);

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async (commentText) => {
      try {
        const res = await fetch(`${baseUrl}/api/posts/comment/${id}`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: commentText }),
        });
        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.error || "Something went wrong");
        }
        return responseData;
      } catch (error) {
        console.error("Error posting comment:", error);
        throw new Error(error.message || "Error posting comment");
      }
    },
    onSuccess: (data) => {
      toast.success("Comment posted successfully");
      setCommentText("");
      
      // Refetch data instead of just invalidating
      refetch();
      
      // Also invalidate other related queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post comment");
    }
  });

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      commentPost(commentText);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadSpinner />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-500">Failed to load post</p>
          <button 
            onClick={() => refetch()} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Try again
          </button>
          <Link to="/" className="text-blue-500">
            Return to home page
          </Link>
        </div>
      </div>
    );
  }

  // Make sure user data is structured correctly
  const userProfile = post?.user?.[0] || post?.user || {};
  const userName = userProfile?.name || userProfile?.username || "User";
  const profileImage = userProfile?.profileImg || "/avatar-placeholder.png";

  return (
    <div className="min-h-screen">
      <div className="flex border-b p-2 items-center">
        <IoIosArrowBack className="text-3xl" onClick={() => navigate("/")} />
        <div className="w-full flex justify-center">
          <h1 className="text-2xl font-semibold">Comments</h1>
        </div>
      </div>
      
      {/* header */}
      <div className="mt-2 p-2 w-full border-b">
        <div className="flex items-center gap-3">
          <img
            src={profileImage}
            alt="post"
            className="w-16 h-16 rounded-full"
          />
          <div className="flex gap-3">
            <h1 className="font-semibold">{userName}</h1>
            <p>{post?.text}</p>
          </div>
        </div>
      </div>

      {/* comments */}
      <div className="flex flex-col gap-2 w-full border-gray-500 border-b p-2 pb-24">
        {post?.comments && post.comments.length > 0 ? (
          post.comments.map((comment) => {
            // Add a safety check here to prevent _id errors
            if (!comment || !comment._id) return null;
            
            const commentUser = comment?.user?.[0] || {};
            const commentUserName = commentUser?.username || "User";
            const commentUserImg = commentUser?.profileImg || "/avatar-placeholder.png";
            
            return (
              <div className="flex items-center gap-3" key={comment._id}>
                <img
                  src={commentUserImg}
                  alt="comment"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex gap-3">
                  <h1 className="font-semibold">{commentUserName}</h1>
                  <div className="flex gap-2">
                    <p>{comment?.text}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center">No comments yet!</p>
        )}
      </div>

      {/* footer */}
      <div className="fixed bottom-2 mx-2 w-full items-center">
        <form className="flex gap-2 items-center" onSubmit={handleSubmitComment}>
          <img
            src={profileImage}
            alt="post"
            className="w-8 h-8 rounded-full"
          />
          <div className="flex justify-between w-full mx-2">
            <input
              type="text"
              placeholder="Add a comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="bg-gray-200 p-2 rounded-full w-full mr-2"
            />
            <button type="submit" disabled={isCommenting || !commentText.trim()}>
              <IoSend className="text-4xl" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentPage;