"use client";

import { CardContent } from "@/components/ui/card";
import { Gauge, Heart, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { useCarFavorites, useUpdateCar, useUpdateFavorite } from "@/hooks/cars";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type Props = {
  title: string;
  backgroundTitle: string;
  km: number;
  transmission: string;
  price: number;
  image: string;
  color: string;
  selectedColor?: number;
  href: string;
  id: number;
};

export default function CarCard({
  title,
  backgroundTitle,
  km,
  transmission,
  price,
  image,
  color,
  selectedColor = 0,
  href,
  id,
}: Props) {
  const { data: favorites } = useCarFavorites();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
  const { mutate: makeFavorite } = useUpdateFavorite(onSuccess, onError);
  const isFavorite = favorites?.findIndex((favorite) => favorite.car === id);

  const formatNumber = (n: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

  return (
    <Link href={href} className="flex h-full flex-col cursor-pointer p-0">
      <div className="relative h-[280px] w-full">
        {/* Car image */}
        <div className="relative z-10 flex h-full w-full items-end justify-center">
          <img
            src={image || "/placeholder.svg"}
            alt={`${title} side view`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 pb-6 pt-2">
        {/* Title */}
        <h3 className="text-lg font-semibold tracking-tight text-neutral-900 text-center">
          {title}
        </h3>

        {/* Specs */}
        <div className="flex items-center gap-6 border-b border-neutral-200/70 pb-3">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Gauge className="h-4 w-4" aria-hidden="true" />
            <span>{formatNumber(km)} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Settings className="h-4 w-4" aria-hidden="true" />
            <span>{transmission}</span>
          </div>
          <div className="flex items-center gap-3">
            <Image
              src={"/seat.svg"}
              alt={"seat svg"}
              width={100}
              height={100}
              className="size-6"
            />
            <span className="capitalize text-sm">{color}</span>
          </div>
        </div>

        {/* Colors + Price */}
        <div className="mt-1 flex items-center justify-between">
          <button
            className="flex items-center gap-3 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              makeFavorite(id);
            }}
          >
            <Heart
              className={`${
                isFavorite === -1 ? "" : "fill-primary text-primary"
              } cursor-pointer`}
            />
          </button>

          <div className="text-sm">
            <span className="text-neutral-500">From</span>{" "}
            <span className="font-semibold text-neutral-900">
              {"ETB " + formatNumber(price)}
            </span>
          </div>
        </div>
      </CardContent>
    </Link>
  );
}
