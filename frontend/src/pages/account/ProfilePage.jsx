import React, { useEffect, useRef, useState } from "react";
import MenuSection from "../../components/MenuSection";
import { IoSettingsOutline } from "react-icons/io5";
import { BsThreads } from "react-icons/bs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BiGrid } from "react-icons/bi";
import { BiLayout } from "react-icons/bi";
import { BiBookmark } from "react-icons/bi";
import { RiAccountPinBoxLine } from "react-icons/ri";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { baseUrl } from "../../constant/url";
import PostCell from "./PostCell";
import { MdOutlineCameraAlt } from "react-icons/md";
import Post from "../home/Post";
import useFollow from "../../hooks/useFollow";

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const posts = queryClient.getQueryData(["posts"]);

  const navigate = useNavigate();
  const { username } = useParams();
  const {
    data: userProfile,
    isPending,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/users/profile/${username}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      return data;
    },
    onSuccess: () => {},
  });

  useEffect(() => {
    refetch();
  }, [username, refetch]);

  const myPosts = posts
    ? posts.filter((post) => post?.user?._id === userProfile?._id)
    : [];
  const myPostsCount = myPosts.length;

  const [image, setImage] = useState(null);
  const fileRef = useRef();
  const [showMenu, setShowMenu] = useState(false);
  const handleShowMenu = () => {
    setShowMenu((prev) => !prev);
  };
  const { mutate: updateProfileImage, isPending: isPhotoUploading } =
    useMutation({
      mutationFn: async (image) => {
        try {
          const res = await fetch(`${baseUrl}/api/users/update`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              profileImg: image,
            }),
          });
          const responseData = await res.json();
          if (!res.ok) {
            throw new Error(responseData.error);
          }
          return responseData;
        } catch (error) {
          throw new Error("Error updating profile image");
        }
      },
      onSuccess: () => {
        toast.success("Dp updated successfully");
        setImage(null);
        setShowMenu(false);
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      },
      onError: (error) => {
        toast.error(`${error.message}`);
      },
    });
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.type.startsWith("image/")) {
      reader.onload = () => {
        setImage(reader.result);
        updateProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const authUser = queryClient.getQueryData(["authUser"]);
  const isMyProfile = authUser?._id === userProfile?._id;

  const [feedType, setFeedType] = useState("images");
  //images,posts,saved,tagged

  if (!posts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link to="/">
          <h1 className="text-blue-500 text-2xl text-center">
            Posts are not fetched — go to home and return back or click here
          </h1>
        </Link>
      </div>
    );
  }

  const { data: savedPosts, isPending: isLoadingSaved } = useQuery({
    queryKey: ["savedPosts"],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/posts/savedpost`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      return data;
    },
    retry: false,
  });

  const { follow, isPending: isFollowPending } = useFollow();

  const [showForm, setShowForm] = useState(false);
  const handleShowForm = () => {
    setShowForm((prev) => !prev);
  };
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    name: "",
    link: "",
    currentpassword: "",
    newpassword: "",
  });

  const { mutate: updateProfile, isPending: isUpdatePending } = useMutation({
    mutationFn: async ({ formData }) => {
      try {
        const res = await fetch(`${baseUrl}/api/users/update`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.error);
        }
        return responseData;
      } catch (error) {
        throw new Error("Error updating profile");
      }
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({ formData });
    setFormData({
      username: "",
      bio: "",
      name: "",
      link: "",
      currentpassword: "",
      newpassword: "",
    });
  };

  return (
    <div className="min-h-screen mt-2">
      <div className="flex justify-between border-b items-center p-2">
        <Link to="/settings">
          <IoSettingsOutline className="text-2xl text-gray-600" />
        </Link>
        <h1 className="text-2xl font-semibold">{userProfile?.username}</h1>
        <a href="https://www.threads.net/?hl=en">
          <BsThreads className="text-2xl text-gray-600" />
        </a>
      </div>

      {showMenu && (
        <div className="fixed w-full h-screen bg-opacity-50 z-10 flex justify-center items-center">
          <div className="border-1">
            <ul className="bg-white rounded-lg w-64 p-4">
              <li
                className="p-3 text-center cursor-pointer hover:bg-gray-100 text-blue-500"
                onClick={() => {
                  fileRef.current.click();
                }}
              >
                Update Photo
              </li>
              <li className="p-3 text-center  cursor-pointer hover:bg-gray-100 text-red-500">
                Remove Photo
              </li>
              <li
                className="p-3 text-center cursor-pointer hover:bg-gray-100 border-t"
                onClick={handleShowMenu}
              >
                Cancel
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex gap-3 mt-5 mx-2 border-b p-1">
        <div className="flex flex-col gap-3 items-center">
          <img
            src={userProfile?.profileImg || "/avatar-placeholder.png"}
            alt="profile"
            className="w-24 h-24 rounded-full"
            onClick={() => setShowMenu(true)}
          />
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileRef}
            onChange={handleFileChange}
          />
          <div className="flex gap-0 flex-col items-center">
            <p>{userProfile?.name}</p>
            <p>{userProfile?.bio}</p>
            {userProfile?.link && (
              <a href={userProfile?.link} target="_blank" className="text-blue-500">Link</a>
            )}
          </div>
        </div>
        <div className="">
          <h1 className="text-2xl font-semibold">{userProfile?.username}</h1>
          <div className="flex gap-2">
            <button
              className="bg-gray-200 rounded-lg p-2"
              onClick={() => handleShowForm(true)}
            >
              Edit profile
            </button>
            {isMyProfile ? (
              <button className="bg-gray-200 rounded-md p-2">View Saved</button>
            ) : (
              <button
                className="bg-gray-200 rounded-md p-2"
                onClick={() => {
                  follow(userProfile._id);
                }}
              >
                {isFollowPending
                  ? "Loading..."
                  : !userProfile?.followers.includes(authUser._id)
                  ? "Follow"
                  : "Unfollow"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-20 ">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 border-2">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <div className="flex flex-col gap-3">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* inputs here */}
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="bio"
                  placeholder="Bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="link"
                  placeholder="Link"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="password"
                  name="currentpassword"
                  placeholder="Current Password"
                  value={formData.currentpassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="password"
                  name="newpassword"
                  placeholder="New Password"
                  value={formData.newpassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="border p-2 rounded"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-evenly border-b p-2">
        <div className="flex flex-col items-center">
          {myPostsCount}
          <p>posts</p>
        </div>
        <div className="flex flex-col items-center" onClick={() => navigate("/followdetails")}>
          {userProfile?.followers.length}
          <p>followers</p>
        </div>
        <div className="flex flex-col items-center" onClick={() => navigate("/followdetails")}>
          {userProfile?.followings.length}
          <p>following</p>
        </div>
      </div>

      <div className="flex justify-between border-b mx-5 p-2">
        <BiGrid
          onClick={() => setFeedType("images")}
          className={`text-2xl cursor-pointer ${
            feedType === "images" ? "text-blue-500" : "text-gray-600"
          }`}
        />
        <BiLayout
          onClick={() => setFeedType("posts")}
          className={`text-2xl cursor-pointer ${
            feedType === "posts" ? "text-blue-500" : "text-gray-600"
          }`}
        />
        <BiBookmark
          onClick={() => {
            setFeedType("saved");
          }}
          className={`text-2xl cursor-pointer ${
            feedType === "saved" ? "text-blue-500" : "text-gray-600"
          }`}
        />
        {isMyProfile && (
          <RiAccountPinBoxLine
            onClick={() => setFeedType("tagged")}
            className={`text-2xl cursor-pointer ${
              feedType === "tagged" ? "text-blue-500" : "text-gray-600"
            }`}
          />
        )}
      </div>

      <div className="h-full">
        {posts.filter((post) => post?.user?._id === userProfile?._id).length ===
          0 && (
          <div className="w-full h-full flex items-center justify-center">
            <MdOutlineCameraAlt />
            <h1>Share Photos</h1>
            <p>When you share photos, they will appear on your profile.</p>
            <Link to="/createpost">
              <button>Share your first photo</button>
            </Link>
          </div>
        )}
        {feedType === "images" && (
          <div className="grid grid-cols-3 gap-1 p-2">
            {posts
              .filter((post) => post?.user?._id === userProfile?._id)
              .map((post) => (
                <PostCell post={post} key={post._id} />
              ))}
          </div>
        )}

        {feedType === "posts" && (
          <div className="flex flex-col gap-1 mx-2 mb-16">
            {posts
              .filter((post) => post?.user?._id === userProfile?._id)
              .map((post) => (
                <Post post={post} key={post._id} />
              ))}
          </div>
        )}

        {feedType === "saved" && (
          <div className="grid grid-cols-3 gap-1 p-2">
            {savedPosts &&
            Array.isArray(savedPosts.saved) &&
            savedPosts.saved.length > 0 ? (
              savedPosts.saved.map((post) => (
                <PostCell post={post} key={post._id} />
              ))
            ) : (
              <p className="text-center col-span-3 text-gray-500">
                No Saved Posts.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 border-t-1 w-full">
        <MenuSection />
      </div>
    </div>
  );
};

export default ProfilePage;
