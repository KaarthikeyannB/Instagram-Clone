import React, { useState } from "react";
import LoadSpinner from "../../common/LoadSpinner";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant/url";

const SignupPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [process, setProcess] = useState(1); // 1 for sending OTP, 2 for verifying OTP, 3 for creating account
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  // Update formData when email changes
  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, email }));
  }, [email]);

  const sendOtp = async (data) => {
    const res = await fetch(`${baseUrl}/api/auth/sendotp`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const responseData = await res.json();
    if (!res.ok) {
      throw new Error(responseData.message || "Something went wrong");
    }
    return responseData;
  };

  const verifyOtp = async (data) => {
    const res = await fetch(`${baseUrl}/api/auth/verifyotp`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const responseData = await res.json();
    if (!res.ok) {
      throw new Error(responseData.message || "Something went wrong");
    }
    return responseData;
  };

  const createAccount = async (data) => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const responseData = await res.json();
    if (!res.ok) {
      throw new Error(responseData.message || "Something went wrong");
    }
    return responseData;
  };

  const { mutate: sendOtpMutate, isPending: isPendingSendOtp } = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
      toast.success("OTP sent successfully");
      setProcess(2);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: verifyOtpMutate, isPending: isPendingVerifyOtp } =
    useMutation({
      mutationFn: verifyOtp,
      onSuccess: (data) => {
        toast.success("OTP verified successfully");
        setProcess(3);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: createAccountMutate, isPending: isPendingCreateAccount } =
    useMutation({
      mutationFn: createAccount,
      onSuccess: (data) => {
        toast.success("Account created successfully");
        navigate("/login");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const handleOptSubmit = (e) => {
    e.preventDefault();
    sendOtpMutate({ email });
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    verifyOtpMutate({ email, otp });
  };

  const handleAccountSubmit = (e) => {
    e.preventDefault();
    createAccountMutate(formData);
  };

  // Determine if any operation is pending
  const isLoading =
    isPendingSendOtp || isPendingVerifyOtp || isPendingCreateAccount;

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      {isLoading ? (
        <LoadSpinner />
      ) : (
        <div className="border-1 p-5">
          <h1
            className="text-4xl font-semibold text-center tracking-wider"
            style={{
              fontFamily: '"Grand Hotel", cursive',
              letterSpacing: "1px",
            }}
          >
            Insta_Clone
          </h1>
          <div className="flex flex-col items-center gap-2">
            {process === 1 ? (
              <form className="flex flex-col gap-4 mt-5" onSubmit={handleOptSubmit}>
                <h1
                  className="text-xl font-semibold text-center tracking-wider"
                  style={{
                    fontFamily: '"Grand Hotel", cursive',
                    letterSpacing: "1px",
                  }}
                >
                  Register
                </h1>
                <input
                  type="text"
                  name="email"
                  placeholder="username, or email"
                  className="border border-gray-300 p-2 rounded w-66"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Send OTP
                </button>
              </form>
            ) : process === 2 ? (
              <form
                className="flex flex-col gap-3 mt-5 "
                onSubmit={handleVerifySubmit}
              >
                <h1
                  className="text-xl font-semibold text-center tracking-wider"
                  style={{
                    fontFamily: '"Grand Hotel", cursive',
                    letterSpacing: "1px",
                  }}
                >
                  Gmail Verification
                </h1>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  className="border border-gray-300 p-2 rounded w-66"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Verify OTP
                </button>
              </form>
            ) : process === 3 ? (
              <form
                className="flex flex-col gap-4 mt-5"
                onSubmit={handleAccountSubmit}
              >
                <h1
                  className="text-xl font-semibold text-center tracking-wider"
                  style={{
                    fontFamily: '"Grand Hotel", cursive',
                    letterSpacing: "1px",
                  }}
                >
                  Create Account
                </h1>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  className="border border-gray-300 p-2 rounded w-66"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="border border-gray-300 p-2 rounded w-66"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="border border-gray-300 p-2 rounded w-66"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Create Account
                </button>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
