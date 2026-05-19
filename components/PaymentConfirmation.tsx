"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import Image from "next/image";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

interface Package {
  id: number;
  name: string;
  price: number;
  description: string;
  duration: string;
}

interface PaymentConfirmationProps {
  selectedPackage: Package;
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
}

export default function PaymentConfirmation({
  selectedPackage,
  onClose,
  onSubmit,
}: PaymentConfirmationProps) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Profile details state
  const [profileInputs, setProfileInputs] = useState({
    national_id: "",
    telebirr_account: "",
    company_name: "",
    license_no: "",
    tax_id: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileInputs((prev) => ({ ...prev, [field]: value }));
  };

  const paymentMethods = [
    {
      id: "cbe",
      name: "Bank Transfer (CBE)",
      description: "Commercial Bank of Ethiopia",
      icon: "/cbe.png",
    },
    {
      id: "telebirr",
      name: "Telebirr",
      description: "Mobile Payment Service",
      icon: "/telebirr.png",
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!paymentMethod || !paymentProof) {
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentData = {
        package: selectedPackage,
        paymentMethod,
        paymentProof,
        profile: profileInputs, // ✅ include profile input states
      };
      await onSubmit(paymentData);
      toast({
        title: "✅ Request submitted",
        description:
          "Your payment request has been submitted. It may take 2-5 days for approval.",
        variant: "success",
      });
    } catch (error) {
      console.error("Payment submission failed:", error);
      toast({
        title: "❌ Payment submission failed",
        description: "Please try again or contact support if the issue continues.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Details
            </h1>
            <p className="text-gray-600">
              Complete your payment to activate your listing
            </p>
          </div>

          {/* Selected Package Summary */}
          <div className="mb-8">
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">
              Selected Package
            </Label>
            <Card className="bg-background border-border">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedPackage.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedPackage.description}
                  </p>
                </div>
                <div className="text-right text-2xl font-bold text-zinc-900">
                  ETB {selectedPackage.price.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Detail */}
          <div className="mb-8">
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">
              Profile Detail *
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {selectedPackage.id === 2 ? (
                <>
                  <Input
                    className="w-full border-gray-300 rounded-md text-left !py-8"
                    placeholder="National Id"
                    value={profileInputs.national_id}
                    onChange={(e) =>
                      handleInputChange("national_id", e.target.value)
                    }
                  />
                  <Input
                    className="w-full border-gray-300 rounded-md text-left !py-8"
                    placeholder="Telebirr account"
                    value={profileInputs.telebirr_account}
                    onChange={(e) =>
                      handleInputChange("telebirr_account", e.target.value)
                    }
                  />
                </>
              ) : (
                <>
                  <Input
                    className="w-full border-gray-300 rounded-md text-left !py-8"
                    placeholder="Company Name"
                    value={profileInputs.company_name}
                    onChange={(e) =>
                      handleInputChange("company_name", e.target.value)
                    }
                  />
                  <Input
                    className="w-full border-gray-300 rounded-md text-left !py-8"
                    placeholder="License No."
                    value={profileInputs.license_no}
                    onChange={(e) =>
                      handleInputChange("license_no", e.target.value)
                    }
                  />
                  <Input
                    className="w-full border-gray-300 rounded-md text-left !py-8"
                    placeholder="Tax Id"
                    value={profileInputs.tax_id}
                    onChange={(e) => handleInputChange("tax_id", e.target.value)}
                  />
                  <Input
                    className="w-full border-gray-300 rounded-md text-left !py-8"
                    placeholder="Telebirr account"
                    value={profileInputs.telebirr_account}
                    onChange={(e) =>
                      handleInputChange("telebirr_account", e.target.value)
                    }
                  />
                </>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-8">
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">
              Payment Method *
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="w-full border-gray-300 rounded-md text-left !py-8">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    <div className="flex items-center gap-3">
                      <Image
                        src={method.icon}
                        className="size-8 cover"
                        width={100}
                        height={100}
                        alt={`${method.name}-logo`}
                      />
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-gray-500">
                          {method.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bank Transfer Details */}
          {paymentMethod === "cbe" && (
            <div className="mb-8">
              <Card className="bg-gray-100/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Bank Transfer Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Account Number:</strong> 1000036123428
                    </div>
                    <div>
                      <strong>Name:</strong> Fk Mike
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Telebirr Details */}
          {paymentMethod === "telebirr" && (
            <div className="mb-8">
              <Card className="bg-gray-100/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Telebirr Payment Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Phone Number:</strong> +251 911 234 567
                    </div>
                    <div>
                      <strong>Name:</strong> Fk Mike
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment Proof Upload */}
          <div className="mb-8">
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">
              Payment Proof *
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="payment-proof"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="payment-proof"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  Choose a file
                </div>
                <div className="text-sm text-gray-500">
                  JPG, PNG or PDF up to 10MB
                </div>
              </label>
            </div>
            {paymentProof && (
              <div className="mt-3 text-sm text-green-600">
                ✓ File selected: {paymentProof.name}
              </div>
            )}
            <p className="text-sm text-gray-600 mt-2">
              Please select proof of payment screenshot to submit application
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1 h-12">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!paymentMethod || !paymentProof || isSubmitting}
              className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              {isSubmitting ? "Submitting..." : "Submit Payment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
