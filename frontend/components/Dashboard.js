"use client";
import React from "react";

export default function Dashboard({ onAction }) {
  const actions = [
    {
      id: "new",
      title: "Neuer Anwendungsplan",
      color: "bg-blue-600 text-white border-blue-700",
    },
    {
      id: "report_48",
      title: "48-Stunden Meldung",
      color: "bg-white text-slate-800 border-slate-900",
    },
    {
      id: "report_yearly",
      title: "Jahresbericht",
      color: "bg-white text-slate-800 border-slate-900",
    },
    {
      id: "history",
      title: "Bisherige Anträge und Berichte",
      color: "bg-white text-slate-800 border-slate-900",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12 px-8 bg-white rounded-[3rem] border-2 border-slate-200 max-w-lg mx-auto shadow-xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Hauptmenü</h2>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className={`w-full py-4 px-8 rounded-2xl border-2 font-semibold text-lg shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all ${action.color}`}
        >
          {action.title}
        </button>
      ))}
    </div>
  );
}
