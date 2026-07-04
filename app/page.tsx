import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistrationForm } from "@/components/registration-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4 py-12">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-in">
        <Card className="border-border/80 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">User Registration</CardTitle>
            <CardDescription>Fill in your details below to register</CardDescription>
          </CardHeader>
          <CardContent>
            <RegistrationForm />
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Administrator?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in to the dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}
