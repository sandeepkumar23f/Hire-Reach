"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCampaign() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    template: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload HR file");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("role", formData.role);
      data.append("template", formData.template);

      data.append("file", file);

      const res = await fetch(
        `${API}/api/campaigns/create`,
        {
          method: "POST",
          credentials: "include",
          body: data,
        }
      );

      const result = await res.json();

      if (result.success) {
        router.push("/dashboard");
      } else {
        alert(result.message || "Failed to create campaign");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 text-black">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Create New Campaign
        </h1>

        <input
          type="text"
          name="name"
          placeholder="Campaign Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full mb-4 border p-2 rounded"
        />

        <input
          type="text"
          name="role"
          placeholder="Role"
          value={formData.role}
          onChange={handleChange}
          required
          className="w-full mb-4 border p-2 rounded"
        />

        <textarea
          name="template"
          placeholder="Email Template"
          value={formData.template}
          onChange={handleChange}
          required
          rows={5}
          className="w-full mb-4 border p-2 rounded"
        />

        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          required
          className="w-full mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Creating..." : "Create Campaign"}
        </button>
      </form>
    </div>
  );
}