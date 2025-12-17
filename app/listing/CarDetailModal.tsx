"use client";

import { X, Heart, Gauge, Fuel, Palette, Car, Bluetooth } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { DialogTitle } from "@radix-ui/react-dialog";
import Link from "next/link";
import { FetchedCar } from "@/app/types/Car";
import { useCarFavorites, useUpdateFavorite } from "@/hooks/cars";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";

interface CarListingModalProps {
  car: FetchedCar | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CarDetailModal({ car, isOpen, onClose }: CarListingModalProps) {
  const { data: favorites } = useCarFavorites();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["car-favorites"] });
    toast({
      title: "✅ Successfull",
      description: "Car has been marked as your favorite.",
    });
  };

  const onError = () =>
    toast({
      title: "❌ Something went wrong",
      description: "Unable to make car your favorite.",
    });

  const { mutate: toggleFavorite } = useUpdateFavorite(onSuccess, onError);

  if (!car) return null;

  const favorited = favorites?.findIndex((favorite) => favorite.car === car.id);

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("en-US").format(mileage);
  };

  // Get main image
  const mainImage = car.images?.[0]?.image_url || "/placeholder.svg";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl p-0 gap-0"
        title={car.make + " " + car.model}
      >
        <DialogTitle></DialogTitle>
        {/* Header */}
        <div className="relative p-6 pb-4">
          <div className="flex gap-4 border rounded-md shadow-[0px_8px_16px_rgba(0,0,0,.08)] p-4 mt-4 bg-white">
            <div className="relative">
              <Image
                src={mainImage}
                alt={`${car.year} ${car.make} ${car.model}`}
                width={100}
                height={100}
                className="w-36 h-auto object-cover rounded-md bg-gray-100"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {car.year} {car.make} {car.model} {car.trim || ""}
              </h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(car.price)}
                </span>
                <span className="text-sm text-gray-600 capitalize">
                  {car.sale_type}
                </span>
              </div>
            </div>
            <Button
              className="size-6 mt-1 bg-transparent shadow-none hover:bg-transparent cursor-pointer"
              onClick={() => toggleFavorite(car.id)}
            >
              <Heart
                className={`size-6 ${
                  favorited !== -1
                    ? "text-zinc-800 fill-zinc-800"
                    : "text-black hover:text-zinc-900"
                }`}
              />
            </Button>
          </div>
          <div className="absolute top-[calc(50%+20px)] border-t left-0 h-2 w-full -z-50" />
        </div>

        {/* Key Details Section */}
        <div className="px-6 pb-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">KEY DETAILS</h3>
            <Link
              href={`/listing/${car.id}`}
              className="text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-900 cursor-pointer flex items-center gap-1 group p-4 py-2 rounded-sm"
            >
              <span>View more</span>
              <span className="group-hover:translate-x-1 transition-all">
                →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Gauge className="size-6 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Mileage
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatMileage(car.mileage)} Miles
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Image
                    src={"/drive-train.svg"}
                    alt={"drive-train svg"}
                    width={100}
                    height={100}
                    className="size-8"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Drivetrain
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {car.drivetrain}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Palette />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Exterior color
                  </div>
                  <div className="text-sm text-gray-600">
                    {car.exterior_color || "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Image
                    src={"/seat.svg"}
                    alt={"seat svg"}
                    width={100}
                    height={100}
                    className="size-8"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Interior color
                  </div>
                  <div className="text-sm text-gray-600">
                    {car.interior_color || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className="text-xs font-bold text-gray-600 border border-gray-400 rounded px-1">
                    A
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Transmission
                  </div>
                  <div className="text-sm text-gray-600">Automatic</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Fuel className="size-6 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Fuel type
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {car.fuel_type}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Car className="size-6 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Body type
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {car.body_type}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bluetooth className="size-6 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Bluetooth
                  </div>
                  <div className="text-sm text-gray-600">
                    {car.bluetooth ? "Available" : "Not Available"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Information Section */}
        <div className="px-6 pb-6">
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                VEHICLE INFORMATION
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Make:</span>
                <span className="font-medium text-gray-900">{car.make}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Body style:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {car.body_type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium text-gray-900">{car.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Condition:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {car.condition}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trim:</span>
                <span className="font-medium text-gray-900">
                  {car.trim || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {car.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Year:</span>
                <span className="font-medium text-gray-900">{car.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Engine:</span>
                <span className="font-medium text-gray-900">
                  {car.engine || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
