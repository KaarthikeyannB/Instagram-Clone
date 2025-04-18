import React, {  useState } from "react";
import { MdVerified } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { MdAccountCircle } from "react-icons/md";
import { FcLike } from "react-icons/fc";
import { FaRegComment } from "react-icons/fa";
import { LuSend } from "react-icons/lu";
import { CiBookmark } from "react-icons/ci";
import { BsBookmarkFill } from "react-icons/bs";
import { FaRegHeart } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { baseUrl } from "../../constant/url";
import { Link, useNavigate } from "react-router-dom";
import useFollow from "../../hooks/useFollow";

const Post = ({ post }) => {
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);

  const isMyPost = authUser?._id === post?.user?._id; //For delet button

  const postOwner = post?.user;

  const [showFullDesc, setShowFullDesc] = useState(false);

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/posts/${post._id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.error || "Something went wrong");
        }
        return responseData;
      } catch (error) {
        throw new Error(error.message || "Failed to delete post");
      }
    },
    onSuccess: () => {
      toast.success("Post Deleted");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleDeletePost = () => {
    if (isDeleting) return;
    deletePost();
  };

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/posts/like/${post._id}`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.error || "Something went wrong");
        }
        return responseData;
      } catch (error) {
        throw new Error(error.message || "Failed to like post");
      }
    },
    onSuccess: (updatedLikes) => {
      toast.success("Post Liked");
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((p) => {
          if (p._id === post._id) {
            return {
              ...p,
              likes: updatedLikes,
            };
          }
          return p;
        });
      });
      queryClient.setQueryData(["post", post._id], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          likes: updatedLikes,
        };
      });
    },
  });



  const { mutate: savePost, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/posts/save/${post._id}`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.error || "Something went wrong");
        }
        return responseData;
      } catch (error) {
        throw new Error(error.message || "Failed to save post");
      }
    },
    onSuccess: (data) => {
      toast.success("Post saved sucessfully");
      const updatedSaved = data.saved || [...post.saved, authUser._id];
      queryClient.setQueryData(["posts"], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((p) => {
          if (p._id === post._id) {
            return {
              ...p,
              saved: updatedSaved,
            };
          }
          return p;
        });
      });
      queryClient.setQueryData(["post", post._id], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          saved: updatedSaved,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
  const isSavedPost =
    post?.saved && authUser?._id ? post.saved.includes(authUser._id) : false;

  // Get the first description if it exists
  const description =
    post?.descriptions && post.descriptions.length > 0
      ? post.descriptions[0]
      : "";

  // Get hashtags as a formatted string
  const hashtagsText =
    post?.hashtags && post.hashtags.length > 0
      ? post.hashtags.map((tag) => `#${tag}`).join(" ")
      : "";

  const navigate = useNavigate();

  const isLiked = post?.likes.includes(authUser._id);
  const handleLike = () => {
    if (isLiking) {
      return;
    }
    likePost();
  };

  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };
  

  const { follow, isPending } = useFollow();
  const isFollowing = authUser?.followings.includes(postOwner._id);


  return (
    <div className="border-b border-gray-500 pb-4 mb-4">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <div>
            <Link key={postOwner._id} to={`/profile/${postOwner?.username}`} ><img
              src={postOwner?.profileImg || "/avatar-placeholder.png"}
              alt="profile"
              className="w-14 h-14 rounded-full"
            /></Link>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center">
              <h1
                className="text-lg font-medium"
                onClick={() => navigate(`/profile/${postOwner.username}`)}
              >
                {postOwner?.name}
              </h1>
              {postOwner?.verified ? (
                <MdVerified className="text-blue-500 ml-1" />
              ) : null}
              {!isFollowing && authUser._id !== postOwner._id && (
                <>
                  <span className="flex items-center justify-center mx-1 text-gray-400">
                    •
                  </span>
                  <button
                    className="text-blue-500 font-medium"
                    onClick={() => follow(postOwner._id)}
                  >
                    Follow
                  </button>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500">{post?.features}</p>
          </div>
        </div>
        <div>
          <BsThreeDots
            className="text-xl cursor-pointer"
            onClick={toggleMenu}
          />
          {showMenu && (
            <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 " >
              <div className="bg-white rounded-xl w-80 max-w-sm overflow-hidden ">
                <ul className="divide-y divide-gray-200 ">
                  <li className="py-3 text-center font-medium text-red-500 cursor-pointer">
                    Report
                  </li>
                  {authUser._id !== postOwner._id && !isPending && (
                    <li className="py-3 text-center text-red-500 cursor-pointer" onClick={()=>follow(postOwner._id)}>
                      {isFollowing ? "Unfollow" : "Follow"}
                    </li>
                  )}

                  <li className="py-3 text-center cursor-pointer">
                    Add to favorites
                  </li>
                  <li className="py-3 text-center cursor-pointer" onClick={() => navigate(`/postpage/${post._id}`)}>
                    Go to post
                  </li>
                  <li className="py-3 text-center cursor-pointer">Copy link</li>
                  {isMyPost && (
                    <li
                      className="py-3 text-center cursor-pointer text-red-500"
                      onClick={handleDeletePost}
                    >
                      Delete
                    </li>
                  )}
                  <li
                    className="py-3 text-center border-t-2  border-black cursor-pointer "
                    onClick={() => setShowMenu(false)}
                  >
                    Cancel
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Body part and comments*/}
      <div>
        <div className="flex flex-col overflow-hidden gap-1.5 mt-2">
          {post?.image ? (
            <img
              src={post?.image}
              className="h-full object-contain rounded-lg border border-gray-700"
              alt="Post content"
              onClick={()=>navigate(`/postpage/${post?._id}`)}
            />
          ) : post?.video ? (
            <video
              src={post?.video}
              controls
              className="h-full object-contain rounded-lg border border-gray-700"
              onClick={()=>navigate(`/postpage/${post?._id}`)}
            />
          ) : null}
        </div>

        {/* Comment and like part*/}
        <div className="flex justify-between mt-3 items-center">
          <div className="flex gap-6">
            {isLiked ? (
              <FcLike onClick={handleLike} className="text-2xl" />
            ) : (
              <FaRegHeart
                className="text-2xl cursor-pointer hover:text-pink-700"
                onClick={handleLike}
              />
            )}
            <FaRegComment
              className="text-2xl cursor-pointer"
              onClick={() => navigate(`/comments/${post._id}`)}
            />
            <LuSend
              className="text-2xl cursor-pointer"
              onClick={() => navigate("/share", { state: { post } })}
            />
          </div>
          <div>
            <div>
              {isSavedPost ? (
                <BsBookmarkFill
                  className="text-2xl cursor-pointer text-black"
                  onClick={savePost}
                />
              ) : (
                <CiBookmark
                  className="text-2xl cursor-pointer hover:text-blue-500"
                  onClick={savePost}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-2 flex-col ml-1">
          {post?.likes?.length > 0 ? (
            <div className="flex gap-1 items-center">
              <p className="font-medium">{post?.likes?.length}</p>
              <p className="text-sm text-gray-500">Likes</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col mt-1">
          <div>
            <span className="font-medium mr-2">{postOwner?.name}_</span>

            <span>{post?.text}</span>

            {description && (
              <div className="text-sm text-gray-600 mt-1">
                {description.length > 50 && !showFullDesc ? (
                  <>
                    {description.substring(0, 50)}...
                    <button
                      className="ml-1 text-black font-medium"
                      onClick={() => setShowFullDesc(true)}
                    >
                      See more
                    </button>
                  </>
                ) : (
                  <>
                    {description}
                    {showFullDesc && hashtagsText && (
                      <div className="text-blue-500 mt-1">{hashtagsText}</div>
                    )}
                    {description.length > 50 && (
                      <button
                        className="ml-1 text-black font-medium"
                        onClick={() => setShowFullDesc(false)}
                      >
                        See less
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {post?.comments?.length > 0 ? (
            <div className="flex gap-2 items-center mt-2">
              <button
                className="text-sm text-gray-500"
                onClick={() => navigate(`/comments/${post._id}`)}
              >
                View all {post?.comments?.length} comments
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Post;
