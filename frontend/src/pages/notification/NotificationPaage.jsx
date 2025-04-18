import React from "react";
import { Link } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "../../constant/url";
import useFollow from "../../hooks/useFollow";

const NotificationPaage = () => {
  const { follow, isPending } = useFollow();
  const queryClient = useQueryClient();

  const { data: suggestions, isPending: isGettingSuggetions } = useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/users/suggestions`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch suggestions");
        }
        return data;
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        throw error;
      }
    },
  });

  const authUser = queryClient.getQueryData(["authUser"]);

  const { data: notifications, isPending: isGettingNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/notifications`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch notifications");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-2 mt-1 p-2">
        <Link to="/">
          <IoMdArrowBack className="text-3xl" />
        </Link>
        <div className="flex justify-center w-full">
          <h1 className="text-2xl font-semibold">Notifications</h1>
        </div>
      </div>

      {/* notifications */}
      <div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Recent</h1>
          <div className="flex flex-col gap-3 p-2">
            {
              notifications.length===0 && (
                <p>No Notifications</p>
              )
            }
            {!isGettingNotifications &&
              notifications?.map((notification) => {
                const isFollowing = authUser?.followings.includes(notification?.from?._id);
                return (
                  <div key={notification._id} className="flex items-center gap-2">
                    <img
                      src={
                        notification?.from?.profileImg ||
                        "/avatar-placeholder.png"
                      }
                      alt={notification?.from?.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex justify-between w-full">
                      {notification?.type === "follow" ? (
                        <h1 className="font-semibold">{`${notification?.from?.username} started following you`}</h1>
                      ) : (
                        <h1 className="font-semibold">{`${notification?.from?.username} ${notification?.type} liked your post`}</h1>
                      )}
                      <button
                        disabled={isPending}
                        onClick={() => follow(notification?.from?._id)}
                        className="text-sm text-white bg-blue-600 px-3 py-1 rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isFollowing
                          ? "Unfollow"
                          : isPending
                          ? "Following..."
                          : "Follow"}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* suggestions*/}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Suggestions</h1>
        <div className="flex flex-col gap-3 p-2">
          {/* <div className="flex justify-center items-center">
          {!suggestions && isGettingSuggetions && <LoadSpinner />}
          </div> */}
          {!isGettingSuggetions &&
            suggestions?.map((suggestion) => {
              const isFollowing = authUser?.followings.includes(suggestion._id); // Move this inside the map loop
              return (
                <div key={suggestion._id}>
                  <div className="flex items-center gap-2">
                    <img
                      src={suggestion.profileImg || "/avatar-placeholder.png"}
                      alt={suggestion.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex justify-between w-full">
                      <h1 className="font-semibold">{suggestion.username}</h1>
                      <button
                        disabled={isPending}
                        onClick={() => follow(suggestion._id)}
                        className="text-sm text-white bg-blue-600 px-3 py-1 rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isFollowing
                          ? "Unfollow"
                          : isPending
                          ? "Following..."
                          : "Follow"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default NotificationPaage;
