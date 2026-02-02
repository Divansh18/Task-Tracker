"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/components/providers/AuthProvider";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema.extend({
  displayName: z
    .string()
    .trim()
    .max(50, "Display name must be 50 characters or fewer")
    .optional(),
});

type AuthFormValues = z.infer<typeof signupSchema>;

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const { login, register: registerUser, isSubmitting } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(mode === "login" ? loginSchema : signupSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setApiError(null);
    try {
      if (mode === "login") {
        await login({
          email: values.email,
          password: values.password,
        });
      } else {
        await registerUser({
          email: values.email,
          password: values.password,
          displayName: values.displayName,
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {isLogin ? "Sign in to manage your tasks" : "Sign up to start tracking your tasks"}
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        {!isLogin && (
          <div>
            <label
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              htmlFor="displayName"
            >
              Display name (optional)
            </label>
            <input
              id="displayName"
              type="text"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
              {...register("displayName")}
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.displayName.message}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
          )}
        </div>

        {apiError && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {apiError}
          </p>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-200 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {isLogin ? (
          <>
            Need an account?{" "}
            <Link className="font-medium text-blue-600 hover:underline dark:text-blue-400" href="/signup">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already registered?{" "}
            <Link className="font-medium text-blue-600 hover:underline dark:text-blue-400" href="/login">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

