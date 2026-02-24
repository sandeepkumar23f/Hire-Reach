"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const API =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!userData.email || !userData.password) {
      setErrorMessage("All fields are required");
      return;
    }

    if (!validateEmail(userData.email)) {
      setErrorMessage("Enter valid email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await res.json();

      if (result.success) {
        if (result.token) {
          localStorage.setItem("token", result.token);
        }

        setSuccessMessage("Login successful 🎉 Redirecting...");

        setTimeout(() => {
          router.push("/interview"); 
        }, 1000);
      } else {
        setErrorMessage(result.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed top-0 w-full h-16 flex items-center px-8 bg-white shadow-sm text-black font-bold text-2xl z-50">
        HireReach
      </div>

      <div className="min-h-[calc(100vh-64px)] pt-16 flex items-center justify-center bg-linear-to-r from-blue-500 to-gray-500">
        <div className="w-full max-w-md bg-white text-black rounded-lg p-8 shadow-md">

          <h1 className="text-2xl text-center font-bold mb-3">
            Login to your account
          </h1>

          {errorMessage && (
            <p className="text-red-500 text-sm text-center mb-2">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-600 text-sm text-center mb-2">{successMessage}</p>
          )}

          <div className="mb-4">
            <label>Email</label>
            <input
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="h-10 w-full border rounded-md px-3"
              type="email"
            />
          </div>

          <div className="mb-4">
            <label>Password</label>
            <input
              name="password"
              value={userData.password}
              onChange={handleChange}
              className="h-10 w-full border rounded-md px-3"
              placeholder="Enter password"
              type="password"
            />
          </div>

          <div className="text-right mb-4">
            <button className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-gray-400 my-4">OR</p>


          <div className="flex items-center justify-center mt-4">
            <Link href="/signup" className="text-blue-500 hover:underline">
              Don&apos;t have an account? Sign Up
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
