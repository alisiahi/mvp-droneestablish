"use client";
import React from "react";
import { Trash2 } from "lucide-react";

export default function SupportingDocuments({
  existingFiles = [],
  pendingFiles = [],
  onAddFile,
  onRemovePendingFile,
  onRemoveExistingFile,
}) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onAddFile(file);
    e.target.value = null; // reset input
  };

  return (
    <div className="mt-8 p-6 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200">
      <h3 className="text-lg font-bold text-blue-900 mb-2">
        Supporting Documents
      </h3>
      <p className="text-sm text-blue-700 mb-4">
        Wählen Sie hier Nachweise (z.B. Sachkundenachweis) aus. Die Dateien werden beim Speichern des Entwurfs oder Abschluss des Antrags hochgeladen.
      </p>

      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white cursor-pointer"
        />
      </div>

      <div className="space-y-4 mt-6">
        {existingFiles.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Bereits hochgeladene Dateien:</h4>
            <ul className="space-y-2">
              {existingFiles.map((path, idx) => {
                const filename = path.split("/").pop();
                return (
                  <li key={idx} className="flex items-center justify-between bg-white p-3 rounded shadow-sm border border-slate-200">
                    <span className="text-sm text-slate-600 truncate mr-4" title={path}>{filename}</span>
                    <button
                      onClick={() => onRemoveExistingFile(path)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Löschen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {pendingFiles.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Neu ausgewählte Dateien (werden beim Speichern hochgeladen):</h4>
            <ul className="space-y-2">
              {pendingFiles.map((file, idx) => (
                <li key={idx} className="flex items-center justify-between bg-blue-100 p-3 rounded shadow-sm border border-blue-200">
                  <span className="text-sm text-blue-800 truncate mr-4" title={file.name}>{file.name}</span>
                  <button
                    onClick={() => onRemovePendingFile(idx)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                    title="Entfernen"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
