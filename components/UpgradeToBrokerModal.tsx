"use client";

import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Car,
  User,
  Sparkles,
  Phone,
  CreditCard,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfile, useUpgradeProfile } from "@/hooks/profile";
import { useUserStore } from "@/store/user";
import { useToast } from "@/hooks/use-toast";

interface UpgradeToBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UpgradeToBrokerModal({
  isOpen,
  onClose,
  onSuccess,
}: UpgradeToBrokerModalProps) {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { user } = useUserStore();
  const { toast } = useToast();
  const upgradeMutation = useUpgradeProfile();

  const [step, setStep] = useState<"notice" | "form" | "success">("notice");
  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ nationalId?: string; phone?: string }>({});
  const [touched, setTouched] = useState<{ nationalId?: boolean; phone?: boolean }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("notice");
      setErrors({});
      setTouched({});
      setApiError(null);
      setNationalId("");

      // Prefill phone from existing profile contact if available
      if (profile?.contact) {
        const raw = profile.contact.replace(/\D/g, "");
        let candidate = "";
        if (raw.startsWith("251") && raw.length === 12) {
          candidate = raw.slice(3);
        } else if (raw.length === 10 && raw.startsWith("0")) {
          candidate = raw.slice(1);
        } else if (raw.length === 9) {
          candidate = raw;
        }

        if (
          candidate.length === 9 &&
          (candidate.startsWith("9") || candidate.startsWith("7"))
        ) {
          setPhone(candidate);
        } else {
          setPhone("");
        }
      } else {
        setPhone("");
      }
    }
  }, [isOpen, profile?.contact]);

  // Validation functions
  const validateNationalId = (val: string): string | undefined => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      return "National ID is required.";
    }
    if (clean.length !== 12) {
      return `National ID must be exactly 12 digits (${clean.length}/12 entered).`;
    }
    return undefined;
  };

  const validatePhone = (val: string): string | undefined => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      return "Phone number is required.";
    }
    if (!clean.startsWith("9") && !clean.startsWith("7")) {
      return "Phone number must start with 9 or 7 (e.g. 9XXXXXXXX or 7XXXXXXXX).";
    }
    if (clean.length !== 9) {
      return `Phone number must be exactly 9 digits (${clean.length}/9 entered).`;
    }
    return undefined;
  };

  const handleNationalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 12);
    setNationalId(val);
    setApiError(null);
    if (touched.nationalId) {
      setErrors((prev) => ({ ...prev, nationalId: validateNationalId(val) }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Smart cleanup if pasted with prefix +251, 251, or leading 0
    if (val.startsWith("+251")) val = val.slice(4);
    else if (val.startsWith("251")) val = val.slice(3);
    else if (val.startsWith("0")) val = val.slice(1);

    val = val.replace(/\D/g, "").slice(0, 9);
    setPhone(val);
    setApiError(null);
    if (touched.phone) {
      setErrors((prev) => ({ ...prev, phone: validatePhone(val) }));
    }
  };

  const handleClose = () => {
    setErrors({});
    setTouched({});
    setApiError(null);
    setStep("notice");
    onClose();
  };

  const handleSuccessClose = () => {
    handleClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTouched({ nationalId: true, phone: true });

    const idError = validateNationalId(nationalId);
    const phoneError = validatePhone(phone);

    setErrors({
      nationalId: idError,
      phone: phoneError,
    });

    if (idError || phoneError) return;

    setApiError(null);

    const formattedPhone = `+251${phone.trim()}`;

    try {
      await upgradeMutation.mutateAsync({
        to: "broker",
        data: {
          national_id: nationalId.trim(),
          telebirr_account: formattedPhone,
          phone_number: formattedPhone,
          contact: formattedPhone,
        },
      });

      setStep("success");
    } catch (err: any) {
      const message =
        err?.message ||
        "Failed to upgrade your account to broker. Please check your details and try again.";
      setApiError(message);
    }
  };

  const userName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user.email || "Valued User";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-border/80 shadow-2xl">
        {step === "notice" ? (
          <div>
            {/* Header section with buyer badge */}
            <div className="p-6 pb-4">
              <DialogHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/50 gap-1.5"
                  >
                    <User className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Buyer Account
                  </Badge>
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    Selling Access
                  </span>
                </div>

                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Upgrade to Broker to Sell Cars
                </DialogTitle>

                <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                  You are currently logged in as a{" "}
                  <strong className="text-foreground font-semibold">Buyer</strong>.
                  Selling and posting car listings on HuluCars is exclusive to
                  registered brokers and dealerships.
                </DialogDescription>
              </DialogHeader>

              {/* Current User Card */}
              <div className="mt-4 p-3.5 bg-muted/40 rounded-xl border border-border/60 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                  {profile?.first_name
                    ? profile.first_name[0]?.toUpperCase()
                    : user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email || profile?.contact || "Current Role: Buyer"}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[11px] shrink-0 font-medium">
                  Buyer
                </Badge>
              </div>

              {/* Perks / Benefits */}
              <div className="mt-4 p-4 rounded-xl bg-background border border-border/80 space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  What you unlock with a Broker Account:
                </p>
                <div className="space-y-2 text-xs text-muted-foreground pt-1">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-foreground">
                      Post and manage your car listings for thousands of buyers
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-foreground">
                      Receive direct inquiries and phone calls from interested car buyers
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-foreground">
                      Free instant upgrade with your 12-digit Ethiopian National ID
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="p-4 bg-muted/30 border-t border-border flex flex-row items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 sm:flex-none cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setStep("form")}
                className="flex-1 sm:flex-none bg-primary hover:bg-primary-hover text-primary-foreground font-semibold cursor-pointer"
              >
                Upgrade to Broker
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </DialogFooter>
          </div>
        ) : step === "form" ? (
          <div>
            {/* Form Step */}
            <div className="p-6 pb-4">
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("notice");
                      setApiError(null);
                    }}
                    className="p-1 -ml-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                    title="Back to notice"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                    Upgrade to Broker
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm text-muted-foreground pl-6">
                  Enter your 12-digit Ethiopian National ID and phone number to
                  activate your broker privileges.
                </DialogDescription>
              </DialogHeader>

              {/* API Error Banner */}
              {apiError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{apiError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* National ID Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="broker-national-id"
                      className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      National ID (Fayda)
                      <span className="text-red-500">*</span>
                    </Label>
                    <span
                      className={`text-[11px] font-mono transition-colors ${
                        nationalId.length === 12
                          ? "text-emerald-600 font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {nationalId.length}/12 digits
                    </span>
                  </div>
                  <Input
                    id="broker-national-id"
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="Enter 12 digits (e.g. 123456789012)"
                    value={nationalId}
                    onChange={handleNationalIdChange}
                    onBlur={() => {
                      setTouched((t) => ({ ...t, nationalId: true }));
                      setErrors((prev) => ({
                        ...prev,
                        nationalId: validateNationalId(nationalId),
                      }));
                    }}
                    className={`font-mono text-sm tracking-wider ${
                      errors.nationalId
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {errors.nationalId ? (
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {errors.nationalId}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Must be exactly 12 digits from your Ethiopian National ID.
                    </p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="broker-phone"
                      className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                    >
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Phone Number
                      <span className="text-red-500">*</span>
                    </Label>
                    <span
                      className={`text-[11px] font-mono transition-colors ${
                        phone.length === 9 &&
                        (phone.startsWith("9") || phone.startsWith("7"))
                          ? "text-emerald-600 font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {phone.length}/9 digits
                    </span>
                  </div>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm font-semibold text-foreground select-none">
                      <span className="mr-1.5">🇪🇹</span>
                      <span>+251</span>
                    </span>
                    <Input
                      id="broker-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={9}
                      placeholder="912345678"
                      value={phone}
                      onChange={handlePhoneChange}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, phone: true }));
                        setErrors((prev) => ({
                          ...prev,
                          phone: validatePhone(phone),
                        }));
                      }}
                      className={`rounded-l-none font-mono text-sm tracking-wide ${
                        errors.phone
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  {errors.phone ? (
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {errors.phone}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Enter 9 digits after +251. First digit must be 9 or 7.
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Form Footer */}
            <DialogFooter className="p-4 bg-muted/30 border-t border-border flex flex-row items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("notice");
                  setApiError(null);
                }}
                disabled={upgradeMutation.isPending}
                className="flex-1 sm:flex-none cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit()}
                disabled={
                  upgradeMutation.isPending ||
                  nationalId.length !== 12 ||
                  phone.length !== 9 ||
                  (!phone.startsWith("9") && !phone.startsWith("7"))
                }
                className="flex-1 sm:flex-none bg-primary hover:bg-primary-hover text-primary-foreground font-semibold cursor-pointer"
              >
                {upgradeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upgrading...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-1.5" />
                    Confirm & Upgrade
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="p-6">
            <DialogHeader className="space-y-3 items-center text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <div className="flex items-center justify-center">
                <Badge
                  variant="outline"
                  className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/50 gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  Pending Approval
                </Badge>
              </div>

              <DialogTitle className="text-xl font-bold tracking-tight text-foreground text-center">
                Request Submitted Successfully
              </DialogTitle>

              <DialogDescription className="text-sm text-muted-foreground text-center max-w-sm mx-auto leading-relaxed">
                Your broker upgrade application has been submitted. Please wait
                while our team reviews and approves your account.
              </DialogDescription>
            </DialogHeader>

            {/* Application Summary Card */}
            <div className="mt-5 p-4 rounded-xl bg-muted/40 border border-border/80 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border/60">
                <span className="text-muted-foreground">National ID</span>
                <span className="font-mono font-medium text-foreground">
                  {nationalId}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border/60">
                <span className="text-muted-foreground">Phone Number</span>
                <span className="font-mono font-medium text-foreground">
                  +251 {phone}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Application Status</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Under Review
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-muted-foreground text-center">
              You will be able to post and manage car listings as soon as your broker account is approved.
            </div>

            <div className="mt-6">
              <Button
                type="button"
                onClick={handleSuccessClose}
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold cursor-pointer"
              >
                Got it, thanks!
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
