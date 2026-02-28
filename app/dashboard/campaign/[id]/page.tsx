"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface HR {
  name: string;
  email: string;
  company?: string;
  status?: "sent" | "not_sent";
}

interface Campaign {
  _id: string;
  name: string;
  role: string;
  template: string;
  hrList: HR[];
  createdAt: string;
}

export default function CampaignDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [template, setTemplate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/campaigns/${id}`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (data.success) {
          setCampaign(data.campaign);
          setTemplate(data.campaign.template);
        } else {
          alert(data.message);
          router.push("/dashboard");
        }
      } catch (error) {
        console.error(error);
        alert("Failed to load campaign");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCampaign();
  }, [id, router]);

  const handleSaveTemplate = () => {
    if (!campaign) return;
    setSaving(true);

    setTimeout(() => {
      setCampaign({ ...campaign, template });
      setSaving(false);
      alert("Template updated");
    }, 800);
  };

  // 🔹 Start Sending Simulation
  const handleStartSending = async () => {
    if (!campaign) return;

    setSending(true);

    let updatedList = [...campaign.hrList];

    for (let i = 0; i < updatedList.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 700));

      updatedList[i] = {
        ...updatedList[i],
        status: "sent",
      };

      setCampaign((prev) =>
        prev
          ? {
              ...prev,
              hrList: [...updatedList],
            }
          : prev
      );
    }

    setSending(false);
    alert("All emails marked as sent (simulation)");
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Loading campaign details...
      </div>
    );
  }

  if (!campaign) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-blue-600 text-sm"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-4">{campaign.name}</h1>

        <p className="mb-2">
          <strong>Role:</strong> {campaign.role}
        </p>

        <p className="mb-6 text-sm text-gray-500">
          Created on: {new Date(campaign.createdAt).toLocaleDateString()}
        </p>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Email Template (You can edit as your need)
          </h2>

          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={8}
            className="w-full border p-4 rounded bg-gray-50"
          />

          <button
            onClick={handleSaveTemplate}
            disabled={saving}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={handleStartSending}
            disabled={sending}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            {sending ? "Sending..." : "Start Sending"}
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            HR List ({campaign.hrList.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Company</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaign.hrList.map((hr, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-2 border">{hr.name}</td>
                    <td className="p-2 border">{hr.email}</td>
                    <td className="p-2 border">{hr.company || "-"}</td>
                    <td className="p-2 border">
                      {hr.status === "sent" ? (
                        <span className="text-green-600 font-medium">
                          Sent
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium">
                          Not Sent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}