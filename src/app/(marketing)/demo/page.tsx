import { redirect } from "next/navigation";

/** Demo reports removed — send users to signup for a real audit. */
export default function DemoRedirectPage() {
  redirect("/signup");
}
