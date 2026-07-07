"use client";

import { AppShell } from "@/components/app-shell";
import { AskChat } from "@/components/ask-chat";

export default function AskPage() {
  return (
    <AppShell title="Ask" subtitle="Answers from your own numbers">
      <AskChat />
    </AppShell>
  );
}
