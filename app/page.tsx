"use client";

import { ChatPanel } from "@/components/chart-panel";

export default function Home() {
  return (
    <main className="h-screen bg-background">
      <div className="container mx-auto h-full">
        <ChatPanel
          onQuery={() => {}}
          isProcessing={false}
          streamingMessage={undefined}
        />
      </div>
    </main>
  );
}
