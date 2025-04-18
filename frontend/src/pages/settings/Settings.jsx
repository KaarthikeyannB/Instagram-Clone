import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { FaMeta } from "react-icons/fa6";
import { FiUser } from "react-icons/fi";
import { MdOutlineSecurity } from "react-icons/md";
import { RiAdvertisementLine } from "react-icons/ri";
import { FaRegUserCircle } from "react-icons/fa";
import { LuSquareActivity } from "react-icons/lu";
import { IoNotificationsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "../../constant/url";
import toast from "react-hot-toast";

const Settings = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/accountcenter");
  };

  const handleBackButton = () => {
    navigate("/");
  };

  const queryClient = useQueryClient();

  const {mutate:logout,isPending,isError,error} = useMutation({
    mutationFn:async()=>{
      try {
        const res = await fetch(`${baseUrl}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.message || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess:()=>{
      toast.success("Logout successfull");
      queryClient.invalidateQueries(["authUser"]);
    },
    onError:(error)=>{
      toast.error(error.message);
    }
  });

  return (
    <div className="flex flex-col min-h-screen mt-2 mx-3">
      <div className="flex justify-between mr-20 ml-2 items-center ">
        <IoIosArrowBack className="text-2xl mt-2" onClick={handleBackButton} />
        <h1 className="font-semibold text-2xl">Settings and privacy</h1>
      </div>
      <hr className="border-gray-300 mt-2 mb-2" />
      <div
        className="border-white shadow-lg rounded-xl mx-3"
        onClick={handleClick}
      >
        <div className="flex flex-col gap-2">
          <div className="flex gap-1 items-center ml-3">
            <FaMeta className="text-2xl mt-2 ml-2 text-blue-500" />
            <h1 className="font-semibold text-lg">Meta</h1>
          </div>
          <h1 className="text-xl font-semibold ml-3">Accounts Center</h1>
          <p className="text-sm ml-3 mb-2">
            Manage your connected experiences and account settings across Meta
            technologies.
          </p>
          <div className="mx-5 flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <FiUser className="text-2xl mt-2 ml-" />
              <h1 className="text-lg">Personal Details</h1>
            </div>
            <div className="flex items-center gap-4">
              <MdOutlineSecurity className="text-2xl mt-2" />
              <h1 className="text-lg">Password and Security</h1>
            </div>
            <div className="flex items-center gap-4">
              <RiAdvertisementLine className="text-2xl mt-2" />
              <h1 className="text-lg">Ad Preferences</h1>
            </div>
            <p className="text-blue-500">See more in Accounts center</p>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <p>How you use instagram</p>
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center gap-4">
            <FaRegUserCircle className="text-2xl mt-2" />
            <h1 className="text-lg">Edit profile</h1>
          </div>
          <div className="flex items-center gap-4">
            <LuSquareActivity className="text-2xl mt-2" />
            <h1 className="text-lg">Your activity</h1>
          </div>
          <div className="flex items-center gap-4">
            <IoNotificationsOutline className="text-2xl mt-2" />
            <h1 className="text-lg">Notifications</h1>
          </div>
        </div>
      </div>
      <button className="text-red-500" onClick={(e)=>{
        e.preventDefault();
        logout();
        }
      }>Log Out</button>
    </div>
  );
};

export default Settings;
