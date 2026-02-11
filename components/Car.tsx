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
  const { data: favorites } = useCarFavorites();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isLoggedIn = !!user.email;

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
        color: "white",
        className: "text-white bg-red-600",
      });
      return;
    }

    mutate(car.id);
  };

  // Format price from string to currency
  const formattedPrice = formatPrice(car.price);

  // Calculate days on market
  const daysOnMarket = car.created_at
    ? Math.floor(
        (new Date().getTime() - new Date(car.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  // Get main image
  const mainImage = car.images?.[0]?.image_url || "/placeholder.svg";

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
            </div>
          <CardContent className="p-4 sm:p-6 flex flex-col gap-4"> 
            <div className="space-y-2 flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-black line-clamp-2">
                {renderTitle()}
              </h3>
              <p className="text-gray-600 text-sm">
                {car.mileage?.toLocaleString()} miles
              </p>
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
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-lg sm:text-xl font-semibold text-black">
              {renderTitle()}
            </h3>
            <p className="text-gray-600 text-sm">
              {car.mileage?.toLocaleString()} miles
            </p>
            <p className="text-gray-600 text-sm capitalize">{car.fuel_type}</p>
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
            {car.trim && <p className="text-sm text-gray-600">{car.trim}</p>}
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
