"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUp() {
  const router = useRouter();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    appPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

  const handleSignUp = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !userData.name ||
      !userData.email ||
      !userData.password ||
      !userData.appPassword
    ) {
      setErrorMessage("All fields are required");
      return;
    }

    if (!validateEmail(userData.email)) {
      setErrorMessage("Enter valid email address");
      return;
    }

    if (userData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    if (userData.appPassword.length < 16) {
      setErrorMessage("Enter valid Gmail App Password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSuccessMessage("Account created successfully");

        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setErrorMessage(result.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage("Server error. Please try again.");
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
            Sign Up to HireReach
          </h1>

          {errorMessage && (
            <p className="text-red-500 text-sm text-center mb-2">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-600 text-sm text-center mb-2">{successMessage}</p>
          )}

          <div className="mb-4">
            <label>Name</label>
            <input
              name="name"
              value={userData.name}
              onChange={handleChange}
              type="text"
              placeholder="Enter your name"
              className="w-full h-10 border rounded-md px-3"
            />
          </div>

          <div className="mb-4">
            <label>Email</label>
            <input
              name="email"
              value={userData.email}
              onChange={handleChange}
              type="email"
              placeholder="Enter your email"
              className="w-full h-10 border rounded-md px-3"
            />
          </div>

          <div className="mb-4">
            <label>Password</label>
            <input
              name="password"
              value={userData.password}
              onChange={handleChange}
              type="password"
              placeholder="Enter password"
              className="w-full h-10 border rounded-md px-3"
            />
          </div>

          {/* NEW FIELD */}

          <div className="mb-4">
            <label>Gmail App Password</label>
            <input
              name="appPassword"
              value={userData.appPassword}
              onChange={handleChange}
              type="password"
              placeholder="Enter 16-digit Gmail App Password"
              className="w-full h-10 border rounded-md px-3"
            />
            <p className="text-xs text-gray-500 mt-1">
              Generate this from Google → Security → App Passwords
            </p>
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <p className="text-center text-gray-400 my-4">OR</p>

          <div className="flex items-center justify-center mt-4">
            <Link href="/login" className="text-blue-500 hover:underline">
              Already have an account? Login
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}