"use client";
import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { FetchedCar } from "@/app/types/Car";
import { Heart } from "lucide-react";
import { useCarFavorites, useUpdateFavorite } from "@/hooks/cars";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/user";
import { useProfile } from "@/hooks/profile";
import { formatPrice } from "@/lib/utils";

export default function Car({
  setDetailOpened,
  car,
  highlightQuery,
  variant = "list",
}: {
  setDetailOpened: (status: boolean) => void;
  car: FetchedCar;
  highlightQuery?: string;
  variant?: "list" | "grid";
}) {
  const { user } = useUserStore();
  const { data: profile } = useProfile();
  const { data: favorites } = useCarFavorites();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isLoggedIn = !!user.email;
  const isSeller = !!(profile?.broker_profile || profile?.dealer_profile);

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["car-favorites"] });
    toast({
      title: "Success",
      description: "Car has been marked as your favorite.",
      variant: "success",
    });
  };
  const onError = () =>
    toast({
      title: "❌ Something went wrong",
      description: "Unable to make car your favorite.",
      variant: "destructive",
    });
  const { mutate } = useUpdateFavorite(onSuccess, onError);
  const favorited = favorites?.findIndex((favorite) => favorite.car === car.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isLoggedIn) {
      toast({
        title: "❌ Login Required",
        description: "Please log in to add cars to your favorites.",
        variant: "destructive",
      });
      return;
    }

    mutate(car.id);
  };

  const sellerContact =
    typeof car.seller === "object" ? car.seller.contact_number : undefined;

  // Format price from string to currency
  const formattedPrice = formatPrice(car.price);

  // Calculate days on market
  const daysOnMarket = car.created_at
    ? Math.floor(
        (new Date().getTime() - new Date(car.created_at).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  // Get main image
  const mainImage = car.featured_image || "/placeholder.svg";

  const renderTitle = () => {
    const title = `${car.year} ${car.make} ${car.model}`;
    if (!highlightQuery) return title;
    const q = highlightQuery.trim();
    if (!q) return title;
    const i = title.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return title;
    const before = title.slice(0, i);
    const match = title.slice(i, i + q.length);
    const after = title.slice(i + q.length);
    return (
      <>
        {before}
        <span className="underline font-semibold">{match}</span>
        {after}
      </>
    );
  };

  if (variant === "grid") {
    return (
      <Link key={car.id} href={`/listing/${car.id}`} className="block h-full">
        <Card className="shadow-none border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex flex-col p-0 rounded-xl min-h-[420px] max-h-[720px] overflow-hidden">
          <div className="relative">
            <img
              src={mainImage}
              alt={`${car.year} ${car.make} ${car.model}`}
              className="w-full h-48 object-cover"
            />
            {!isSeller && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white cursor-pointer rounded-full"
                onClick={handleFavoriteClick}
              >
                <Heart
                  className={`h-4 w-4 ${isLoggedIn && favorited !== -1 ? "fill-primary text-primary" : ""}`}
                />
              </Button>
            )}
          </div>
          <CardContent className="p-4 sm:p-6 flex flex-col gap-4">
            <div className="space-y-2 flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-black line-clamp-2">
                {renderTitle()}
              </h3>
              
              <p className="text-gray-600 text-sm capitalize">
                {car.body_type}
              </p>
              <Badge
                variant="secondary"
                className={`${
                  car.status === "available"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {car.status}
              </Badge>
            </div>
            <div className="flex items-end justify-between max-[1700px]:flex-col max-[1700px]:items-start max-[1700px]:gap-3">
              <div>
                <p className="text-xl sm:text-2xl font-bold">
                  {formattedPrice}
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  {car.sale_type}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="border border-gray-200 hover:bg-gray-100 max-[1700px]:self-stretch max-[1700px]:justify-center"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDetailOpened(true);
                }}
              >
                Quick view
              </Button>
            </div>
            {sellerContact && (
              <div className="flex gap-2 pt-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <a
                  href={`https://wa.me/${sellerContact.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat on WhatsApp"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border-0 sm:border sm:border-green-500 text-green-600 hover:bg-green-50 transition-colors text-xs font-medium"
                >
                  <svg className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
                <a
                  href={`https://t.me/${sellerContact.replace(/\s/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Message on Telegram"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border-0 sm:border sm:border-blue-400 text-blue-500 hover:bg-blue-50 transition-colors text-xs font-medium"
                >
                  <svg className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span className="hidden sm:inline">Telegram</span>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link key={car.id} href={`/listing/${car.id}`} className="block relative">
      <Card className="shadow-none border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Image */}
          <div className="relative">
            <img
              src={mainImage}
              alt={`${car.year} ${car.make} ${car.model}`}
              className="w-full h-40 object-cover rounded-lg"
            />
            {!isSeller && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white cursor-pointer"
                onClick={handleFavoriteClick}
              >
                <Heart
                  className={`h-4 w-4 ${isLoggedIn && favorited !== -1 ? "fill-primary text-primary" : ""}`}
                />
              </Button>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-lg sm:text-xl font-semibold text-black">
              {renderTitle()}
            </h3>
            {/* TODO: Add mileage and fuel type when available in FetchedCar type */}
            {/* <p className="text-gray-600 text-sm">
              {car.mileage?.toLocaleString()} miles
            </p> */}
            <p className="text-gray-600 text-sm capitalize">{car.body_type}</p>
            <Badge
              variant="secondary"
              className={`${
                car.status === "available"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {car.status}
            </Badge>
            <p className="text-gray-600 text-sm">
              {daysOnMarket} days on market
            </p>
          </div>

          {/* Price */}
          <div className="flex flex-col justify-between items-end text-right space-y-1">
            <p className="text-xl sm:text-2xl font-bold">{formattedPrice}</p>
            <p className="text-sm text-gray-600 capitalize">{car.sale_type}</p>
            {sellerContact && (
              <div className="flex gap-1.5 mt-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <a
                  href={`https://wa.me/${sellerContact.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat on WhatsApp"
                  className="flex items-center justify-center p-1.5 rounded-md border-0 sm:border sm:border-green-500 text-green-600 hover:bg-green-50 transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a
                  href={`https://t.me/${sellerContact.replace(/\s/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Message on Telegram"
                  className="flex items-center justify-center p-1.5 rounded-md border-0 sm:border sm:border-blue-400 text-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Button
        className="absolute top-1/2 -translate-y-1/2 right-2 z-20 cursor-pointer w-fit h-fit flex flex-col gap-1 bg-background/80 shadow-sm hover:bg-background border border-gray-200 rounded-xl p-2 max-[1700px]:top-auto max-[1700px]:bottom-4 max-[1700px]:absolute max-[1700px]:right-auto max-[1700px]:left-1/2 max-[1700px]:-translate-x-1/2"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDetailOpened(true);
        }}
      >
        <span className="inline-block size-[6px] bg-gray-500 rounded-full p-0" />
        <span className="inline-block size-[6px] bg-gray-500 rounded-full" />
        <span className="inline-block size-[6px] bg-gray-500 rounded-full" />
      </Button>
    </Link>
  );
}
