import React, { useState, useRef } from "react";
import MenuSection from "../../components/MenuSection";
import { CiSearch } from "react-icons/ci";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { baseUrl } from "../../constant/url";

const SearchAndFeed = () => {
  const queryClient = useQueryClient();
  const posts = queryClient.getQueryData(["posts"]);

  const [search, setSearch] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchRef = useRef(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/users/alluser`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.message || "Something went wrong");
      }
      return responseData;
    }
  });
  
  const filteredUsers =
    search.trim() !== "" && users
      ? users.filter((user) =>
          user?.username?.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  // Handle search button click
  const handleSearchClick = () => {
    setIsSearchActive(true);
    searchRef.current.focus();
  };

  // Handle cancel button click
  const handleCancelClick = () => {
    setIsSearchActive(false);
    setSearch("");
  };

  // // Filter users based on search input
  // const uniqueUsers = posts
  //   ? Array.from(
  //       new Map(
  //         posts.map((post) => [post.user._id, post.user]) // Use _id as key for uniqueness
  //       ).values()
  //     )
  //   : [];



  const navigate = useNavigate();
  return (
    <div className="min-h-screen mt-2 mx-1">
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
          <CiSearch className="text-gray-500 text-xl" />
        </div>
        <input
          className="w-full p-2 pl-8 border rounded-lg border-black"
          ref={searchRef}
          onClick={handleSearchClick}
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isSearchActive && (
          <button
            className="absolute right-2 p-1 text-black"
            onClick={handleCancelClick}
          >
            Cancel
          </button>
        )}
      </div>

      <div className="mt-2">
        {isSearchActive && search.trim() === "" ? null : search.trim() !==
          "" ? (
          filteredUsers && filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border-b">
                <img
                  src={user?.profileImg || "/avatar-placeholder.png"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h1>{user?.username}</h1>
                  <p>{user?.name}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No users found</p>
          )
        ) : (
          // Show grid when search is not active
          <div
            className={`grid grid-cols-3 gap-1 ${
              isSearchActive ? "hidden" : ""
            }`}
          >
            {!posts && (
              <Link
                to="/"
                className="flex justify-center items-center min-h-screen"
              >
                Return to the home page to load the post
              </Link>
            )}
            {posts && posts.length > 0 ? (
              posts.map((post, index) => {
                if (post?.video) {
                  return (
                    <div key={index} className="relative aspect-square">
                      <video
                        src={post.video}
                        className="w-full h-full object-cover"
                        onClick={() => navigate(`/postpage/${post._id}`)}
                       
                      />
                    </div>
                  );
                } 
                if (post?.image) {
                  return (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full h-full object-cover"
                        onClick={() => navigate(`/postpage/${post._id}`)}
                      />
                    </div>
                  );
                } else {
                  return null;
                }
              })
            ) : (
              <p className="col-span-3 text-center text-gray-500">
                {!posts ? "Loading posts..." : "No posts available"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Menu */}
      <div className="fixed bottom-0 border-t w-full bg-white">
        <MenuSection />
      </div>
    </div>
  );
};

export default SearchAndFeed;
