import Link from "next/link";
import { headers } from "next/headers";
import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Sign up" };

export default async function SignupPage() {
  const headerStore = await headers();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${headerStore.get("x-forwarded-proto") ?? "http"}://${headerStore.get("host")}`;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start with a free AI audit of any website.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignupForm origin={origin} />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
