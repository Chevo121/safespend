import { redirect } from "next/navigation";

export default function DebtsRedirect() {
  redirect("/plan#debts");
}
