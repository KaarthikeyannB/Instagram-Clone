import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "../../constant/url";
import toast from "react-hot-toast";
import Loading from "../../common/Loading";
import LoadSpinner from "../../common/LoadSpinner";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const queryClient = useQueryClient();

  const {
    mutate: login,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async (data) => {
      try {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const responseData = await res.json();

        if (!res.ok) {
          throw new Error(responseData.message || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Login successfull");
      queryClient.invalidateQueries(["authUser"]);
    },
  });

  const onChanging = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formToSend = {
      email: formData.email,
      password: formData.password,
    };
    login(formToSend);
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
      <div className="flex gap-2 flex-col items-center mb-8">
        <LoadSpinner />
        <h1
          className="text-4xl font-semibold text-center tracking-wider"
          style={{
            fontFamily: '"Grand Hotel", cursive',
            letterSpacing: "1px",
          }}
        >
          Insta_Clone
        </h1>
      </div>
      <div className="bg-white p-8 border border-gray-300 rounded w-80">
        <h1
          className="text-xl font-medium text-center mb-6"
          style={{
            fontFamily: '"Grand Hotel", cursive',
            fontSize: "24px",
          }}
        >
          Log into Insta_Clone
        </h1>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <input
            type="text"
            name="email"
            placeholder="username, or email"
            className="border border-gray-300 p-2 rounded w-66"
            value={formData.email}
            onChange={onChanging}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="border border-gray-300 p-2 rounded w-66"
            value={formData.password}
            onChange={onChanging}
          />
          <button className="bg-blue-500 text-white p-2 rounded mt-2 font-medium w-66">
            {isPending ? <Loading /> : "Log in"}
          </button>
          <h1 className="text-sm text-center mt-4">
            Don't have an account?
            <span className="text-blue-500 font-semibold ml-1">
              <Link to="/signup">Sign up</Link>
            </span>
          </h1>
        </form>
        {isError && (
          <p className="text-red-500 text-sm mt-2 text-center">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
