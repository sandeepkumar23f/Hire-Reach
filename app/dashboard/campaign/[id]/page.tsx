"use client";

import { useEffect, useRef, useState } from "react";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [subject, setSubject] = useState("");
  const [template, setTemplate] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // 🔥 NEW

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
          setTemplate(data.campaign.template || "");
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
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
      setIsEditing(false); // 🔥 Back to view mode
      alert("Template updated");
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...filesArray]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

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
        prev ? { ...prev, hrList: [...updatedList] } : prev
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

        {/* ================= EMAIL TEMPLATE ================= */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">
              Email Template
            </h2>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 transition"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={handleSaveTemplate}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700 transition"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </div>

          <div className="border rounded-xl overflow-hidden shadow-sm bg-white">

            {/* Header */}
            <div className="border-b px-4 py-3 bg-gray-50">
              <div className="text-sm text-gray-600 mb-2">
                To: All HRs ({campaign.hrList.length})
              </div>

              <input
                type="text"
                placeholder="Subject"
                value={subject}
                disabled={!isEditing}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full bg-transparent outline-none text-base font-medium ${
                  !isEditing ? "text-gray-500 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {/* Body */}
            <div className="relative">
              <textarea
                value={template}
                disabled={!isEditing}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="Write your email..."
                rows={10}
                className={`w-full p-4 outline-none resize-none ${
                  !isEditing ? "bg-gray-50 text-gray-600 cursor-not-allowed" : ""
                }`}
              />

              {isEditing && (
                <div className="absolute bottom-3 left-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 hover:text-black text-lg"
                    title="Attach files"
                  >
                    📎
                  </button>
                </div>
              )}
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="border-t bg-gray-50 p-4">
                <p className="text-sm font-medium mb-2">
                  Attachments:
                </p>

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

        {/* Start Sending */}
        <div className="mb-8">
          <button
            onClick={handleStartSending}
            disabled={sending}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            {sending ? "Sending..." : "Start Sending"}
          </button>
        </div>

        {/* HR List */}
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