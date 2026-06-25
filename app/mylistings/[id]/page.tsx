"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { useCar } from "@/hooks/cars";
import { formatPrice } from "@/lib/utils";
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export default function MyListingDetailPage() {
  const { id } = useParams();
  const { data: car, isLoading, error } = useCar(id as string);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header color="black" />
        <main className="mx-auto max-w-6xl px-6 py-20 text-center">
          <Loader2 className="mx-auto mb-6 h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-slate-700">Loading car details…</p>
        </main>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-background">
        <Header color="black" />
        <main className="mx-auto max-w-6xl px-6 py-20 text-center text-slate-700">
          <p className="text-xl font-semibold">Unable to load this listing.</p>
          <p className="mt-3 text-sm text-slate-500">
            Please try again or return to your ads.
          </p>
          <Link
            href="/mylistings"
            className="mt-6 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to My Ads
          </Link>
        </main>
      </div>
    );
  }

  const imageUrls =
    car.images?.map((image) => image.image_url).filter(Boolean) ?? [];
  const hasImages = imageUrls.length > 0;

  const handlePrevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + imageUrls.length) % imageUrls.length,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header color="black" />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/mylistings"
          className="mb-6 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Ads
        </Link>

        <div className="mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">
                Listing details
              </p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900">
                {car.make} {car.model} {car.year}
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                {formatPrice(car.price)}
              </p>
            </div>
            <div className="space-y-2 text-right">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">
                {car.status ?? "Unknown status"}
              </span>
              <p className="text-sm text-slate-500">
                Updated {new Date(car.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Sale type: {car.sale_type.replace(/_/g, " ")}
          </p>
        </div>

        {hasImages ? (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl">
              <Image
                src={imageUrls[currentImageIndex]}
                alt={`${car.make} ${car.model} image ${currentImageIndex + 1}`}
                width={1200}
                height={720}
                className="h-[460px] w-full object-contain"
              />
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-slate-900 transition hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-slate-900 transition hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1">
              {imageUrls.map((src, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={`min-w-[100px] overflow-hidden rounded-3xl bg-slate-100 cursor-pointer transition ${
                    index === currentImageIndex ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${car.make} ${car.model} thumbnail ${index + 1}`}
                    width={180}
                    height={120}
                    className="h-24 w-24 object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10 grid gap-10">
          <section className="grid gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">Mileage</p>
                <p>{car.mileage?.toLocaleString()} km</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Fuel type</p>
                <p>{car.fuel_type}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Body type</p>
                <p>{car.body_type}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Drivetrain</p>
                <p>{car.drivetrain?.toUpperCase() ?? "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Condition</p>
                <p>{car.condition}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">VIN</p>
                <p>{car.vin || "Not provided"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Exterior color</p>
                <p>{car.exterior_color || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Interior color</p>
                <p>{car.interior_color || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Engine</p>
                <p>{car.engine || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Origin</p>
                <p>{car.origin || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Auction end</p>
                <p>
                  {car.auction_end
                    ? new Date(car.auction_end).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Posted by</p>
                <p>{car.seller?.name}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              Description
            </h2>
            <p className="text-slate-600 leading-7">
              {car.description ||
                "No additional description was provided for this listing."}
            </p>
          </section>

          {car.features?.length ? (
            <section className="grid gap-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                Features
              </h2>
              <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                {car.features.map((feature, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-slate-100 px-3 py-1"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="grid gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              Seller information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">Seller name</p>
                <p>{car.seller?.name}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Seller type</p>
                <p>{car.seller?.type}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Verified</p>
                <p>{car.seller?.is_verified ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Seller rating</p>
                <p>{car.seller_average_rating ?? "N/A"}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
