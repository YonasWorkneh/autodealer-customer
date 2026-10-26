"use client";

import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function ResetPasswordFallback() {
  return (
    <Card className="w-full max-w-[450px] shadow-sm border border-gray-200">
      <CardContent className="p-12 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-gray-500 font-medium">
          Loading reset password form...
        </p>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordWithTokenPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

