"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import Dashboard from "../components/Dashboard";
import ApplicationForm from "../components/ApplicationForm";
import SupportingDocuments from "@/components/SupportingDocuments";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const { data: session, status } = useSession();
  const [view, setView] = useState("dashboard"); // Default to Dashboard
  const [savedParcels, setSavedParcels] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFinalSubmit = async (formData) => {
    const payload = {
      user_id: session?.user?.id,
      betrieb_id: session?.user?.betrieb_id,
      winery_name: session?.user?.winery_name, // NEW
      is_bio: session?.user?.is_bio, // NEW
      selected_parcels: savedParcels,
      form_data: formData,
      supporting_documents: uploadedFiles,
      type: view === "report_48" ? "48h_report" : "main",
    };

    try {
      const res = await fetch("http://localhost:8000/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Erfolgreich gespeichert!");
        setView("dashboard");
      }
    } catch (err) {
      alert("Fehler beim Senden.");
    }
  };

  if (status === "loading")
    return (
      <div className="flex min-h-screen items-center justify-center">
        Lade Portal...
      </div>
    );

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-50">
      <Header />

      {!session ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-slate-200 max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">
            Willkommen bei KIWI Drones
          </h2>
          <p className="text-slate-600">
            Bitte melden Sie sich an, um Ihre Anträge zu verwalten.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-5xl">
          {/* VIEW CONTROLLER */}
          {view === "dashboard" && (
            <Dashboard
              onAction={(action) => {
                if (action === "new") setView("map");
                else if (action === "history") setView("history");
                // ... handle other actions
              }}
            />
          )}

          {view === "map" && (
            <Map
              savedParcels={savedParcels}
              setSavedParcels={setSavedParcels}
              onFinish={() => setView("form")}
            />
          )}

          {view === "form" && (
            <>
              <button
                onClick={() => setView("map")}
                className="mb-4 text-blue-600 font-medium"
              >
                ← Zurück
              </button>
              <ApplicationForm onSubmit={handleFinalSubmit} />
              <SupportingDocuments
                betrieb_id={session.user.betrieb_id}
                onUploadSuccess={(path) =>
                  setUploadedFiles((prev) => [...prev, path])
                }
              />
            </>
          )}

          {view === "history" && (
            <div className="text-center">
              <button
                onClick={() => setView("dashboard")}
                className="mb-4 text-blue-600 font-medium"
              >
                ← Zum Dashboard
              </button>
              <h2 className="text-2xl font-bold">Vergangene Berichte</h2>
              <p className="text-slate-500">
                Hier werden bald Ihre Berichte aus pgAdmin angezeigt.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
