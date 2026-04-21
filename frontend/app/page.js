"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import Dashboard from "../components/Dashboard";
import ApplicationForm from "../components/ApplicationForm";
import SupportingDocuments from "@/components/SupportingDocuments";
import ApplicationHistory from "../components/ApplicationHistory"; // NEW

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const { data: session, status } = useSession();
  const [view, setView] = useState("dashboard");
  const [savedParcels, setSavedParcels] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFinalSubmit = async (formData) => {
    const payload = {
      user_id: session?.user?.id,
      betrieb_id: session?.user?.betrieb_id,
      winery_name: session?.user?.winery_name,
      is_bio: session?.user?.is_bio,
      selected_parcels: savedParcels,
      form_data: formData,
      supporting_documents: uploadedFiles,
      type: "main",
    };

    try {
      const res = await fetch("http://localhost:8000/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Erfolgreich eingereicht!");
        setView("dashboard");
      }
    } catch (err) {
      alert("Fehler!");
    }
  };

  if (status === "loading")
    return (
      <div className="flex min-h-screen items-center justify-center">
        Initialisierung...
      </div>
    );

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-50">
      <Header />

      <div className="w-full max-w-5xl">
        {!session ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-slate-200">
            {/* Login screen code... */}
          </div>
        ) : (
          <>
            {view === "dashboard" && (
              <Dashboard onAction={(id) => setView(id)} />
            )}

            {view === "new" && (
              <Map
                savedParcels={savedParcels}
                setSavedParcels={setSavedParcels}
                onFinish={() => setView("form")}
              />
            )}

            {view === "form" && (
              <div className="space-y-6">
                <button
                  onClick={() => setView("new")}
                  className="text-blue-600 font-medium"
                >
                  ← Zurück zur Karte
                </button>
                <ApplicationForm onSubmit={handleFinalSubmit} />
                <SupportingDocuments
                  betrieb_id={session.user.betrieb_id}
                  onUploadSuccess={(path) =>
                    setUploadedFiles((prev) => [...prev, path])
                  }
                />
              </div>
            )}

            {view === "history" && (
              <ApplicationHistory
                betrieb_id={session.user.betrieb_id}
                onBack={() => setView("dashboard")}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
