import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import GeneralInfo from "./GeneralInfo";
import SpritzungItem from "./SpritzungItem";

export default function ApplicationForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    general: { spritzgemeinschaft: "", ansprechpartner: "", tel: "" },
    spritzungen: Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      es: "16-61", // Default from PDF [cite: 60]
      date: "",
      verantwortlicher: "",
      anmerkungen: "",
      combinations: [],
    })),
  });

  const updateGeneral = (newData) =>
    setFormData((prev) => ({ ...prev, general: newData }));

  const updateSpritzung = (index, updatedData) => {
    const newSpritzungen = [...formData.spritzungen];
    newSpritzungen[index] = updatedData;
    setFormData((prev) => ({ ...prev, spritzungen: newSpritzungen }));
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Antragsdaten</CardTitle>
        </CardHeader>
        <CardContent>
          <GeneralInfo data={formData.general} onChange={updateGeneral} />
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="space-y-3">
        {formData.spritzungen.map((s, index) => (
          <SpritzungItem
            key={s.id}
            data={s}
            index={index}
            onUpdate={(val) => updateSpritzung(index, val)}
          />
        ))}
      </Accordion>

      <div className="flex gap-4 justify-end pt-4">
        <Button
          variant="outline"
          onClick={() => console.log("Draft", formData)}
        >
          Entwurf speichern
        </Button>
        <Button
          className="bg-blue-700 hover:bg-blue-800"
          onClick={() => onSubmit(formData)} // Trigger final submission
        >
          Antrag abschließen
        </Button>
      </div>
    </div>
  );
}
