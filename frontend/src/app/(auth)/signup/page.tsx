import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <AuthForm mode="signup" />
    </section>
  );
}

