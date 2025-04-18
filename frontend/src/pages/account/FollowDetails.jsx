import { useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
import useFollow from "../../hooks/useFollow";

const FollowDetails = () => {
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const [feed, setFeed] = useState("following");
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData(["authUser"]);
  const { follow, isPending: isFollowPending } = useFollow();

  const handleSearchClick = () => {
    searchRef.current.focus();
  };

  const handleCancelClick = () => {
    setSearch("");
  };

  const getFilteredData = () => {
    const list = feed === "following" ? user?.followings : user?.followers;
    if (!search.trim()) return list;
    return list?.filter((u) =>
      u?.username?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const dataToRender = getFilteredData();

  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-3 p-3 border-b">
        <Link to="/">
          <IoMdArrowBack className="text-3xl" />
        </Link>
        <div className="flex justify-center w-full">
          <h1 className="text-2xl font-semibold">Follow Details</h1>
        </div>
      </div>

      <div className="mx-2 mt-2 flex items-center relative">
        <input
          type="text"
          value={search}
          ref={searchRef}
          onClick={handleSearchClick}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="w-full p-3 border border-gray-300 rounded-md"
        />
        {search && (
          <button
            className="absolute right-2 p-1 text-red-500"
            onClick={handleCancelClick}
          >
            Cancel
          </button>
        )}
      </div>

      <div className="mt-2">
        {/* tabs */}
        <div className="flex justify-between mx-1 w-full">
          <button
            className={`hover:bg-blue-500 p-2 rounded-lg w-full ${
              feed === "following" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setFeed("following")}
          >
            Following
          </button>
          <button
            className={`hover:bg-blue-500 p-2 rounded-lg w-full ${
              feed === "follower" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setFeed("follower")}
          >
            Followers
          </button>
        </div>

        <div className="flex flex-col gap-2 border-b mt-2">
          {dataToRender && dataToRender.length > 0 ? (
            dataToRender.map((user) => {
              const isFollowing = user?.followings?.some(
                (f) => f._id === user._id
              );

              return (
                <div
                  key={user._id}
                  className="flex items-center gap-2 p-2 border-b"
                >
                  <img
                    src={user?.profileImg || "/avatar-placeholder.png"}
                    alt={user?.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex flex-col gap-1 flex-1">
                    <h1 className="font-semibold">{user?.username}</h1>
                  </div>
                  <button
                    onClick={() => follow(user?._id)}
                    disabled={isFollowPending}
                    className="text-white bg-blue-500 p-2 rounded"
                  >
                    {isFollowPending ? "Following..." : "Unfollow"}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-4">
              {search.trim() ? "No users found" : "No users yet"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowDetails;
