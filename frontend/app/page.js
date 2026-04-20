"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import ApplicationForm from "../components/ApplicationForm";
import SupportingDocuments from "@/components/SupportingDocuments";

// Dynamically import Map to prevent SSR errors with Leaflet
const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-slate-100 rounded-3xl">
      Lade Karte...
    </div>
  ),
});

export default function Home() {
  const { data: session, status } = useSession();
  const [view, setView] = useState("map");
  const [savedParcels, setSavedParcels] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // --- SUBMIT FINAL APPLICATION ---
  const handleFinalSubmit = async (formData) => {
    // Using Optional Chaining (?.) to prevent crashes if session is slow to load
    const payload = {
      user_id: session?.user?.id, // Keycloak 'sub'
      betrieb_id: session?.user?.betrieb_id, // Keycloak Group Attribute
      selected_parcels: savedParcels, // Map data
      form_data: formData, // Form data
      supporting_documents: uploadedFiles, // MinIO paths
      type: "main",
    };

    try {
      const res = await fetch("http://localhost:8000/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Antrag erfolgreich eingereicht!");
        window.location.reload(); // Refresh to start fresh
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Fehler beim Senden. Bitte versuchen Sie es erneut.");
    }
  };

  const handleFinishSelection = () => {
    if (savedParcels.length > 0) {
      setView("form");
    } else {
      alert("Bitte wählen Sie zuerst mindestens ein Flurstück aus.");
    }
  };

  // 1. Handle Loading State
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        KIWI Portal wird initialisiert...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-50">
      <Header />

      <div className="max-w-5xl w-full">
        <h1 className="text-3xl font-bold mb-8 text-center text-slate-800">
          Drohnen-Anwendungsplan 2025
        </h1>

        {!session ? (
          /* --- LANDING VIEW (NOT LOGGED IN) --- */
          <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-slate-200">
            <h2 className="text-2xl font-semibold mb-4">
              Willkommen im KIWI-Portal
            </h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Bitte melden Sie sich an, um Ihre Flurstücke auszuwählen und Ihren
              Anwendungsplan für den Weinbau digital einzureichen.
            </p>
            <button
              onClick={() => signIn("keycloak")}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
            >
              Jetzt Anmelden
            </button>
          </div>
        ) : (
          /* --- APP VIEW (LOGGED IN) --- */
          <>
            {view === "map" ? (
              <div className="space-y-6">
                {/* Parcel Selection View */}
                <Map
                  savedParcels={savedParcels}
                  setSavedParcels={setSavedParcels}
                  onFinish={handleFinishSelection}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={() => setView("map")}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 mb-4"
                >
                  ← Zurück zur Karte (Flurstücke bearbeiten)
                </button>

                {/* Application Form */}
                <ApplicationForm onSubmit={handleFinalSubmit} />

                {/* File Upload Section */}
                <SupportingDocuments
                  betrieb_id={session?.user?.betrieb_id}
                  onUploadSuccess={(path) =>
                    setUploadedFiles((prev) => [...prev, path])
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
