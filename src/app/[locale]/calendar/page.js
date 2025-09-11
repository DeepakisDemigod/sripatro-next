"use client";

import React from "react";
import CalendarMulti from "@/components/CalendarMulti";

export default function CalendarPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <CalendarMulti defaultYear="2082" defaultMonth={1} showControls={true} />
      </div>
    </div>
  );
}
