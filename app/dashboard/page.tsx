"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Lead {
  name: string;
  email: string;
  company: string;
}

interface Campaign {
  _id: string;
  name: string;
  role: string;
  hrList: Lead[];
  createdAt: string;
}

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/campaigns", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10 text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">Your Campaigns</h1>

        <button
          onClick={() => router.push("/dashboard/create")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Create Campaign
        </button>
      </div>

      {/* Campaign Grid */}
      {campaigns.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <p className="text-gray-500 mb-4">
            No campaigns yet. Start your first outreach 🚀
          </p>
          <button
            onClick={() => router.push("/dashboard/create")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign._id}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold mb-1">
                {campaign.name}
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                {campaign.role}
              </p>

              <div className="text-sm text-gray-600 space-y-1">
                <p>Total Leads: {campaign.hrList?.length || 0}</p>
                <p>
                  Created:{" "}
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() =>
                  router.push(`/dashboard/${campaign._id}`)
                }
                className="mt-5 text-blue-600 text-sm font-medium"
              >
                View Details →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}