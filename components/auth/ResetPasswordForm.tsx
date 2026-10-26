"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { confirmPasswordReset } from "@/lib/auth/password";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ResetPasswordFormProps {
  initialUid?: string;
  initialToken?: string;
}

interface FormValues {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}

export default function ResetPasswordForm({
  initialUid,
  initialToken,
}: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const routeParams = useParams();
  const { toast } = useToast();

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showManualFields, setShowManualFields] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Extract UID and Token from props, route params, or query params
  const detectedUid =
    initialUid ||
    (routeParams?.uid as string | undefined) ||
    searchParams.get("uid") ||
    searchParams.get("uidb64") ||
    "";

  const detectedToken =
    initialToken ||
    (routeParams?.token as string | undefined) ||
    searchParams.get("token") ||
    "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      uid: detectedUid,
      token: detectedToken,
      new_password1: "",
      new_password2: "",
    },
  });

  useEffect(() => {
    if (detectedUid) setValue("uid", detectedUid);
    if (detectedToken) setValue("token", detectedToken);
  }, [detectedUid, detectedToken, setValue]);

  const passwordVal = watch("new_password1", "");
  const confirmPasswordVal = watch("new_password2", "");
  const currentUid = watch("uid", detectedUid);
  const currentToken = watch("token", detectedToken);

  const hasCredentials = Boolean(currentUid && currentToken);

  const onSubmit = async (data: FormValues) => {
    setErrorMessage(null);

    const uidToUse = data.uid?.trim() || detectedUid?.trim();
    const tokenToUse = data.token?.trim() || detectedToken?.trim();

    // Ensure frontend validation: new_password1 and new_password2 must match
    if (data.new_password1 !== data.new_password2) {
      setError("new_password2", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    if (!uidToUse || !tokenToUse) {
      setErrorMessage(
        "User ID (UID) or Reset Token is missing. Please use the link sent to your email or enter them below."
      );
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "UID and Reset token are required to reset password.",
      });
      return;
    }

    try {
      // Sent exactly as: { new_password1, new_password2, uid, token }
      await confirmPasswordReset({
        new_password1: data.new_password1,
        new_password2: data.new_password2,
        uid: uidToUse,
        token: tokenToUse,
      });

      setIsSuccess(true);
      toast({
        variant: "success",
        title: "Password Reset Successful",
        description: "Your password has been updated. You can now log in.",
      });
    } catch (err: any) {
      const msg =
        err?.message ||
        "Failed to reset password. The reset link may have expired or is invalid.";
      setErrorMessage(msg);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: msg,
      });
    }
  };

  // Success view
  if (isSuccess) {
    return (
      <Card className="w-full max-w-[450px] shadow-sm border border-gray-200">
        <CardHeader className="text-center pb-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 mb-3 border-b pb-4"
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Password Reset Complete
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 mt-1">
            Your password has been changed successfully. You can now sign in to
            your account with your new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <Button
            asChild
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary-hover font-medium"
          >
            <Link href="/signin">Sign In with New Password</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[450px] shadow-sm border border-gray-200">
      <CardHeader>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-3 border-b pb-4"
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
        <CardTitle className="text-xl font-semibold text-center text-gray-900">
          Reset Password
        </CardTitle>
        <CardDescription className="text-sm text-center text-gray-600">
          Enter your new password below.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Warning if UID or Token missing from link */}
        {!hasCredentials && (
          <Alert className="mb-5 border-amber-300 bg-amber-50 text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="font-semibold text-amber-900">
              Reset Link Incomplete
            </AlertTitle>
            <AlertDescription className="text-xs text-amber-800 space-y-2">
              <p>
                Reset credentials (UID / Token) were not found in the link.
                Please ensure you copied the entire link from your email.
              </p>
              <div className="pt-1 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-7 text-xs bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
                >
                  <Link href="/forgot-password">Request New Link</Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManualFields((prev) => !prev)}
                  className="h-7 text-xs text-amber-900 hover:bg-amber-100"
                >
                  {showManualFields ? "Hide manual entry" : "Enter UID & Token manually"}
                  {showManualFields ? (
                    <ChevronUp className="ml-1 h-3 w-3" />
                  ) : (
                    <ChevronDown className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Backend Error Alert */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-semibold">Reset Failed</AlertTitle>
            <AlertDescription className="text-xs space-y-2">
              <p>{errorMessage}</p>
              <Link
                href="/forgot-password"
                className="inline-block font-medium underline text-destructive"
              >
                Request a fresh reset link &rarr;
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Optional manual UID & Token inputs if missing or toggled */}
          {(showManualFields || !hasCredentials) && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3 mb-2">
              <div className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-gray-500" />
                <span>Verification Details</span>
              </div>
              <div className="space-y-1">
                <Label htmlFor="uid" className="text-xs text-gray-600">
                  User ID (UID)
                </Label>
                <Input
                  id="uid"
                  placeholder="e.g. MTI"
                  {...register("uid", { required: "User ID is required" })}
                  className="h-9 text-xs"
                />
                {errors.uid && (
                  <p className="text-red-500 text-xs">{errors.uid.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="token" className="text-xs text-gray-600">
                  Reset Token
                </Label>
                <Input
                  id="token"
                  placeholder="e.g. bqov2d-..."
                  {...register("token", { required: "Reset token is required" })}
                  className="h-9 text-xs"
                />
                {errors.token && (
                  <p className="text-red-500 text-xs">{errors.token.message}</p>
                )}
              </div>
            </div>
          )}

          {/* New Password (new_password1) */}
          <div className="space-y-2">
            <Label
              htmlFor="new_password1"
              className="text-sm font-medium text-gray-700"
            >
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new_password1"
                type={showPassword1 ? "text" : "password"}
                placeholder="Enter new password (min. 8 characters)"
                {...register("new_password1", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                })}
                className="h-11 pr-10 border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                onChange={() => setErrorMessage(null)}
              />
              <button
                type="button"
                onClick={() => setShowPassword1(!showPassword1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword1 ? "Hide password" : "Show password"}
              >
                {showPassword1 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.new_password1 && (
              <p className="text-red-500 text-xs">
                {errors.new_password1.message}
              </p>
            )}
          </div>

          {/* Confirm New Password (new_password2) */}
          <div className="space-y-2">
            <Label
              htmlFor="new_password2"
              className="text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="new_password2"
                type={showPassword2 ? "text" : "password"}
                placeholder="Confirm your new password"
                {...register("new_password2", {
                  required: "Please confirm your password",
                  validate: (val) =>
                    val === passwordVal || "Passwords do not match",
                })}
                className="h-11 pr-10 border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                onChange={() => setErrorMessage(null)}
              />
              <button
                type="button"
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword2 ? "Hide password" : "Show password"}
              >
                {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.new_password2 && (
              <p className="text-red-500 text-xs">
                {errors.new_password2.message}
              </p>
            )}
          </div>

          {/* Password Match Indicator */}
          {passwordVal && confirmPasswordVal && (
            <div className="text-xs">
              {passwordVal === confirmPasswordVal ? (
                <span className="text-emerald-600 flex items-center gap-1 font-medium">
                  ✓ Passwords match
                </span>
              ) : (
                <span className="text-red-500 flex items-center gap-1 font-medium">
                  ✕ Passwords do not match
                </span>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || (!hasCredentials && !showManualFields)}
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary-hover font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Resetting Password...
              </span>
            ) : (
              "Set New Password"
            )}
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 border-t pt-4 text-xs text-gray-500">
          <Link
            href="/signin"
            className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
          <Link
            href="/forgot-password"
            className="text-zinc-500 hover:text-zinc-700 underline"
          >
            Need another reset link?
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
