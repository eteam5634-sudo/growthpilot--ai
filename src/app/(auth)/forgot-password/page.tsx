import Link from "next/link";
import { headers } from "next/headers";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage() {
  const headerStore = await headers();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${headerStore.get("x-forwarded-proto") ?? "http"}://${headerStore.get("host")}`;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>We’ll email you a link to choose a new password.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ForgotPasswordForm origin={origin} />
        <p className="text-center text-sm text-muted-foreground">
          Back to{" "}
          <Link href="/login" className="text-primary hover:underline">
            log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
