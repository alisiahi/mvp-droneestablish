"use client";
import { useState, useEffect } from "react";

export default function ReportAppSelector({ betrieb_id, onSelect, onBack, title }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/applications/${betrieb_id}`)
      .then((res) => res.json())
      .then((data) => {
        // Only show submitted main applications
        const submittedApps = data.filter(a => a.type === "main" && a.status === "submitted");
        setApps(submittedApps);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [betrieb_id]);

  if (loading) return <div className="text-center py-10">Lade Anträge...</div>;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <button onClick={onBack} className="text-blue-600 font-medium">
          Zurück
        </button>
      </div>
      
      {apps.length === 0 ? (
        <p className="text-slate-600">Keine eingereichten Anträge gefunden.</p>
      ) : (
        <div className="space-y-4">
          <p className="text-slate-600 mb-4">Bitte wählen Sie einen Antrag aus, für den Sie die Meldung ausfüllen möchten:</p>
          {apps.map((app) => (
            <div key={app.id} className="p-4 border rounded-xl hover:shadow-md transition flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-800">Antrag #{app.id}</span>
                <span className="ml-4 text-sm text-slate-500">
                  Eingereicht am: {new Date(app.created_at).toLocaleDateString("de-DE")}
                </span>
                <div className="text-sm text-slate-500 mt-1">
                  Ausgewählte Flurstücke: {app.selected_parcels ? app.selected_parcels.length : 0}
                </div>
              </div>
              <button
                onClick={() => onSelect(app)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                Auswählen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
