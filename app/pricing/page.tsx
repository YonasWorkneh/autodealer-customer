"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Indent, Star } from "lucide-react";
import PaymentConfirmation from "@/components/PaymentConfirmation";
import Header from "@/components/Header";
import { useUserStore } from "@/store/user";
import { useProfile, useUpgradeProfile } from "@/hooks/profile";
import { useToast } from "@/hooks/use-toast";
import { indexedDBManager } from "@/lib/indexedDB";
import { useParams, useSearchParams } from "next/navigation";

interface Package {
  id: number;
  name: string;
  price: number;
  description: string;
  duration: string;
  features: string[];
  featured?: boolean;
}

export default function PricingPage() {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const { user, setUser } = useUserStore();
  const { data: profile } = useProfile();
  const searchParams = useSearchParams();
  const p_id = searchParams.get("p_id");
  const { toast } = useToast();
  const { mutate: upgradeProfile, isError } = useUpgradeProfile();

  const packages: Package[] = [
    {
      id: 1,
      name: "Free",
      price: 0,
      description: "30 days on website",
      duration: "30 days",
      features: [
        "All user features",
        "Get car dealerships and auctions",
        "contact dealers",
      ],
    },
    {
      id: 2,
      name: "Dealer",
      price: 1400,
      description: "10 days home + 30 days website",
      duration: "40 days",
      features: [
        "Ability to post your cars",
        "10 posts for a month",
        "Enhanced visibility",
      ],
      featured: true,
    },
    {
      id: 3,
      name: "Enterprise",
      price: 2000,
      description: "Maximum exposure",
      duration: "60 days",
      features: [
        "Unlimitted support",
        "Unlimitted car posts",
        "Sales analytics ERP",
      ],
    },
  ];

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowPaymentConfirmation(true);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      console.log(paymentData);
      setShowPaymentConfirmation(false);
      setSelectedPackage(null);
      const id = paymentData.package.id;
      const profile = paymentData.profile;
      upgradeProfile({
        data: profile,
        to: `${id === 2 ? "broker" : "dealer"}`,
      });
      if (p_id) await indexedDBManager.deleteCarForm(+p_id);
      if (isError) throw new Error("Error upgrading profile.");
    } catch (err: any) {
      toast({
        title: "❌ Payment Error",
        description: "Something went wrong trying to upgrade profile.",
      });
    }
  };

  const handleClosePayment = () => {
    setShowPaymentConfirmation(false);
    setSelectedPackage(null);
  };
  return (
    <div className="min-h-screen bg-background ">
      <Header color="black" />
      <div className="max-w-6xl mx-auto py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-balance">
            Choose your plan
          </h1>
          <p className="text-gray-500">
            Select the package that suits your needs and start posting your cars
            for sale today.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {packages.map((pkg, index) => (
            <Card
              key={pkg.id}
              className={`relative py-10 ${
                pkg.id === 2
                  ? "border-2 border-zinc-900 shadow-lg"
                  : "border border-gray-200"
              }`}
            >
              {pkg.id === 2 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {pkg.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {pkg.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900">
                    ETB {pkg.price.toLocaleString()}
                  </div>
                  <div className="text-gray-600">{pkg.duration}</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPackage(pkg)}
                  className={`cursor-pointer w-full mb-4  ${
                    pkg.featured
                      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                      : "bg-gray-100 hover:bg-gray-200 text-black"
                  }`}
                >
                  Select {pkg.name}
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Secure payment processing
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Confirmation Modal */}
        {showPaymentConfirmation &&
          selectedPackage &&
          selectedPackage.id !== 1 && (
            <PaymentConfirmation
              selectedPackage={selectedPackage}
              onClose={handleClosePayment}
              onSubmit={handlePaymentSubmit}
            />
          )}
      </div>
    </div>
  );
}
