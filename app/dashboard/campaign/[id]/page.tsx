"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface HR {
  _id?: string;
  name: string;
  email: string;
  company?: string;
  status?: "sent" | "not_sent" | "failed";
  error?: string | null;
}

interface Campaign {
  _id: string;
  name: string;
  role: string;
  subject: string;
  template: string;
  hrList: HR[];
  status: "draft" | "sending" | "completed";
  createdAt: string;
}

export default function CampaignDetails() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [subject, setSubject] = useState("");
  const [template, setTemplate] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/campaigns/${id}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!data.success) {
          router.push("/dashboard");
          return;
        }

        setCampaign(data.campaign);
        setSubject(data.campaign.subject || "");
        setTemplate(data.campaign.template || "");
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCampaign();
  }, [id, router]);

  useEffect(() => {
  if (!campaign || campaign.status !== "sending") return;

  const interval = setInterval(async () => {
    const res = await fetch(
      `http://localhost:5000/api/campaigns/${campaign._id}`,
      { credentials: "include" }
    );
    const data = await res.json();

    if (data.success) {
      setCampaign(data.campaign);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [campaign?.status]);

  const handleSaveTemplate = async () => {
    if (!campaign) return;

    try {
      setSaving(true);

      const res = await fetch(
        `http://localhost:5000/api/campaigns/${campaign._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: campaign.name,
            role: campaign.role,
            subject,
            template,
          }),
        },
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      // Refetch latest data from DB
      const updatedRes = await fetch(
        `http://localhost:5000/api/campaigns/${campaign._id}`,
        { credentials: "include" },
      );
      const updatedData = await updatedRes.json();

      if (updatedData.success) {
        setCampaign(updatedData.campaign);
        setSubject(updatedData.campaign.subject);
        setTemplate(updatedData.campaign.template);
      }

      setIsEditing(false);
      alert("Template updated successfully");
    } catch {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleStartSending = async () => {
    if (!campaign) return;

    try {
      setSending(true);

      const res = await fetch(
        `http://localhost:5000/api/campaigns/${campaign._id}/start`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert("Campaign started successfully");
      window.location.reload();
    } catch {
      alert("Failed to start campaign");
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setAttachments((prev) => [...prev, ...Array.from(files)]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
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

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Email Template</h2>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={handleSaveTemplate}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-1.5 rounded text-sm"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </div>

          <div className="border rounded-xl overflow-hidden bg-white">
            <div className="border-b px-4 py-3 bg-gray-50 space-y-3">
              <div className="text-sm text-gray-600">
                To: All HRs ({campaign.hrList.length})
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Subject:
                </span>
                <input
                  type="text"
                  value={subject}
                  disabled={!isEditing}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-base font-medium border-b border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="relative">
              <textarea
                value={template}
                disabled={!isEditing}
                placeholder="enter your message here..."
                onChange={(e) => setTemplate(e.target.value)}
                rows={10}
                className="w-full p-4 outline-none resize-none"
              />

              {isEditing && (
                <div className="absolute bottom-3 left-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 text-lg"
                  >
                    📎
                  </button>
                </div>
              )}
            </div>

            {attachments.length > 0 && (
              <div className="border-t bg-gray-50 p-4">
                <p className="text-sm font-medium mb-2">Attachments:</p>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white border px-3 py-1 rounded text-sm"
                    >
                      <span>{file.name}</span>
                      {isEditing && (
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="mb-8">
          <button
            onClick={handleStartSending}
            disabled={sending || campaign.status !== "draft"}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            {sending ? "Starting..." : "Start Sending"}
          </button>
        </div>


            
        <div>
          <h2 className="text-xl font-semibold mb-4">
            HR List ({campaign.hrList.length})
          </h2>

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
                <tr key={index}>
                  <td className="p-2 border">{hr.name}</td>
                  <td className="p-2 border">{hr.email}</td>
                  <td className="p-2 border">{hr.company || "-"}</td>
                  <td className="p-2 border">
                    {hr.status === "sent" ? (
                      <span className="text-green-600">Sent</span>
                    ) : hr.status === "failed" ? (
                      <span className="text-red-600">Failed</span>
                    ) : (
                      <span className="text-gray-500">Not Sent</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
