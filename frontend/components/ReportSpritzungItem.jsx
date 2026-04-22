import React from "react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AddCombinationDialog from "./AddCombinationDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportSpritzungItem({ data, index, onUpdate, titlePrefix = "Spritzung" }) {
  const addEntry = (entry) => {
    onUpdate({ ...data, combinations: [...data.combinations, entry] });
  };

  const removeEntry = (indexToRemove) => {
    const updatedCombinations = data.combinations.filter(
      (_, i) => i !== indexToRemove,
    );
    onUpdate({ ...data, combinations: updatedCombinations });
  };

  return (
    <AccordionItem
      value={`spritzung-${index}`}
      className="border rounded-lg bg-white overflow-hidden"
    >
      <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-700 underline decoration-blue-500 decoration-2">
            {titlePrefix} {data.id}
          </span>
          {data.combinations.length > 0 && (
            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">
              {data.combinations.length} Einträge
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-4 bg-slate-50/30 border-t space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs uppercase text-slate-500">
              Datum
            </Label>
            <Input
              type="date"
              value={data.datum}
              onChange={(e) => onUpdate({ ...data, datum: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs uppercase text-slate-500">
              Behandelte, bestockte Fläche in ha
            </Label>
            <Input
              type="number"
              step="0.01"
              value={data.behandelteFlaeche}
              onChange={(e) => onUpdate({ ...data, behandelteFlaeche: e.target.value })}
              placeholder="z.B. 1.25"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            Pflanzenschutzmittel & Aufwandmenge (max. 8)
          </h4>
          <ScrollArea className="h-64 w-full rounded-md pr-3">
            <div className="grid gap-2">
              {data.combinations.map((c, i) => (
                <div
                  key={i}
                  className="group flex items-center justify-between p-3 bg-white border rounded shadow-sm hover:border-red-100 transition-colors"
                >
                  <div>
                    <p className="font-bold text-sm">{c.productName}</p>
                    <p className="text-xs text-slate-500 italic">
                      {c.diseaseName}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-mono font-bold text-blue-700">
                      {c.amount} {c.unit}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => removeEntry(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          {data.combinations.length < 8 && (
            <AddCombinationDialog onAdd={addEntry} />
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
