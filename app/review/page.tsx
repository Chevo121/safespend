import { AppShell } from "@/components/app-shell";
import { ReviewWorkbench } from "@/components/review-workbench";
import { Section } from "@/components/ui";

export default function ReviewPage() {
  return (
    <AppShell title="Review" activePath="/review">
      <Section title="Clarify transactions">
        <ReviewWorkbench />
      </Section>
    </AppShell>
  );
}
