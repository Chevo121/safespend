"use client";

import { AppShell } from "@/components/app-shell";
import { CoachChat } from "@/components/coach-chat";
import { useStore } from "@/lib/store";

export default function CoachPage() {
  const { pendingCount } = useStore();

  return (
    <AppShell
      title="Coach"
      subtitle={
        pendingCount > 0
          ? `${pendingCount} transaction${pendingCount === 1 ? "" : "s"} to clarify · ask me anything`
          : "Ask anything about your money"
      }
    >
      <CoachChat />
    </AppShell>
  );
}
