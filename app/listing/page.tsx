"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Search, Filter, LayoutGrid, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CarDetailModal } from "./CarDetailModal";
import FilterSidebar from "@/components/Filter";
import Car from "@/components/Car";
import { useCarsInfinite } from "@/hooks/cars";
import Slider from "@/components/Slider";

const carLogos = [
  { image: "/logo/byd.webp", title: "BYD" },
  { image: "/logo/hyundai.webp", title: "Hyundai" },
  { image: "/logo/Jetour_Logo.svg", title: "Jetour" },
  { image: "/logo/liffan.png", title: "Lifan" },
  { image: "/logo/suzuki.png", title: "Suzuki" },
  { image: "/logo/toyota.png", title: "Toyota" },
  { image: "/logo/vk.svg.png", title: "VK" },
  { image: "/logo/nissan.png", title: "Nissan" },
  { image: "/logo/ford.webp", title: "Ford" },
  { image: "/logo/audi.png", title: "Audi" },
  { image: "/logo/mist.png", title: "Mitsubishi" },
  { image: "/logo/bmw.png", title: "BMW" },
  { image: "/logo/infinity.png", title: "Infinity" },
  { image: "/logo/mercedes.webp", title: "Mercedes" },
  { image: "/logo/lexus.png", title: "Lexus" },
];

export default function CarMarketplace() {
  const [detailOpened, setDetailOpened] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useCarsInfinite();
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [filters, setFilters] = useState<any>({});
  const [showSuggest, setShowSuggest] = useState(false);
  const [sortBy, setSortBy] = useState<string>("best");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Flatten all pages into a single array
  const cars = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data]);

  // Intersection Observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observer.observe(element);
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  const normalized = (str: string) => str.toLowerCase();

  const filteredCars = useMemo(() => {
    const q = normalized(activeQuery);
    let filtered = (cars || []).filter((c) => {
      const matchesQuery = q
        ? [c.make, c.model, c.body_type, String(c.year)]
            .filter(Boolean)
            .map((s) => normalized(String(s)))
            .join(" ")
            .includes(q)
        : true;
      if (!matchesQuery) return false;
      if (
        filters.makeName &&
        normalized(c.make) !== normalized(filters.makeName)
      )
        return false;
      if (
        filters.modelName &&
        normalized(c.model) !== normalized(filters.modelName)
      )
        return false;
      if (filters.yearMin && c.year < filters.yearMin) return false;
      if (filters.yearMax && c.year > filters.yearMax) return false;
      if (filters.priceMin && c.price < filters.priceMin) return false;
      if (filters.priceMax && c.price > filters.priceMax) return false;
      // TODO: Add mileage filters when available in FetchedCar type
      // if (filters.mileageMin && c.mileage < filters.mileageMin) return false;
      // if (filters.mileageMax && c.mileage > filters.mileageMax) return false;
      return true;
    });

    // Apply sorting
    if (sortBy === "price-low") {
      filtered = [...filtered].sort(
        (a, b) => parseFloat(a.price) - parseFloat(b.price),
      );
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort(
        (a, b) => parseFloat(b.price) - parseFloat(a.price),
      );
    }

    return filtered;
  }, [cars, activeQuery, filters, sortBy]);

  const suggestions = useMemo(() => {
    const q = normalized(query).trim();
    if (!q) return [] as { label: string; value: string }[];
    const pool = new Map<string, string>();
    (cars || []).forEach((c) => {
      pool.set(`${c.make}`, c.make);
      pool.set(`${c.make} ${c.model}`, `${c.make} ${c.model}`);
      pool.set(`${c.model}`, c.model);
    });
    return Array.from(pool.values())
      .filter((label) => normalized(label).includes(q))
      .slice(0, 8)
      .map((label) => ({ label, value: label }));
  }, [cars, query]);

  // Reset to first page when filters/search/sort change
  useEffect(() => {
    // Note: With infinite scroll, we might want to refetch from page 1
    // For now, filtering happens client-side on all loaded pages
  }, [activeQuery, JSON.stringify(filters), sortBy, viewMode]);

  return (
    <div className="min-h-screen bg-background">
      <Header color="black" />

      <div className="pt-16 px-4 sm:px-6 lg:px-50">
        {/* Mobile Filter Button */}
        <div className="sm:hidden mb-4 flex justify-end">
          <Button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              initial={filters}
              onApply={(f) => setFilters(f)}
              onClear={() => setFilters({})}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6 pb-10">
            {/* Search and Sort */}
            <div className="sm:sticky top-0 bg-background z-10 sm:z-[100] pb-4">

              {/* Desktop: full search card */}
              <div className="hidden sm:block">
                <Card className="border-border rounded-3xl shadow-none py-4">
                  <CardContent className="flex flex-row flex-wrap justify-between items-center gap-4">
                    <div className="relative w-full sm:flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                      <Input
                        placeholder="Search by make, model, or body style"
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
                            const idx = s.label.toLowerCase().indexOf(query.toLowerCase());
                            const before = s.label.slice(0, idx);
                            const match = s.label.slice(idx, idx + query.length);
                            const after = s.label.slice(idx + query.length);
                            return (
                              <button
                                key={s.label}
                                className="w-full text-left px-4 py-3 hover:bg-primary/5 cursor-pointer transition-colors"
                                onClick={() => { setQuery(s.value); setActiveQuery(s.value); setShowSuggest(false); }}
                              >
                                <span className="text-foreground">
                                  {before}
                                  <span className="font-semibold text-primary underline decoration-primary">{match}</span>
                                  {after}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row border-l border-border pl-4 items-center gap-4">
                      <div className="flex flex-row items-center gap-4">
                        <p className="font-bold text-xs uppercase text-foreground">Sort By</p>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-32 text-center border-none shadow-none focus:ring-0">
                            <SelectValue placeholder="Best match" />
                          </SelectTrigger>
                          <SelectContent className="z-[300]">
                            <SelectItem value="best">Best match</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="rounded-full cursor-pointer!" onClick={() => setViewMode("grid")} aria-label="Grid view">
                          <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="rounded-full cursor-pointer!" onClick={() => setViewMode("list")} aria-label="List view">
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
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
                    {mobileSearchOpen ? <X className="h-4 w-4 text-muted-foreground" /> : <Search className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1 h-9 text-xs border-border rounded-full px-3">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="z-[200]">
                      <SelectItem value="best">Best match</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="rounded-full shrink-0" onClick={() => setViewMode("grid")} aria-label="Grid view">
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="rounded-full shrink-0" onClick={() => setViewMode("list")} aria-label="List view">
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                {mobileSearchOpen && (
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      autoFocus
                      placeholder="Search by make, model, or body style"
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
                          const idx = s.label.toLowerCase().indexOf(query.toLowerCase());
                          const before = s.label.slice(0, idx);
                          const match = s.label.slice(idx, idx + query.length);
                          const after = s.label.slice(idx + query.length);
                          return (
                            <button
                              key={s.label}
                              className="w-full text-left px-4 py-3 hover:bg-primary/5 cursor-pointer transition-colors"
                              onClick={() => { setQuery(s.value); setActiveQuery(s.value); setShowSuggest(false); setMobileSearchOpen(false); }}
                            >
                              <span className="text-foreground text-sm">
                                {before}
                                <span className="font-semibold text-primary underline decoration-primary">{match}</span>
                                {after}
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

            {/* Results Count */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-[#4a4a4a]">
                  {activeQuery ? (
                    <span className="flex items-center gap-1 mb-5">
                      Results for "
                      <span className="text-primary font-bold">{activeQuery}</span>
                      "
                    </span>
                  ) : filteredCars.length === 0 ? (
                    "Showing 0 entries"
                  ) : (
                    `Showing ${filteredCars.length} ${filteredCars.length === 1 ? "vehicle" : "vehicles"}`
                  )}
                </p>
                {activeQuery && (
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#4a4a4a]">
                    {filteredCars.length === 0
                      ? "Showing 0 entries"
                      : `Showing ${filteredCars.length} ${filteredCars.length === 1 ? "vehicle" : "vehicles"}`}
                  </p>
                )}
              </div>
              {activeQuery && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveQuery("");
                    setQuery("");
                  }}
                  className="gap-2 self-start sm:self-auto cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  Clear Search
                </Button>
              )}
            </div>

            {/* Car Listings */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                  : "space-y-4"
              }
            >
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-muted rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-primary/10 h-40 rounded-lg"></div>
                        <div className="md:col-span-2 space-y-2">
                          <div className="h-6 bg-primary/10 rounded w-3/4"></div>
                          <div className="h-4 bg-primary/10 rounded w-1/2"></div>
                          <div className="h-4 bg-primary/10 rounded w-1/3"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-6 bg-primary/10 rounded w-1/2 ml-auto"></div>
                          <div className="h-4 bg-primary/10 rounded w-1/3 ml-auto"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredCars && filteredCars.length > 0 ? (
                <>
                  {filteredCars.map((car) => (
                    <Car
                      setDetailOpened={(status) => {
                        setDetailOpened(status);
                        if (status) {
                          setSelectedCar(car);
                        }
                      }}
                      car={car}
                      key={car.id}
                      highlightQuery={activeQuery}
                      variant={viewMode}
                    />
                  ))}
                  {/* Infinite scroll trigger */}
                  <div ref={observerTarget} className="h-10" />
                  {isFetchingNextPage && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Loading more cars...
                      </p>
                    </div>
                  )}
                  {!hasNextPage && filteredCars.length > 0 && (
                    <div
                      className={`${
                        viewMode === "grid" ? "col-span-full" : "w-full"
                      } flex flex-col items-center justify-center py-12 px-4`}
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <svg
                          className="w-8 h-8 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-foreground font-medium text-lg mb-1">
                        You've reached the end
                      </p>
                      <p className="text-muted-foreground text-sm">
                        All available vehicles have been loaded
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No cars found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 py-16">
        <Slider items={carLogos} />
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Filter Panel */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
          <div className="bg-background w-3/4 max-w-xs p-4 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-foreground">Filters</h2>
              <Button variant="ghost" onClick={() => setFilterOpen(false)}>
                Close
              </Button>
            </div>
            <FilterSidebar
              close={() => setFilterOpen(false)}
              initial={filters}
              onApply={(f) => {
                setFilters(f);
                setFilterOpen(false);
              }}
              onClear={() => {
                setFilters({});
              }}
            />
          </div>
        </div>
      )}

      {detailOpened && selectedCar && (
        <CarDetailModal
          isOpen={detailOpened}
          carId={String(selectedCar.id)}
          onClose={() => {
            setDetailOpened(false);
            setSelectedCar(null);
          }}
        />
      )}
    </div>
  );
}
