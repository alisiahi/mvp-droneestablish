import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReportSpritzungItem from "./ReportSpritzungItem";

export default function JahresmeldungForm({ application, onSubmit, onCancel }) {
  const currentDate = new Date().toISOString().split("T")[0];
  
  const [formData, setFormData] = useState({
    spritzgemeinschaft: application.form_data?.general?.spritzgemeinschaft || "",
    spritzungen: Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      datum: "",
      behandelteFlaeche: "",
      combinations: [],
    })),
  });

  const updateSpritzung = (index, updatedData) => {
    const newSpritzungen = [...formData.spritzungen];
    newSpritzungen[index] = updatedData;
    setFormData((prev) => ({ ...prev, spritzungen: newSpritzungen }));
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Jahresmeldung für Antrag #{application.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Datum der Meldung</Label>
              <div className="p-3 bg-slate-100 rounded-md border border-slate-200 text-slate-600 font-medium">
                {new Date(currentDate).toLocaleDateString("de-DE")}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Spritzgemeinschaft</Label>
              <Input
                value={formData.spritzgemeinschaft}
                onChange={(e) => setFormData({ ...formData, spritzgemeinschaft: e.target.value })}
                placeholder="Name der Spritzgemeinschaft..."
              />
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <Label className="text-sm font-semibold text-slate-700">Zugehörige Flurstücke</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {application.selected_parcels?.map((parcel, idx) => {
                const gemarkung = parcel?.extracted?.gemarkung || parcel?.properties?.gemarkung || "Unbekannt";
                const flurstueck = parcel?.extracted?.nummer || parcel?.properties?.flstkennz || "Unbekannt";
                const area = parcel?.displayAreaHa || "";

                return (
                  <div key={idx} className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                    <span className="font-semibold block">Gemarkung: {gemarkung}</span>
                    <span>Flurstück: {flurstueck} {area && `(${area} ha)`}</span>
                  </div>
                );
              })}
              {(!application.selected_parcels || application.selected_parcels.length === 0) && (
                <p className="text-slate-500 text-sm">Keine Flurstücke hinterlegt.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="space-y-3">
        {formData.spritzungen.map((s, index) => (
          <ReportSpritzungItem
            key={s.id}
            data={s}
            index={index}
            onUpdate={(val) => updateSpritzung(index, val)}
          />
        ))}
      </Accordion>

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button
          className="bg-blue-700 hover:bg-blue-800"
          onClick={() => onSubmit(formData)}
        >
          Jahresmeldung einreichen
        </Button>
      </div>
    </div>
  );
}
