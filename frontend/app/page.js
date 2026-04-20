"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import ApplicationForm from "../components/ApplicationForm";

const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center">
      Lade Karte...
    </div>
  ),
});

export default function Home() {
  const { data: session, status } = useSession();
  const [view, setView] = useState("map");
  const [savedParcels, setSavedParcels] = useState([]);

  const handleFinishSelection = () => {
    if (savedParcels.length > 0) {
      setView("form");
    } else {
      alert("Bitte wählen Sie zuerst mindestens ein Flurstück aus.");
    }
  };

  // While checking if user is logged in
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Initialisierung...
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
                <ApplicationForm selectedParcels={savedParcels} />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
