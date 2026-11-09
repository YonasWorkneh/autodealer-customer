"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Flag,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Ban,
  PhoneOff,
  HelpCircle,
  Loader2,
  AlertCircle,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { useReportCar } from "@/hooks/cars";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/user";

export interface ReportReasonOption {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const COMMON_REPORT_REASONS: ReportReasonOption[] = [
  {
    value: "suspected_fraud",
    label: "Suspected fraud or scam",
    description: "Suspiciously low price, fake documents, wire-transfer request, or fraudulent identity.",
    icon: ShieldAlert,
  },
  {
    value: "incorrect_information",
    label: "Incorrect vehicle details",
    description: "Wrong year, make, model, fake mileage, wrong transmission, or false specifications.",
    icon: AlertTriangle,
  },
  {
    value: "already_sold",
    label: "Vehicle already sold / unavailable",
    description: "This vehicle is no longer on the market or has already been purchased.",
    icon: CheckCircle2,
  },
  {
    value: "duplicate_listing",
    label: "Duplicate listing",
    description: "This identical vehicle has been posted multiple times on the platform.",
    icon: Copy,
  },
  {
    value: "inappropriate_content",
    label: "Inappropriate photos or language",
    description: "Contains offensive text, abusive comments, watermarks, or misleading media.",
    icon: Ban,
  },
  {
    value: "unresponsive_seller",
    label: "Unresponsive / fake seller contact",
    description: "Invalid phone number, disconnected contact, or seller refuses legitimate communication.",
    icon: PhoneOff,
  },
  {
    value: "other",
    label: "Other reason",
    description: "Any other issue not covered above. Specify details below.",
    icon: HelpCircle,
  },
];

interface ReportCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: number | string;
  carTitle?: string;
}

export default function ReportCarModal({
  isOpen,
  onClose,
  carId,
  carTitle,
}: ReportCarModalProps) {
  const { user } = useUserStore();
  const isLoggedIn = !!user.email;
  const [selectedReason, setSelectedReason] = useState<string>("suspected_fraud");
  const [otherReason, setOtherReason] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { toast } = useToast();

  const resetState = () => {
    setSelectedReason("suspected_fraud");
    setOtherReason("");
    setDescription("");
    setValidationError(null);
    setApiError(null);
    setIsSubmitted(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const { mutate: submitReport, isPending } = useReportCar(
    () => {
      setIsSubmitted(true);
      toast({
        title: "Report Submitted",
        description: "Thank you for reporting this listing. Our team will review it.",
        variant: "success",
      });
    },
    (error: Error) => {
      setApiError(error.message || "Failed to submit report. Please try again.");
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValidationError(null);
    setApiError(null);

    if (!isLoggedIn) {
      setValidationError("You must be signed in to submit a report.");
      return;
    }

    const numericCarId = Number(carId);
    if (!numericCarId || isNaN(numericCarId)) {
      setValidationError("Invalid car listing identifier.");
      return;
    }

    if (!selectedReason) {
      setValidationError("Please select a reason for reporting.");
      return;
    }

    if (selectedReason === "other" && !otherReason.trim() && !description.trim()) {
      setValidationError("Please specify the reason or provide a description for your report.");
      return;
    }

    // Prepare description text
    let finalDescription = description.trim();
    if (selectedReason === "other") {
      if (otherReason.trim()) {
        finalDescription = description.trim()
          ? `${otherReason.trim()}: ${description.trim()}`
          : otherReason.trim();
      } else {
        finalDescription = description.trim() || "Other reason specified by user";
      }
    } else if (!finalDescription) {
      const match = COMMON_REPORT_REASONS.find((r) => r.value === selectedReason);
      finalDescription = match ? match.label : "Listing reported by user";
    }

    submitReport({
      car: numericCarId,
      reason: selectedReason,
      description: finalDescription,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-lg p-0 gap-0 rounded-2xl overflow-hidden bg-background border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!isLoggedIn ? (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <LogIn className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold text-foreground">
                Login Required
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground max-w-sm">
                You must be signed in to report a vehicle listing. Please sign in or create an account to help maintain marketplace safety.
              </DialogDescription>
            </div>
            {carTitle && (
              <div className="w-full bg-muted/40 border border-border rounded-lg py-2 px-3 text-xs text-muted-foreground">
                Vehicle: <span className="font-medium text-foreground">{carTitle}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:flex-1 cursor-pointer"
              >
                Cancel
              </Button>
              <Link href="/signin" className="w-full sm:flex-1">
                <Button
                  type="button"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary-hover flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : isSubmitted ? (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold text-foreground">
                Report Received
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground max-w-md">
                Thank you for helping keep the marketplace safe. Our moderation team has been notified and will inspect this vehicle listing shortly.
              </DialogDescription>
            </div>
            {carTitle && (
              <div className="w-full bg-muted/40 border border-border rounded-lg py-2 px-3 text-xs text-muted-foreground">
                Vehicle: <span className="font-medium text-foreground">{carTitle}</span>
              </div>
            )}
            <Button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
            {/* Header */}
            <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-border/80 text-left">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Flag className="w-5 h-5 fill-red-500/20" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <DialogTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                    Report Vehicle Listing
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                    Help us review listings that violate marketplace safety or accuracy guidelines.
                  </DialogDescription>
                </div>
              </div>
              {carTitle && (
                <div className="mt-3 bg-muted/50 border border-border/70 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
                  <span className="text-muted-foreground shrink-0 font-medium">Vehicle:</span>
                  <span className="font-medium text-foreground truncate">{carTitle}</span>
                </div>
              )}
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {validationError && (
                <Alert variant="destructive" className="py-2 px-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">
                    {validationError}
                  </AlertDescription>
                </Alert>
              )}

              {apiError && (
                <Alert variant="destructive" className="py-2 px-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">
                    {apiError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Reasons List */}
              <div className="space-y-2.5">
                <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  Reason for reporting
                </Label>
                <div className="space-y-2">
                  {COMMON_REPORT_REASONS.map((reason) => {
                    const isSelected = selectedReason === reason.value;
                    const Icon = reason.icon;
                    return (
                      <div
                        key={reason.value}
                        onClick={() => {
                          setSelectedReason(reason.value);
                          setValidationError(null);
                        }}
                        className={`group relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-red-500 bg-red-50/40 dark:bg-red-950/20 shadow-xs ring-1 ring-red-500/40"
                            : "border-border/70 bg-card hover:border-border hover:bg-muted/30"
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "border-red-600 bg-red-600"
                                : "border-muted-foreground/40 group-hover:border-muted-foreground"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center gap-1.5">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isSelected
                                  ? "text-red-600"
                                  : "text-muted-foreground group-hover:text-foreground"
                              }`}
                            />
                            <p
                              className={`text-sm font-medium ${
                                isSelected
                                  ? "text-red-950 dark:text-red-200 font-semibold"
                                  : "text-foreground"
                              }`}
                            >
                              {reason.label}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {reason.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Specify "Other" reason if selected */}
              {selectedReason === "other" && (
                <div className="space-y-1.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor="other-reason" className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Please specify the reason <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="other-reason"
                    placeholder="e.g., Odometer rollback, damaged chassis, salvage title..."
                    value={otherReason}
                    onChange={(e) => {
                      setOtherReason(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    className="h-10 text-sm focus-visible:ring-red-500 border-border"
                    autoFocus
                  />
                </div>
              )}

              {/* Description / Additional details */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="report-description"
                    className="text-xs font-semibold text-foreground flex items-center gap-1"
                  >
                    Additional details{" "}
                    {selectedReason !== "other" && (
                      <span className="text-muted-foreground text-[11px] font-normal">
                        (optional)
                      </span>
                    )}
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    {description.length}/500
                  </span>
                </div>
                <Textarea
                  id="report-description"
                  rows={3}
                  maxLength={500}
                  placeholder="Provide any additional context, evidence, or communication details to assist our review..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="resize-none text-sm focus-visible:ring-red-500 border-border min-h-[80px]"
                />
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="p-4 sm:p-5 border-t border-border/80 bg-muted/20 flex flex-row items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 text-white gap-2 font-medium cursor-pointer shadow-sm disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="w-4 h-4 fill-white/20" />
                    Submit Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
