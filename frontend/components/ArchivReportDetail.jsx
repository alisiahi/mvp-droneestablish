import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function ArchivReportDetail({ report, onBack }) {
  const isJahresmeldung = report.docType === "jahresmeldung";
  const titleText = isJahresmeldung ? "JAHRESBERICHT 2025" : "48-STUNDEN MELDUNG";
  
  let spritzungen = [];
  if (isJahresmeldung) {
    spritzungen = report.form_data?.spritzungen || [];
  } else {
    spritzungen = report.form_data?.spritzung ? [report.form_data.spritzung] : [];
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-20">
      <button
        onClick={onBack}
        className="text-blue-700 font-bold hover:underline flex items-center gap-2"
      >
        ← ZURÜCK ZUR ÜBERSICHT
      </button>

      <Card className="border-[3px] border-slate-900 shadow-2xl rounded-none overflow-hidden bg-white">
        {/* 1. OFFICIAL HEADER */}
        <div className="bg-slate-900 text-white p-8 flex justify-between items-center border-b-[3px] border-slate-900">
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-tight flex items-center gap-3">
              <ClipboardList size={28} className="text-blue-400" />
              {titleText}
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-widest">
              Eingereicht am:{" "}
              {new Date(report.created_at).toLocaleString("de-DE")}
            </p>
          </div>
          <div className="text-right border-l-2 border-slate-700 pl-6">
            <div className="text-xl font-black text-blue-400">
              Meldung zu Antrag #{report.application_id}
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <span className="bg-slate-800 text-slate-300 px-2 py-1 text-[10px] font-bold border border-slate-700">
                BETRIEB-ID: {report.betrieb_id}
              </span>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* 2. ANTRAGSSTELLER INFO */}
          <div className="p-5 border-b-2 border-slate-200 bg-slate-50/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
              Spritzgemeinschaft / beauftragter Dritte
            </p>
            <p className="font-bold text-slate-800 text-lg">
              {report.spritzgemeinschaft || "-"}
            </p>
          </div>

          {/* 3. ANWENDUNGSTABELLE (Optimized for Reports) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="p-4 border-r border-slate-800 text-center w-12">
                    Nr.
                  </th>
                  <th className="p-4 border-r border-slate-800 w-32">
                    Datum
                  </th>
                  <th className="p-4 border-r border-slate-800 w-32 text-center">
                    Fläche (ha)
                  </th>
                  <th className="p-4 border-r border-slate-800">
                    Pflanzenschutzmittel / Pilzkrankheiten
                  </th>
                  <th className="p-4 border-slate-800 text-center w-32">
                    Aufwandmenge
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {spritzungen.map((s, index) => (
                  <tr key={index} className="group align-top">
                    <td className="p-4 border-r font-black text-center bg-slate-50 text-slate-400">
                      {s.id || index + 1}
                    </td>
                    <td className="p-4 border-r font-medium text-slate-600 italic">
                      {s.datum || s.date || "---"}
                    </td>
                    <td className="p-4 border-r text-center font-mono font-bold text-blue-700 bg-blue-50/30">
                      {s.behandelteFlaeche ? `${s.behandelteFlaeche} ha` : "---"}
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
                    <td className="p-4 text-center font-mono font-bold text-slate-800">
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
                  </tr>
                ))}
                {spritzungen.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400 italic font-medium">
                      Keine Spritzungen hinterlegt.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
