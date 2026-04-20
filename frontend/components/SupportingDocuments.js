"use client";
import { useState } from "react";

export default function SupportingDocuments({ betrieb_id, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [tempAppId] = useState(`temp-${Date.now()}`); // Temporary ID for the upload folder

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Matches backend: /upload/{betrieb_id}/{app_temp_id}
      const res = await fetch(
        `http://localhost:8000/upload/${betrieb_id}/${tempAppId}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();
      onUploadSuccess(data.minio_path); // e.g., "101/temp-123/cert.pdf"
      alert(`${file.name} erfolgreich hochgeladen!`);
    } catch (err) {
      alert("Fehler beim Upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200">
      <h3 className="text-lg font-bold text-blue-900 mb-2">
        Supporting Documents
      </h3>
      <p className="text-sm text-blue-700 mb-4">
        Laden Sie hier Nachweise (z.B. Sachkundenachweis) hoch. [cite: 4]
      </p>
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white cursor-pointer"
      />
      {uploading && (
        <p className="mt-2 text-sm animate-pulse">Wird hochgeladen...</p>
      )}
    </div>
  );
}
