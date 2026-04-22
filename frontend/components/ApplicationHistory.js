"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Download, MapPin, ClipboardList, Info } from "lucide-react";

export default function ApplicationHistory({ betrieb_id, onBack, onEditDraft }) {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/applications/${betrieb_id}`)
      .then((res) => res.json())
      .then((data) => {
        setApplications(data);
        setLoading(false);
      });
  }, [betrieb_id]);

  if (loading)
    return (
      <p className="text-center py-10 text-slate-500 font-medium italic">
        Lade Archivdaten...
      </p>
    );

  // --- DETAIL VIEW: Exact matches to ZAWP_D_2025 PDF ---
  if (selectedApp) {
    const { general, spritzungen } = selectedApp.form_data;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-20">
        <button
          onClick={() => setSelectedApp(null)}
          className="text-blue-700 font-bold hover:underline flex items-center gap-2"
        >
          ← ZURÜCK ZUR ÜBERSICHT
        </button>

        <Card className="border-[3px] border-slate-900 shadow-2xl rounded-none overflow-hidden bg-white">
          {/* 1. OFFICIAL HEADER [cite: 3, 5] */}
          <div className="bg-slate-900 text-white p-8 flex justify-between items-center border-b-[3px] border-slate-900">
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-tight">
                ANWENDUNGSPLAN Drohne Steillagenweinbau 2025 [cite: 3]
              </h1>
              <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest">
                Eingereicht am:{" "}
                {new Date(selectedApp.created_at).toLocaleString("de-DE")}
              </p>
            </div>
            <div className="text-right border-l-2 border-slate-700 pl-6">
              <div className="text-xl font-black text-blue-400">
                {selectedApp.winery_name}
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <span className="bg-slate-800 text-slate-300 px-2 py-1 text-[10px] font-bold border border-slate-700">
                  BETRIEB-ID: {selectedApp.betrieb_id}
                </span>
                <span
                  className={`px-2 py-1 text-[10px] font-black uppercase ${selectedApp.is_bio ? "bg-green-500 text-slate-900" : "bg-amber-500 text-slate-900"}`}
                >
                  {selectedApp.is_bio ? "BIO-BETRIEB" : "KONVENTIONELL"}
                </span>
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            {/* 2. ANTRAGSSTELLER INFO  */}
            <div className="grid grid-cols-3 border-b-2 border-slate-200 bg-slate-50/50">
              <div className="p-5 border-r-2 border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Spritzgemeinschaft / beauftragter Dritte{" "}
                </p>
                <p className="font-bold text-slate-800">
                  {general?.spritzgemeinschaft || "-"}
                </p>
              </div>
              <div className="p-5 border-r-2 border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Ansprechpartner{" "}
                </p>
                <p className="font-bold text-slate-800">
                  {general?.ansprechpartner || "-"}
                </p>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Tel{" "}
                </p>
                <p className="font-bold text-slate-800">
                  {general?.tel || "-"}
                </p>
              </div>
            </div>

            {/* 3. FLURSTÜCKSVERZEICHNIS */}
            <div className="p-8 border-b-2 border-slate-200">
              <h3 className="text-xs font-black text-slate-900 uppercase mb-4 flex items-center gap-2 tracking-widest">
                <MapPin size={16} className="text-blue-600" /> Verzeichnis der
                behandelten Flurstücke
              </h3>
              <table className="w-full text-left text-sm border border-slate-200">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[10px] font-bold text-slate-500 uppercase">
                    <th className="p-3">Kennzeichen (ALKIS)</th>
                    <th className="p-3">Gemarkung / Flur</th>
                    <th className="p-3">Lagebezeichnung</th>
                    <th className="p-3 text-right">Fläche (m²)</th>
                    <th className="p-3 text-right">Hektar (ha)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {selectedApp.selected_parcels?.map((p, i) => {
                    const d = p.extracted || p.properties;
                    return (
                      <tr key={i} className="hover:bg-blue-50/50">
                        <td className="p-3 font-bold text-blue-900">
                          {d.kennzeichen || d.flstkennz}
                        </td>
                        <td className="p-3">
                          {d.gemarkung}, {d.flur}
                        </td>
                        <td className="p-3 italic text-slate-500">
                          {d.lage || d.lagebeztxt}
                        </td>
                        <td className="p-3 text-right">
                          {d.areaM2 || d.flaeche} m²
                        </td>
                        <td className="p-3 text-right font-black">
                          {((d.areaM2 || d.flaeche) / 10000).toFixed(4)} ha
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 4. ANWENDUNGSTABELLE  */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <tr>
                    <th className="p-4 border-r border-slate-800 text-center w-12">
                      Nr.
                    </th>
                    <th className="p-4 border-r border-slate-800 w-20">ES </th>
                    <th className="p-4 border-r border-slate-800 w-32">
                      Datum{" "}
                    </th>
                    <th className="p-4 border-r border-slate-800">
                      Pflanzenschutzmittel / Pilzkrankheiten{" "}
                    </th>
                    <th className="p-4 border-r border-slate-800 text-center w-24">
                      Aufwandmenge*{" "}
                    </th>
                    <th className="p-4 border-r border-slate-800 w-48">
                      Verantwortlicher / Helfer{" "}
                    </th>
                    <th className="p-4">Anmerkungen </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {spritzungen?.map((s) => (
                    <tr key={s.id} className="group align-top">
                      <td className="p-4 border-r font-black text-center bg-slate-50 text-slate-400">
                        {s.id}
                      </td>
                      <td className="p-4 border-r font-mono font-bold text-slate-700">
                        {s.es}
                      </td>
                      <td className="p-4 border-r font-medium text-slate-600 italic">
                        {s.date || "---"}
                      </td>
                      <td className="p-4 border-r">
                        {s.combinations?.length > 0 ? (
                          <div className="space-y-3">
                            {s.combinations.map((c, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col border-l-2 border-blue-100 pl-2"
                              >
                                <span className="font-black text-blue-900 leading-none uppercase text-[11px] mb-1">
                                  {c.productName}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold italic tracking-tight">
                                  {c.diseaseName}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">
                            Nicht belegt
                          </span>
                        )}
                      </td>
                      <td className="p-4 border-r text-center font-mono font-bold text-slate-800">
                        {s.combinations?.map((c, idx) => (
                          <div
                            key={idx}
                            className="mb-3 last:mb-0 h-[26px] flex items-center justify-center bg-slate-50 border border-slate-100"
                          >
                            {c.amount}{" "}
                            <span className="ml-1 text-[9px] text-slate-400">
                              {c.unit}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="p-4 border-r text-[10px] font-bold text-slate-700 leading-snug">
                        {s.verantwortlicher || "-"}
                      </td>
                      <td className="p-4 text-[10px] text-slate-500 italic leading-tight">
                        {s.anmerkungen || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 5. DOWNLOADS: Official Attachments */}
            <div className="p-8 bg-slate-900 text-white border-t-[3px] border-slate-900">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2 text-blue-400">
                <Download size={14} /> Hinterlegte Dokumente (Digitaler Anhang)
              </h4>
              <div className="flex flex-wrap gap-4">
                {selectedApp.supporting_documents?.map((path, i) => (
                  <a
                    key={i}
                    href={`http://localhost:8000/download/${path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-white text-slate-900 hover:bg-blue-600 hover:text-white border-2 border-white px-6 py-3 text-[10px] font-black transition-all shadow-[6px_6px_0px_0px_rgba(30,41,59,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    DOKUMENT {i + 1} HERUNTERLADEN
                  </a>
                ))}
                {(!selectedApp.supporting_documents ||
                  selectedApp.supporting_documents.length === 0) && (
                  <p className="text-[10px] text-slate-500 italic uppercase">
                    Keine Dateien hochgeladen.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10 animate-in fade-in duration-700">
      <button
        onClick={onBack}
        className="text-slate-500 font-bold text-[10px] tracking-widest hover:text-blue-600 transition-colors"
      >
        ← DASHBOARD
      </button>

      <div className="flex flex-col border-l-8 border-slate-900 pl-6">
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
          Archiv
        </h2>
        <p className="text-slate-400 mt-2 font-mono text-sm">
          Dokumentationsübersicht für Betrieb {betrieb_id}
        </p>
      </div>

      <div className="grid gap-6">
        {applications.map((app) => (
          <div
            key={app.id}
            onClick={() => {
              if (app.status === "draft") {
                if (onEditDraft) onEditDraft(app);
              } else {
                setSelectedApp(app);
              }
            }}
            className={`group flex justify-between items-center p-10 bg-white border-4 ${app.status === "draft" ? "border-amber-200 hover:border-amber-500" : "border-slate-100 hover:border-slate-900"} cursor-pointer transition-all hover:shadow-2xl active:scale-[0.98]`}
          >
            <div className="flex items-center gap-10">
              <span className={`text-5xl font-black italic ${app.status === "draft" ? "text-amber-100 group-hover:text-amber-500" : "text-slate-100 group-hover:text-slate-900"} transition-colors`}>
                #{app.id}
              </span>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.25em] mb-2 ${app.status === "draft" ? "text-amber-600" : "text-blue-600"}`}>
                  {app.type === "main"
                    ? "Jahres-Anwendungsplan [cite: 3]"
                    : "48h Meldung"}
                </p>
                <p className="text-3xl font-black text-slate-800">
                  {new Date(app.created_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              {app.status === "draft" ? (
                <span className="text-[11px] font-black px-4 py-1.5 border-[3px] border-amber-500 text-amber-500 bg-amber-50">
                  ENTWURF
                </span>
              ) : (
                <span
                  className={`text-[11px] font-black px-4 py-1.5 border-[3px] ${app.is_bio ? "border-green-600 text-green-600" : "border-slate-300 text-slate-400"}`}
                >
                  {app.is_bio ? "BIO" : "KONV"}
                </span>
              )}
              <span className={`text-4xl font-black group-hover:translate-x-3 transition-all ${app.status === "draft" ? "text-amber-200 group-hover:text-amber-500" : "text-slate-200 group-hover:text-slate-900"}`}>
                →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
