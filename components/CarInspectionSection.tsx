"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  Calendar,
  Gauge,
  ExternalLink,
  Award,
  ClipboardCheck,
  Clock,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { useCarInspections } from "@/hooks/cars";
import type { CarInspection } from "@/lib/carApi";
import { useUserStore } from "@/store/user";

interface CarInspectionSectionProps {
  carId: string | number;
  className?: string;
  variant?: "full" | "compact";
}

export default function CarInspectionSection({
  carId,
  className = "",
  variant = "full",
}: CarInspectionSectionProps) {
  const { user } = useUserStore();
  const isLoggedIn = !!user?.email;

  const { data: inspections, isLoading, isError } = useCarInspections(carId, isLoggedIn);

  if (!isLoggedIn) {
    return null;
  }

  if (isLoading) {
    if (variant === "compact") {
      return (
        <div className={`p-3 rounded-xl border border-border/80 bg-background/50 animate-pulse space-y-2 ${className}`}>
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-10 bg-muted rounded-lg" />
        </div>
      );
    }

    return (
      <Card className={`bg-white/40 dark:bg-card/40 border-border/80 shadow-none animate-pulse ${className}`}>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-muted rounded w-1/3" />
          <div className="h-20 bg-gray-200 dark:bg-muted rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-16 bg-gray-200 dark:bg-muted rounded-lg" />
            <div className="h-16 bg-gray-200 dark:bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find the most relevant inspection for this car in the frontend
  const inspectionList = inspections || [];
  const targetId = Number(carId);
  const matchedInspection = inspectionList.find((item: CarInspection) => {
    const itemCarId = typeof item.car === "object" && item.car !== null ? item.car?.id : Number(item.car);
    return itemCarId === targetId;
  });

  if (!matchedInspection || isError) {
    if (variant === "compact") {
      return (
        <div className={`p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1.5 ${className}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
              Vehicle Inspection
            </div>
            <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">
              Not Inspected Yet
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            No inspection report submitted for this vehicle yet.
          </p>
        </div>
      );
    }

    return (
      <Card className={`bg-muted/20 border-border/60 shadow-none ${className}`}>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-muted text-muted-foreground shrink-0 mt-0.5">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground text-base">
                  Vehicle Inspection
                </h3>
                <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
                  Not Inspected Yet
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An official inspection report has not been submitted for this vehicle yet. You can contact the seller directly to request an inspection before purchase.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const inspection = matchedInspection;

  // Format dates
  const formattedDate = inspection.inspection_date
    ? new Date(inspection.inspection_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const formattedVerifiedDate = inspection.verified_at
    ? new Date(inspection.verified_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  // Status badge styling
  const statusLower = (inspection.status || "pending").toLowerCase();
  const isVerified = statusLower === "verified" || statusLower === "approved";

  // Condition styling
  const condition = (inspection.condition_status || "").toLowerCase();
  const getConditionBadge = () => {
    switch (condition) {
      case "excellent":
        return {
          label: "Excellent Condition",
          className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/60",
          barColor: "bg-emerald-500",
        };
      case "good":
        return {
          label: "Good Condition",
          className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/60",
          barColor: "bg-blue-500",
        };
      case "fair":
        return {
          label: "Fair Condition",
          className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/60",
          barColor: "bg-amber-500",
        };
      case "poor":
        return {
          label: "Poor Condition",
          className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700/60",
          barColor: "bg-red-500",
        };
      default:
        return {
          label: inspection.condition_status ? `${inspection.condition_status} Condition` : "Inspected",
          className: "bg-muted text-foreground border-border",
          barColor: "bg-primary",
        };
    }
  };

  const conditionMeta = getConditionBadge();
  const reportLink = inspection.report_url || inspection.signed_report;

  // Format score
  const score = inspection.inspection_score;
  const isNormalScore = score !== undefined && score !== null && score > 0 && score <= 100;

  if (variant === "compact") {
    return (
      <div className={`p-4 rounded-xl border border-border/80 bg-background/50 space-y-3 ${className}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-sm text-foreground">Inspection Report</span>
          </div>
          <Badge variant="outline" className={`text-xs capitalize font-medium ${conditionMeta.className}`}>
            {conditionMeta.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/40">
            {inspection.odometer_verified ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            )}
            <span className="truncate">
              {inspection.odometer_verified ? "Odometer Verified" : "Odometer Unverified"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/40">
            {!inspection.accident_history ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            )}
            <span className="truncate">
              {!inspection.accident_history ? "Clean History" : "Accident Reported"}
            </span>
          </div>
        </div>

        {reportLink && (
          <a
            href={reportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-primary hover:underline border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            View Full Report
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <Card className={`bg-white/40 dark:bg-card/40 border-border/80 shadow-none overflow-hidden ${className}`}>
      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                Vehicle Inspection Details
              </h2>
              {isVerified ? (
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/60 text-xs font-semibold gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Report
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/60 text-xs font-medium gap-1">
                  <Clock className="w-3 h-3" />
                  Pending Review
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
              {inspection.inspector && (
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
                  Inspector: <strong className="text-foreground font-medium">{inspection.inspector}</strong>
                </span>
              )}
              {formattedDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  Inspected on {formattedDate}
                </span>
              )}
            </p>
          </div>

          {/* Condition Badge */}
          <div className="shrink-0">
            <Badge variant="outline" className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${conditionMeta.className}`}>
              {conditionMeta.label}
            </Badge>
          </div>
        </div>

        {/* Highlights Banner: Score, Condition, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Inspection Score */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Inspection Score</p>
              <p className="text-lg font-bold text-foreground">
                {isNormalScore ? `${score}/100` : score ? `${score}` : "Evaluated"}
              </p>
            </div>
          </div>

          {/* Odometer Status */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                inspection.odometer_verified
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Odometer Check</p>
              <p className="text-sm font-semibold text-foreground">
                {inspection.odometer_verified ? "Verified Accurate" : "Not Verified"}
              </p>
            </div>
          </div>

          {/* Accident History */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                !inspection.accident_history
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Accident History</p>
              <p className="text-sm font-semibold text-foreground">
                {!inspection.accident_history ? "No Accidents Reported" : "Accident Reported"}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Checkpoints */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Verification Checkpoints
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-background border border-border/70">
              {inspection.odometer_verified ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className="text-foreground">
                Odometer Reading:{" "}
                <strong className={inspection.odometer_verified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}>
                  {inspection.odometer_verified ? "Verified Accurate" : "Unverified"}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-background border border-border/70">
              {!inspection.accident_history ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className="text-foreground">
                Collision History:{" "}
                <strong className={!inspection.accident_history ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}>
                  {!inspection.accident_history ? "Clean (No Major Accidents)" : "Prior Incident Recorded"}
                </strong>
              </span>
            </div>

            {inspection.verified_by_email && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-background border border-border/70 sm:col-span-2">
                <FileCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="text-foreground">
                  Verified by Examiner:{" "}
                  <strong className="text-primary font-medium">{inspection.verified_by_email}</strong>
                  {formattedVerifiedDate && ` on ${formattedVerifiedDate}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Inspector Remarks */}
        {inspection.remarks && (
          <div className="space-y-1.5 p-4 rounded-xl bg-muted/30 border border-border/70">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Inspector Remarks
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed italic">
              &ldquo;{inspection.remarks}&rdquo;
            </p>
          </div>
        )}

        {/* Admin Remarks if present */}
        {inspection.admin_remarks && (
          <div className="space-y-1.5 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Admin Review Notes
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {inspection.admin_remarks}
            </p>
          </div>
        )}

        {/* Report Download / View Button */}
        {reportLink && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20 p-4 rounded-xl border border-border/60">
            <div className="space-y-0.5 text-left w-full sm:w-auto">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-primary" />
                Official Signed Inspection Certificate
              </p>
              <p className="text-xs text-muted-foreground">
                Download or review the full signed inspection document.
              </p>
            </div>
            <Button
              asChild
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 py-2 cursor-pointer gap-2 shrink-0 shadow-sm"
            >
              <a
                href={reportLink}
                target="_blank"
                rel="noopener noreferrer"
                title="View Inspection Report"
              >
                <FileText className="w-4 h-4" />
                View Full Inspection Report
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
