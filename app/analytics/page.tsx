"use client";

import Header from "@/components/Header";
import { useBuyerAnalytics } from "@/hooks/analytics";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

type CheapestCar = {
  id: number;
  price: number;
  image_url: string;
};

type CarSummaryItem = {
  car_make: string;
  car_model: string;
  average_price: number;
  total_cars: number;
  cheapest_car: CheapestCar;
};

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useBuyerAnalytics();

  useEffect(() => {
    if (data) {
      console.log("buyer-analytics response:", data);
    }
  }, [data]);

  const summary: CarSummaryItem[] = data?.car_summary ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Header color="black" />

      <div className="px-6 sm:px-40 lg:px-50 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Market insights of the available cars.
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-xl shadow-none">
                <Skeleton className="w-full h-44" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <BarChart2 className="w-12 h-12 opacity-30" />
            <p className="text-sm">Failed to load analytics. Check the console for details.</p>
          </div>
        )}

        {!isLoading && !isError && summary.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <BarChart2 className="w-12 h-12 opacity-30" />
            <p className="text-sm">No analytics data available yet.</p>
          </div>
        )}

        {!isLoading && !isError && summary.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
              {summary.length} {summary.length === 1 ? "result" : "results"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {summary.map((item) => (
                <Card
                  key={`${item.car_make}-${item.car_model}`}
                  className="overflow-hidden rounded-xl shadow-none border border-border gap-0 p-0"
                >
                  {/* Cheapest car image */}
                  <div className="relative w-full h-44 bg-muted">
                    {item.cheapest_car?.image_url ? (
                      <Image
                        src={item.cheapest_car.image_url}
                        alt={`${item.car_make} ${item.car_model}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No Image
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-3">
                    {/* Make + Model */}
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {item.car_make} {item.car_model}
                      </h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">
                        {item.total_cars} {item.total_cars === 1 ? "listing" : "listings"}
                      </p>
                    </div>

                    {/* Prices */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Avg. Price
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {formatPrice(String(item.average_price))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Cheapest
                        </p>
                        <p className="text-sm font-semibold text-primary">
                          {formatPrice(String(item.cheapest_car?.price ?? 0))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
