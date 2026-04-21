"use client";
import React from "react";

export default function Dashboard({ onAction }) {
  const actions = [
    {
      id: "new",
      title: "new antrag",
      color: "bg-white text-slate-800 border-slate-900",
    },
    {
      id: "report_48",
      title: "48 hour report",
      color: "bg-white text-slate-800 border-slate-900",
    },
    {
      id: "report_yearly",
      title: "yearly report",
      color: "bg-white text-slate-800 border-slate-900",
    },
    {
      id: "history",
      title: "see all previos reports",
      color: "bg-white text-slate-800 border-slate-900",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12 px-8 bg-slate-50/50 rounded-[3rem] border-2 border-slate-800 max-w-lg mx-auto shadow-xl">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className={`w-full py-4 px-8 rounded-2xl border-2 font-medium text-xl shadow-sm hover:scale-105 active:scale-95 transition-all ${action.color}`}
        >
          {action.title}
        </button>
      ))}
    </div>
  );
}
