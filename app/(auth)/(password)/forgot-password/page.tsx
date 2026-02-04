"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { requestPasswordReset } from "@/lib/auth/signin";

type ForgotPasswordFormValues = {
  email: string;
};

export default function ForgotPasswordForm() {
  const { toast } = useToast();
  const { handleSubmit, register, formState, setError } =
    useForm<ForgotPasswordFormValues>();
  const { errors, isSubmitting } = formState;

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await requestPasswordReset(data.email);

      toast({
        title: "Success",
        description:
          "If an account exists for this email, a reset link has been sent.",
        variant: "success",
      });
      setError("email", {
        type: "manual",
        message: "If an account exists for this email, a reset link has been sent.",
      });
    } catch (err: any) {
      const message = err?.message || "Something went wrong. Try again.";
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
          {/* Lightning bolt icon */}
          {/* <div className="rounded-full flex items-center justify-center gap-3 border px-2">
            <Image
              src={"/wheel.png"}
              alt="wheel"
              width={100}
              height={100}
              className="w-12 h-12"
            />
            <span className="text-2xl font-bold">Auto&mdash;Dealer</span>
          </div> */}

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            Forgot Password?
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
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
                  {...register("email", { required: "Email is required" })}
                  className="pl-10 h-12 border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                />
                {errors?.email && (
                  <p className="text-red-400 text-sm">
                    {errors?.email?.message as string}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary-hover font-medium cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          {/* Back to login link */}
          <Link
            href="/signin"
            className="text-zinc-600 hover:text-zinc-700 text-sm font-medium"
          >
            Back to Signin
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
