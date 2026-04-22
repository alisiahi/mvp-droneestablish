"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import Dashboard from "../components/Dashboard";
import ApplicationForm from "../components/ApplicationForm";
import SupportingDocuments from "@/components/SupportingDocuments";
import ApplicationHistory from "../components/ApplicationHistory";
import ReportAppSelector from "../components/ReportAppSelector";
import JahresmeldungForm from "../components/JahresmeldungForm";
import Report48Form from "../components/Report48Form";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const { data: session, status } = useSession();
  const [view, setView] = useState("dashboard");
  const [savedParcels, setSavedParcels] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [currentAppId, setCurrentAppId] = useState(null);
  const [initialFormData, setInitialFormData] = useState(null);
  const [selectedReportApp, setSelectedReportApp] = useState(null);

  const processFiles = async () => {
    // 1. Delete files
    for (const path of filesToDelete) {
      try {
        await fetch(`http://localhost:8000/upload/${encodeURIComponent(path)}`, { method: "DELETE" });
      } catch (e) {
        console.error("Delete failed", e);
      }
    }

    // 2. Upload pending files
    const newlyUploadedPaths = [];
    if (pendingFiles.length > 0) {
      const tempAppId = `temp-${Date.now()}`;
      for (const file of pendingFiles) {
        const fd = new FormData();
        fd.append("file", file);
        try {
          const res = await fetch(`http://localhost:8000/upload/${session.user.betrieb_id}/${tempAppId}`, { method: "POST", body: fd });
          const data = await res.json();
          newlyUploadedPaths.push(data.minio_path);
        } catch (e) {
          console.error("Upload failed", e);
        }
      }
    }

    return newlyUploadedPaths;
  };

  const handleFinalSubmit = async (formData) => {
    const newlyUploadedPaths = await processFiles();
    const finalDocs = [...uploadedFiles.filter(p => !filesToDelete.includes(p)), ...newlyUploadedPaths];

    const payload = {
      user_id: session?.user?.id,
      user_roles: session?.user?.roles,
      betrieb_id: session?.user?.betrieb_id,
      winery_name: session?.user?.winery_name,
      is_bio: session?.user?.is_bio,
      selected_parcels: savedParcels,
      form_data: formData,
      supporting_documents: finalDocs,
      type: "main",
      status: "submitted",
    };

    try {
      const url = currentAppId 
        ? `http://localhost:8000/applications/${currentAppId}`
        : "http://localhost:8000/applications";
      const method = currentAppId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Erfolgreich eingereicht!");
        setView("dashboard");
        setCurrentAppId(null);
        setInitialFormData(null);
        setSavedParcels([]);
        setUploadedFiles([]);
        setPendingFiles([]);
        setFilesToDelete([]);
      } else if (res.status === 403) {
        alert("Sie haben nicht die Berechtigung, den Antrag abzuschließen.");
      } else {
        alert("Fehler beim Einreichen!");
      }
    } catch (err) {
      alert("Fehler!");
    }
  };

  const handleSaveDraft = async (formData) => {
    const newlyUploadedPaths = await processFiles();
    const finalDocs = [...uploadedFiles.filter(p => !filesToDelete.includes(p)), ...newlyUploadedPaths];

    const payload = {
      user_id: session?.user?.id,
      user_roles: session?.user?.roles,
      betrieb_id: session?.user?.betrieb_id,
      winery_name: session?.user?.winery_name,
      is_bio: session?.user?.is_bio,
      selected_parcels: savedParcels,
      form_data: formData,
      supporting_documents: finalDocs,
      type: "main",
      status: "draft",
    };

    try {
      const url = currentAppId 
        ? `http://localhost:8000/applications/${currentAppId}`
        : "http://localhost:8000/applications";
      const method = currentAppId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (!currentAppId) setCurrentAppId(data.id);
        alert("Entwurf erfolgreich gespeichert!");
        setView("dashboard");
        setCurrentAppId(null);
        setInitialFormData(null);
        setSavedParcels([]);
        setUploadedFiles([]);
        setPendingFiles([]);
        setFilesToDelete([]);
      } else {
        alert("Fehler beim Speichern!");
      }
    } catch (err) {
      alert("Fehler beim Speichern des Entwurfs!");
    }
  };

  const handleEditDraft = (app) => {
    setCurrentAppId(app.id);
    setSavedParcels(app.selected_parcels || []);
    setInitialFormData(app.form_data);
    setUploadedFiles(app.supporting_documents || []);
    setPendingFiles([]);
    setFilesToDelete([]);
    setView("form");
  };

  const handleSubmitJahresmeldung = async (formData) => {
    const payload = {
      application_id: selectedReportApp.id,
      user_id: session?.user?.id,
      user_roles: session?.user?.roles,
      betrieb_id: session?.user?.betrieb_id,
      spritzgemeinschaft: formData.spritzgemeinschaft,
      form_data: { spritzungen: formData.spritzungen }
    };
    try {
      const res = await fetch("http://localhost:8000/jahresmeldung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Jahresmeldung erfolgreich eingereicht!");
        setView("dashboard");
        setSelectedReportApp(null);
      } else {
        alert("Fehler beim Einreichen!");
      }
    } catch (e) {
      alert("Fehler!");
    }
  };

  const handleSubmitReport48 = async (formData) => {
    const payload = {
      application_id: selectedReportApp.id,
      user_id: session?.user?.id,
      user_roles: session?.user?.roles,
      betrieb_id: session?.user?.betrieb_id,
      spritzgemeinschaft: formData.spritzgemeinschaft,
      form_data: { spritzung: formData.spritzung }
    };
    try {
      const res = await fetch("http://localhost:8000/report48h", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("48-Stunden Meldung erfolgreich eingereicht!");
        setView("dashboard");
        setSelectedReportApp(null);
      } else {
        alert("Fehler beim Einreichen!");
      }
    } catch (e) {
      alert("Fehler!");
    }
  };

  const handleAction = (id) => {
    if (id === "new") {
      setCurrentAppId(null);
      setInitialFormData(null);
      setSavedParcels([]);
      setUploadedFiles([]);
      setPendingFiles([]);
      setFilesToDelete([]);
    }
    if (id === "report_yearly" || id === "report_48") {
      setSelectedReportApp(null);
    }
    setView(id);
  };

  if (status === "loading")
    return (
      <div className="flex min-h-screen items-center justify-center">
        Initialisierung...
      </div>
    );

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-slate-50">
      <Header onHomeClick={() => setView("dashboard")} />

      <div className="w-full max-w-5xl">
        {!session ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-slate-200">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Willkommen bei DroneEstablish</h2>
            <p className="text-slate-600 mb-6">Bitte melden Sie sich an, um fortzufahren.</p>
            <button
              onClick={() => signIn("keycloak")}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-md hover:bg-blue-700 transition"
            >
              Mit Keycloak anmelden
            </button>
          </div>
        ) : (
          <>
            {view === "dashboard" && (
              <Dashboard onAction={handleAction} />
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
                <ApplicationForm 
                  onSubmit={handleFinalSubmit} 
                  onSaveDraft={handleSaveDraft}
                  initialData={initialFormData} 
                  roles={session.user.roles}
                />
                <SupportingDocuments
                  existingFiles={uploadedFiles.filter(p => !filesToDelete.includes(p))}
                  pendingFiles={pendingFiles}
                  onAddFile={(file) => setPendingFiles((prev) => [...prev, file])}
                  onRemovePendingFile={(idx) => setPendingFiles((prev) => prev.filter((_, i) => i !== idx))}
                  onRemoveExistingFile={(path) => setFilesToDelete((prev) => [...prev, path])}
                />
              </div>
            )}

            {view === "history" && (
              <ApplicationHistory
                betrieb_id={session.user.betrieb_id}
                onBack={() => setView("dashboard")}
                onEditDraft={handleEditDraft}
              />
            )}

            {view === "report_yearly" && !selectedReportApp && (
              <ReportAppSelector 
                betrieb_id={session.user.betrieb_id} 
                title="Jahresbericht - Antrag auswählen"
                onSelect={(app) => setSelectedReportApp(app)} 
                onBack={() => setView("dashboard")} 
              />
            )}
            
            {view === "report_yearly" && selectedReportApp && (
              <JahresmeldungForm 
                application={selectedReportApp}
                onSubmit={handleSubmitJahresmeldung}
                onCancel={() => setSelectedReportApp(null)}
              />
            )}

            {view === "report_48" && !selectedReportApp && (
              <ReportAppSelector 
                betrieb_id={session.user.betrieb_id} 
                title="48-Stunden Meldung - Antrag auswählen"
                onSelect={(app) => setSelectedReportApp(app)} 
                onBack={() => setView("dashboard")} 
              />
            )}
            
            {view === "report_48" && selectedReportApp && (
              <Report48Form 
                application={selectedReportApp}
                onSubmit={handleSubmitReport48}
                onCancel={() => setSelectedReportApp(null)}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
