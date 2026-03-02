"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [appPassword, setAppPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const handleSave = async () => {
    setMessage("");

    if (!appPassword) {
      setMessage("Please enter your Gmail App Password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/configure-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ appPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Gmail verified and connected successfully");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center text-black bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">
          Configure Gmail App Password
        </h2>

        {/* Toggle Guide Button */}
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-blue-600 text-sm mb-3 underline"
        >
          {showGuide ? "Hide Instructions" : "How to generate App Password?"}
        </button>

        {/* Instruction Section */}
        {showGuide && (
          <div className="bg-gray-50 border rounded-md p-3 text-sm text-gray-700 mb-4">
            <p className="font-semibold mb-2">Follow these steps:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Go to your Google Account.</li>
              <li>
                Click on <b>Security</b>.
              </li>
              <li>
                Enable <b>2-Step Verification</b>.
              </li>
              <li>
                After enabling 2FA, go to <b>App Passwords</b>.
              </li>
              <li>
                Select:
                <ul className="list-disc ml-4">
                  <li>
                    App: <b>Mail</b>
                  </li>
                  <li>
                    Device: <b>Other</b>
                  </li>
                </ul>
              </li>
              <li>
                Click <b>Generate</b>.
              </li>
              <li>Copy the 16-character password and paste it below.</li>
            </ol>
          </div>
        )}

        {message && (
          <p className="text-sm text-center mb-3 text-blue-600">{message}</p>
        )}

        <input
          type="password"
          placeholder="Enter Gmail App Password"
          value={appPassword}
          onChange={(e) => setAppPassword(e.target.value)}
          className="w-full h-10 border rounded-md px-3 mb-4"
        />

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
