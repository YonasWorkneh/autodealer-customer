import React from "react";
import CarCard from "./CarCard";
import { Card } from "./ui/card";
import Link from "next/link";
import { usePopularCars } from "@/hooks/cars";

export default function Popular() {
  const { data: popularCars } = usePopularCars();

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 py-20">
      {/* Heading */}
      <div className="flex justify-center mb-20 relative">
        <h1 className="text-xl sm:text-2xl text-center uppercase relative">
          Popular Cars
          <span className="absolute top-1/2 left-[-80px] w-16 border-t border-black/20 -translate-y-1/2 hidden md:inline-block" />
          <span className="absolute top-1/2 right-[-80px] w-16 border-t border-black/20 -translate-y-1/2 hidden md:inline-block" />
        </h1>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {popularCars?.map((car) => (
          <Card
            key={car.id}
            className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm py-0"
          >
            <CarCard
              title={car.make + " " + car.model}
              backgroundTitle={car.make}
              km={car.mileage}
              transmission={car.engine}
              price={+car.price}
              image={
                car.images.find((image) => image.is_featured)?.image_url ||
                car.images[0].image_url
              }
              color={car.interior_color}
              selectedColor={0}
              href={`listing/${String(car.id)}`}
              id={car.id}
            />
          </Card>
        ))}

        {/* View More */}
        <div className="flex justify-center items-center sm:justify-start mt-4 sm:mt-0">
          <Link
            href={"/listing"}
            className="group h-[50px] bg-primary text-primary-foreground hover:bg-primary-hover rounded-md p-1 w-fit cursor-pointer flex gap-2 items-center px-3"
          >
            <span>View more</span>
            <span className="group-hover:translate-x-1 transition-all">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
