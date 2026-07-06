"use client";

import Header from "@/components/Header";
import { useBuyerAnalytics } from "@/hooks/analytics";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2, Filter, Search, X } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMakes, useModels } from "@/hooks/cars";

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

type AnalyticsFilters = {
  makeId?: number;
  makeName?: string;
  modelName?: string;
  priceMin?: number;
  priceMax?: number;
};

function AnalyticsFilterPanel({
  filters,
  onChange,
  onClear,
  close,
}: {
  filters: AnalyticsFilters;
  onChange: (f: AnalyticsFilters) => void;
  onClear: () => void;
  close?: () => void;
}) {
  const { data: makes, isLoading: isMakesLoading } = useMakes();
  const { data: models, isLoading: isModelsLoading } = useModels(filters.makeId);

  const modelList = models?.filter(
    (m: any) => m.make?.id === filters.makeId || m.make_id === filters.makeId,
  );

  return (
    <Card className="mb-6 sticky top-0 bg-white z-40 shadow-none">
      <CardContent className="p-4 sm:p-6 space-y-6">
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-100 hover:bg-gray-200 w-full py-6 cursor-pointer"
          onClick={() => { onClear(); close?.(); }}
        >
          Clear filters
        </Button>

        {/* Make & Model */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-3">Make & Model</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={filters.makeId?.toString() ?? ""}
              onValueChange={(val) => {
                const make = makes?.find((m: any) => m.id === +val);
                onChange({ ...filters, makeId: +val, makeName: make?.name, modelName: undefined });
              }}
            >
              <SelectTrigger className="border-gray-300 w-full !h-[50px] !rounded-sm">
                <SelectValue placeholder="Make" />
              </SelectTrigger>
              <SelectContent>
                {isMakesLoading ? (
                  <SelectItem value="loading" disabled>loading...</SelectItem>
                ) : (
                  makes?.map((m: any) => (
                    <SelectItem value={`${m.id}`} key={m.id}>{m.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Select
              disabled={!filters.makeId}
              value={filters.modelName ?? ""}
              onValueChange={(val) => onChange({ ...filters, modelName: val })}
            >
              <SelectTrigger className="border-gray-300 w-full !h-[50px] !rounded-sm">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                {isModelsLoading ? (
                  <SelectItem value="loading" disabled>loading...</SelectItem>
                ) : (
                  modelList?.map((m: any) => (
                    <SelectItem value={m.name} key={m.id}>{m.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Avg Price Range */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-3">Avg. Price</h3>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              placeholder="$0"
              className="text-sm border-gray-300 h-[50px] rounded-sm w-full sm:flex-1"
              value={filters.priceMin?.toString() ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  priceMin: e.target.value ? parseInt(e.target.value.replace(/\D/g, "")) : undefined,
                })
              }
            />
            <span className="text-gray-500">to</span>
            <Input
              placeholder="$100,000+"
              className="text-sm border-gray-300 h-[50px] rounded-sm w-full sm:flex-1"
              value={filters.priceMax?.toString() ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  priceMax: e.target.value ? parseInt(e.target.value.replace(/\D/g, "")) : undefined,
                })
              }
            />
          </div>
        </div>

        {close && (
          <Button
            size="sm"
            className="w-full py-6 cursor-pointer"
            onClick={close}
          >
            Apply Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useBuyerAnalytics();

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [sortBy, setSortBy] = useState("best");
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    if (data) console.log("buyer-analytics response:", data);
  }, [data]);

  const summary: CarSummaryItem[] = data?.car_summary ?? [];

  const hasActiveFilters =
    !!filters.makeId || !!filters.modelName || filters.priceMin != null || filters.priceMax != null;

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as string[];
    const pool = new Set<string>();
    summary.forEach((item) => {
      pool.add(item.car_make);
      pool.add(`${item.car_make} ${item.car_model}`);
    });
    return Array.from(pool)
      .filter((label) => label.toLowerCase().includes(q))
      .slice(0, 8);
  }, [summary, query]);

  const filtered = useMemo(() => {
    const q = activeQuery.trim().toLowerCase();
    let result = summary.filter((item) => {
      if (
        q &&
        !item.car_make.toLowerCase().includes(q) &&
        !item.car_model.toLowerCase().includes(q) &&
        !`${item.car_make} ${item.car_model}`.toLowerCase().includes(q)
      )
        return false;
      if (
        filters.makeName &&
        item.car_make.toLowerCase() !== filters.makeName.toLowerCase()
      )
        return false;
      if (
        filters.modelName &&
        item.car_model.toLowerCase() !== filters.modelName.toLowerCase()
      )
        return false;
      if (filters.priceMin != null && item.average_price < filters.priceMin)
        return false;
      if (filters.priceMax != null && item.average_price > filters.priceMax)
        return false;
      return true;
    });

    if (sortBy === "price-low")
      result = [...result].sort((a, b) => a.average_price - b.average_price);
    else if (sortBy === "price-high")
      result = [...result].sort((a, b) => b.average_price - a.average_price);
    else if (sortBy === "listings")
      result = [...result].sort((a, b) => b.total_cars - a.total_cars);

    return result;
  }, [summary, activeQuery, filters, sortBy]);

  const highlightMatch = (text: string) => {
    const q = activeQuery.trim();
    if (!q) return <>{text}</>;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, i)}
        <span className="font-semibold underline">{text.slice(i, i + q.length)}</span>
        {text.slice(i + q.length)}
      </>
    );
  };

  const cards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {filtered.map((item) => (
        <Card
          key={`${item.car_make}-${item.car_model}`}
          className="overflow-hidden rounded-xl shadow-none border border-border gap-0 p-0"
        >
          <div className="relative w-full h-44 bg-muted">
            {item.cheapest_car?.image_url ? (
              <Image
                src={item.cheapest_car.image_url}
                alt={`${item.car_make} ${item.car_model}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No Image
              </div>
            )}
          </div>

          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {highlightMatch(`${item.car_make} ${item.car_model}`)}
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">
                {item.total_cars} {item.total_cars === 1 ? "listing" : "listings"}
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg. Price</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatPrice(String(item.average_price))}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Cheapest</p>
                <p className="text-sm font-semibold text-primary">
                  {formatPrice(String(item.cheapest_car?.price ?? 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header color="black" />

      <div className="pt-10 px-4 sm:px-6 lg:px-50 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Market insights of the available cars.
          </p>
        </div>

        {/* Mobile filter button */}
        <div className="lg:hidden mb-4 flex justify-end gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={() => setFilters({})}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
          <Button onClick={() => setFilterOpen(true)} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-0.5 bg-white text-primary rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold leading-none">
                •
              </span>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <AnalyticsFilterPanel
              filters={filters}
              onChange={setFilters}
              onClear={() => setFilters({})}
            />
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search + Sort toolbar */}
            <div className="sticky top-0 bg-background z-10 pb-4">
              {/* Desktop */}
              <div className="hidden sm:block">
                <Card className="border-border rounded-3xl shadow-none py-4">
                  <CardContent className="flex flex-row flex-wrap justify-between items-center gap-4">
                    <div className="relative w-full sm:flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        placeholder="Search by make or model"
                        className="pl-10 h-12 text-lg border-none shadow-none focus:ring-0 focus:outline-none w-full focus-visible:ring-0"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); }}
                        onFocus={() => setShowSuggest(true)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { setActiveQuery(query.trim()); setShowSuggest(false); }
                        }}
                      />
                      {showSuggest && suggestions.length > 0 && (
                        <div className="absolute mt-2 left-0 right-0 bg-background border border-border rounded-lg shadow-lg z-[200] max-h-80 overflow-auto">
                          {suggestions.map((s) => {
                            const i = s.toLowerCase().indexOf(query.toLowerCase());
                            return (
                              <button
                                key={s}
                                className="w-full text-left px-4 py-3 hover:bg-primary/5 cursor-pointer transition-colors text-sm"
                                onClick={() => { setQuery(s); setActiveQuery(s); setShowSuggest(false); }}
                              >
                                {s.slice(0, i)}
                                <span className="font-semibold text-primary underline decoration-primary">
                                  {s.slice(i, i + query.length)}
                                </span>
                                {s.slice(i + query.length)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 border-l border-border pl-4">
                      <p className="font-bold text-xs uppercase text-foreground">Sort By</p>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-44 text-center border-none shadow-none focus:ring-0">
                          <SelectValue placeholder="Best match" />
                        </SelectTrigger>
                        <SelectContent className="z-[300]">
                          <SelectItem value="best">Best match</SelectItem>
                          <SelectItem value="price-low">Avg Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Avg Price: High to Low</SelectItem>
                          <SelectItem value="listings">Most Listings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile: compact toolbar */}
              <div className="sm:hidden">
                <div className="flex items-center gap-2 py-1">
                  <button
                    onClick={() => { setMobileSearchOpen((o) => !o); setShowSuggest(false); }}
                    className="p-2 rounded-full border border-border bg-background shrink-0"
                    aria-label="Toggle search"
                  >
                    {mobileSearchOpen ? (
                      <X className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Search className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1 h-9 text-xs border-border rounded-full px-3">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="z-[200]">
                      <SelectItem value="best">Best match</SelectItem>
                      <SelectItem value="price-low">Avg Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Avg Price: High to Low</SelectItem>
                      <SelectItem value="listings">Most Listings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {mobileSearchOpen && (
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      autoFocus
                      placeholder="Search by make or model"
                      className="w-[90%] pl-9 h-10 border-border rounded-xl text-sm focus-visible:ring-0"
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); }}
                      onFocus={() => setShowSuggest(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { setActiveQuery(query.trim()); setShowSuggest(false); }
                      }}
                    />
                    {showSuggest && suggestions.length > 0 && (
                      <div className="absolute mt-1 left-0 right-0 bg-background border border-border rounded-lg shadow-lg z-[200] max-h-64 overflow-auto">
                        {suggestions.map((s) => {
                          const i = s.toLowerCase().indexOf(query.toLowerCase());
                          return (
                            <button
                              key={s}
                              className="w-full text-left px-4 py-3 hover:bg-primary/5 cursor-pointer transition-colors"
                              onClick={() => {
                                setQuery(s);
                                setActiveQuery(s);
                                setShowSuggest(false);
                                setMobileSearchOpen(false);
                              }}
                            >
                              <span className="text-foreground text-sm">
                                {s.slice(0, i)}
                                <span className="font-semibold text-primary underline decoration-primary">
                                  {s.slice(i, i + query.length)}
                                </span>
                                {s.slice(i + query.length)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    {activeQuery && (
                      <p className="text-sm uppercase tracking-[0.25em] text-[#4a4a4a] mb-1">
                        Results for "<span className="text-primary font-bold">{activeQuery}</span>"
                      </p>
                    )}
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      {filtered.length === 0
                        ? "Showing 0 results"
                        : `Showing ${filtered.length} ${filtered.length === 1 ? "result" : "results"}`}
                    </p>
                  </div>
                  {activeQuery && (
                    <Button
                      variant="outline"
                      onClick={() => { setActiveQuery(""); setQuery(""); }}
                      className="gap-2 self-start sm:self-auto cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      Clear Search
                    </Button>
                  )}
                </div>

                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                    <BarChart2 className="w-12 h-12 opacity-30" />
                    <p className="text-sm">No results match your search or filters.</p>
                  </div>
                ) : cards}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          filterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex-1 bg-black/30" onClick={() => setFilterOpen(false)} />
        <div
          className={`bg-background w-3/4 max-w-xs p-4 h-full overflow-y-auto shadow-xl transition-transform duration-300 ${
            filterOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-foreground">Filters</h2>
            <Button variant="ghost" onClick={() => setFilterOpen(false)}>Close</Button>
          </div>
          <AnalyticsFilterPanel
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters({})}
            close={() => setFilterOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
