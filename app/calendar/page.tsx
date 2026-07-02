import { redirect } from "next/navigation";

export default function CalendarRedirect() {
  redirect("/plan?tab=bills");
}
