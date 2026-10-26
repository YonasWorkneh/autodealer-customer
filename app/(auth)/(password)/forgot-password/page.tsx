"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { requestPasswordReset } from "@/lib/auth/signin";

type ForgotPasswordFormValues = {
  email: string;
};

export default function ForgotPasswordForm() {
  const { toast } = useToast();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<ForgotPasswordFormValues>();

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setSuccessMessage(null);
    clearErrors("email");

    try {
      await requestPasswordReset(data.email);

      const successText =
        "If an account exists for this email, a reset link has been sent.";
      setSuccessMessage(successText);

      toast({
        title: "Reset Link Sent",
        description: successText,
        variant: "success",
      });
    } catch (err: any) {
      const message = err?.message || "Something went wrong. Try again.";
      setSuccessMessage(null);
      setError("email", { message });
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-sm border border-gray-200">
      <CardContent className="p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 border-b pb-4 w-full"
          >
            <Image
              src="/logo/logo.svg"
              alt="HuluCars"
              width={180}
              height={48}
              className="h-16 w-auto object-contain mx-auto"
              priority
            />
          </Link>

          {/* Heading */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              Forgot Password?
            </h1>
            <p className="text-sm text-gray-500">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {/* Success Banner (green) */}
          {successMessage && (
            <div className="w-full rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-emerald-900">Email Sent</p>
                <p className="text-emerald-700 mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  className="pl-10 h-12 border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                  onChange={() => {
                    if (successMessage) setSuccessMessage(null);
                    clearErrors("email");
                  }}
                />
              </div>
              {errors?.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors?.email?.message as string}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-hover font-medium cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Link...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          {/* Back to sign in link */}
          <Link
            href="/signin"
            className="inline-flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
