"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2,
  MoreVertical,
  Calendar,
  Clock,
  Car,
  LogIn,
} from "lucide-react";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { useDeleteCar, useMyAds } from "@/hooks/cars";
import { useProfile } from "@/hooks/profile";
import { useUserStore } from "@/store/user";
import { formatPrice } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { useToast } from "@/hooks/use-toast";

// Define type for your ads
interface CarAd {
  id: number;
  images: { id: number; image_url: string; is_featured: boolean }[];
  make: string;
  model: string;
  year: number;
  price: string;
  status: string; // "available", "draft", etc.
  updated_at: string;
  created_at: string;
}

export default function MyListingsPage() {
  const { user } = useUserStore();
  const { data: profile } = useProfile();
  const {
    data: ads = [],
    isLoading,
    isError,
  } = useMyAds(profile?.broker_profile?.id);

  const router = useRouter();

  // Check if user is logged in
  const isLoggedIn = !!user.email;

  const [selectedAds, setSelectedAds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const filteredAds =
    activeTab === "all" ? ads : ads.filter((ad) => ad.status === activeTab);

  const handleSelectAd = (adId: number) => {
    setSelectedAds((prev) =>
      prev.includes(adId) ? prev.filter((id) => id !== adId) : [...prev, adId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAds.length === ads.length) {
      setSelectedAds([]);
    } else {
      setSelectedAds(ads.map((ad) => ad.id));
    }
  };
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const { toast } = useToast();
  const [id, setId] = useState<number>();
  const onSuccess = () => {
    setModalOpened(false);
    toast({
      title: "Success",
      description: "Your add was successfully removed.",
      variant: "success",
    });
  };

  const onError = () => {
    setModalOpened(false);
    toast({
      title: "❌ Delete Failed",
      description: "Something went wrong trying to delte your add.",
    });
  };

  const { mutate: deleteCar, isPending: isDeleting } = useDeleteCar(
    onError,
    onSuccess
  );

  // Skeleton loader component
  const SkeletonCard = () => (
    <Card className="p-0 bg-transparent shadow-none border border-gray-200 animate-pulse overflow-hidden rounded-xl flex flex-col h-full">
      <div className="w-full aspect-[4/3] bg-gray-200"></div>
      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 w-1/3 bg-gray-200 rounded mt-auto"></div>
        <div className="flex items-center gap-4 mt-2">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header color="black" />

      <div className="px-6 sm:px-40 lg:px-50 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Ads</h1>
          <p className="text-gray-500 text-sm sm:text-base mt-2">
            {isLoggedIn
              ? "Manage your car listings and track their status."
              : "Sign in to view and manage your car listings."}
          </p>
        </div>

        {/* Not Logged In State */}
        {!isLoggedIn ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center max-w-md">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Login Required
                </h2>
                <p className="text-gray-600 mb-6">
                  Please sign in to view and manage your car listings.
                </p>
              </div>
              <Link href="/signin">
                <Button className="bg-primary text-primary-foreground hover:bg-primary-hover px-6 py-6 flex items-center gap-2 mx-auto">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            {/* <div className="flex gap-2 mb-8 border-b border-gray-200">
              {[
                "all",
                "live",
                "draft",
                "Payment Pending",
                "Under Review",
                "rejected",
                "expired",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`cursor-pointer px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-zinc-900 text-zinc-900"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} (
                  {tab === "all"
                    ? ads.length
                    : ads.filter((ad) => ad.status === tab).length}
                  )
                </button>
              ))}
            </div> */}

            {/* Ad selection */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedAds.length === ads.length && ads.length > 0}
                  onCheckedChange={handleSelectAll}
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-600">
                  {selectedAds.length} ads selected
                </span>
              </div>
              {selectedAds.length > 0 && (
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>

            {/* Ads List */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-700 mb-4">
                Cars ({filteredAds.length})
              </h2>

              {isLoading ? (
                // Display skeleton cards while loading
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : filteredAds.length === 0 ? (
                <Card className="bg-transparent shadow-none">
                  <CardContent className="p-12 text-center">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No ads found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {activeTab === "all"
                        ? "You haven't posted any ads yet."
                        : `You don't have any ${activeTab} ads.`}
                    </p>
                    <Link
                      href={"/place-add"}
                      className="bg-primary text-primary-foreground hover:bg-primary-hover px-4 py-2 rounded-sm"
                    >
                      Post Your First Ad
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAds.map((ad) => (
                    <Card
                      key={ad.id}
                      className="p-0 bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col gap-0"
                    >
                      <div className="relative w-full aspect-[4/3] bg-gray-100 group">
                        {ad.featured_image === null ? (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No Image
                          </div>
                        ) : (
                          <Image
                            src={ad.featured_image}
                            alt={ad.make + " " + ad.model}
                            fill
                            className="object-cover"
                          />
                        )}
                        {/* Overlay Gradient for better visibility of top controls */}
                        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/50 to-transparent opacity-60"></div>

                        {/* Checkbox */}
                        <div className="absolute top-3 left-3 z-10">
                          <Checkbox
                            checked={selectedAds.includes(ad.id)}
                            onCheckedChange={() => handleSelectAd(ad.id)}
                            className="bg-white/90 border-transparent data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </div>

                        {/* Actions Menu */}
                        <div className="absolute top-2 right-2 z-10">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors">
                                  <MoreVertical className="h-4 w-4 text-gray-700" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/place-add?c_id=${ad.id}`)
                                  }
                                  className="cursor-pointer"
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setModalOpened(true), setId(ad.id);
                                  }}
                                  className="text-red-600 focus:text-red-600 cursor-pointer"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                      </div>

                      <CardContent className="p-4 flex flex-col flex-1">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1">
                                {ad.make} {ad.model} {ad.year}
                            </h3>
                            <p className="text-xl font-bold text-gray-900 mb-3">
                                {formatPrice(ad.price)}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                          {/* <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                {new Date(ad.updated_at).toLocaleDateString()}
                            </span>
                          </div> */}
                           <Badge variant="outline" className="text-xs font-normal border-gray-200 text-gray-600 capitalize">
                                {ad.status}
                           </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            {modalOpened && (
              <Modal
                onCancel={() => setModalOpened(false)}
                onConfirm={() => id && deleteCar(id)}
                confirmLable="Delete"
                styles="bg-red-600 hover:bg-red-700"
                isVisible={modalOpened}
                isLoading={isDeleting}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
