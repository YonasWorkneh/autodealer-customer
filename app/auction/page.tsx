"use client";

import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCars } from "@/hooks/cars";
import { useMemo, useState, useEffect } from "react";
import type { FetchedCar } from "@/app/types/Car";
import Pagination from "@/components/Pagination";
import FilterSidebar from "@/components/Filter";

// Utility function to calculate time remaining
const calculateTimeLeft = (endDate: string | null): string => {
  if (!endDate) return "N/A";
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}d ${hours}hrs`;
  }
  return `${hours}hrs`;
};

// Utility function to format end time
const formatEndTime = (endDate: string | null): string => {
  if (!endDate) return "N/A";
  const end = new Date(endDate);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = days[end.getDay()];
  const hours = end.getHours();
  const minutes = end.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${dayName}, ${displayHours}:${displayMinutes}${ampm}`;
};

// Utility function to get highest bid
const getHighestBid = (bids: any[]): number => {
  if (!bids || bids.length === 0) return 0;
  return Math.max(
    ...bids.map((bid) => parseFloat(bid.amount || bid.price || "0"))
  );
};

// Utility function to format car details
const formatCarDetails = (car: FetchedCar): string => {
  const parts = [];
  if (car.mileage) parts.push(`${car.mileage.toLocaleString()} Miles`);
  if (car.exterior_color) parts.push(car.exterior_color);
  if (car.drivetrain) parts.push(car.drivetrain.toUpperCase());
  if (car.engine) parts.push(car.engine);
  return parts.join(" • ");
};

// Utility function to get brand initial and color
const getBrandInfo = (make: string) => {
  const initial = make.charAt(0).toUpperCase();
  const colors = [
    "bg-blue-600",
    "bg-gray-800",
    "bg-red-600",
    "bg-green-600",
    "bg-purple-600",
    "bg-indigo-600",
  ];
  const colorIndex = make.length % colors.length;
  return { initial, color: colors[colorIndex] };
};

const AuctionListView = () => {
  const router = useRouter();
  const { data: cars, isLoading } = useCars();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [filters, setFilters] = useState<any>({});
  const [showSuggest, setShowSuggest] = useState(false);
  const [sortBy, setSortBy] = useState<string>("best");
  const [filterOpen, setFilterOpen] = useState(false);
  const itemsPerPage = 10;

  const normalized = (str: string) => str.toLowerCase();

  // Filter cars with sale_type === "auction"
  const auctionCars = useMemo(() => {
    if (!cars) return [];
    return cars.filter((car) => car.sale_type === "auction");
  }, [cars]);

  // Transform cars to auction display format
  const allAuctions = useMemo(() => {
    return auctionCars.map((car) => {
      const brandInfo = getBrandInfo(car.make);
      const highestBid = getHighestBid(car.bids || []);
      const currentBid = highestBid > 0 ? highestBid : parseFloat(car.price);

      // Sort images so featured image comes first
      const sortedImages = car.images
        ? [...car.images].sort((a, b) => {
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
            return 0;
          })
        : [];

      return {
        id: car.id,
        title: `${car.year} ${car.make} ${car.model}${
          car.trim ? ` ${car.trim}` : ""
        }`,
        location: "Location TBD", // You may want to add location to the car data
        auctionNumber: `#${car.id.toString().padStart(8, "0")}`,
        details: formatCarDetails(car),
        timeLeft: calculateTimeLeft(car.auction_end),
        endTime: formatEndTime(car.auction_end),
        activeBids: car.bids?.length || 0,
        currentBid: `$${currentBid.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
        currentBidValue: currentBid,
        images:
          sortedImages.length > 0
            ? sortedImages.map((img) => img.image_url)
            : ["/placeholder.svg"],
        brand: brandInfo.initial,
        brandColor: brandInfo.color,
        car: car, // Keep reference to original car data
      };
    });
  }, [auctionCars]);

  // Apply search and filters
  const filteredAuctions = useMemo(() => {
    const q = normalized(activeQuery);
    let filtered = allAuctions.filter((auction) => {
      const car = auction.car;

      // Search filter
      const matchesQuery = q
        ? [car.make, car.model, car.body_type, String(car.year), auction.title]
            .filter(Boolean)
            .map((s) => normalized(String(s)))
            .some((s) => s.includes(q))
        : true;
      if (!matchesQuery) return false;

      // Make filter
      if (
        filters.makeName &&
        normalized(car.make) !== normalized(filters.makeName)
      )
        return false;

      // Model filter
      if (
        filters.modelName &&
        normalized(car.model) !== normalized(filters.modelName)
      )
        return false;

      // Year filters
      if (filters.yearMin && car.year < filters.yearMin) return false;
      if (filters.yearMax && car.year > filters.yearMax) return false;

      // Price filters (using current bid value)
      if (filters.priceMin && auction.currentBidValue < filters.priceMin)
        return false;
      if (filters.priceMax && auction.currentBidValue > filters.priceMax)
        return false;

      // Mileage filters
      if (filters.mileageMin && car.mileage < filters.mileageMin) return false;
      if (filters.mileageMax && car.mileage > filters.mileageMax) return false;

      return true;
    });

    // Apply sorting
    if (sortBy === "price-low") {
      filtered = [...filtered].sort(
        (a, b) => a.currentBidValue - b.currentBidValue
      );
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort(
        (a, b) => b.currentBidValue - a.currentBidValue
      );
    } else if (sortBy === "time-left") {
      // Sort by time remaining (ending soonest first)
      filtered = [...filtered].sort((a, b) => {
        const aEnd = a.car.auction_end
          ? new Date(a.car.auction_end).getTime()
          : 0;
        const bEnd = b.car.auction_end
          ? new Date(b.car.auction_end).getTime()
          : 0;
        return aEnd - bEnd;
      });
    } else if (sortBy === "bids-high") {
      filtered = [...filtered].sort((a, b) => b.activeBids - a.activeBids);
    }

    return filtered;
  }, [allAuctions, activeQuery, filters, sortBy]);

  // Search suggestions
  const suggestions = useMemo(() => {
    const q = normalized(query).trim();
    if (!q) return [] as { label: string; value: string }[];
    const pool = new Map<string, string>();
    auctionCars.forEach((car) => {
      pool.set(`${car.make}`, car.make);
      pool.set(`${car.make} ${car.model}`, `${car.make} ${car.model}`);
      pool.set(`${car.model}`, car.model);
    });
    return Array.from(pool.values())
      .filter((label) => normalized(label).includes(q))
      .slice(0, 8)
      .map((label) => ({ label, value: label }));
  }, [auctionCars, query]);

  // Reset to page 1 when filters/search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeQuery, JSON.stringify(filters), sortBy]);

  // Calculate pagination
  const totalAuctions = filteredAuctions.length;
  const totalPages = Math.max(1, Math.ceil(totalAuctions / itemsPerPage));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex =
    totalAuctions === 0 ? 0 : (currentPageSafe - 1) * itemsPerPage;
  const endIndex =
    totalAuctions === 0
      ? 0
      : Math.min(startIndex + itemsPerPage, totalAuctions);
  const paginatedAuctions = filteredAuctions.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    const next = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <Header color="black" />

      <div className="space-y-4 px-6 md:px-50 py-10">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Live Car Auctions
        </h2>
        <p className="my-6 md:my-10 text-black/60 text-sm md:text-base">
          Discover exclusive vehicles and place your bids in real-time. Compete
          with other buyers, track bidding activity, and secure your dream car
          at the best price.
        </p>

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
            <div className="sticky top-0 bg-white z-[100] pb-4">
              <Card className="border-gray-200 rounded-3xl shadow-none py-4">
                <CardContent className="flex flex-col sm:flex-row flex-wrap justify-between items-center gap-4">
                  <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search by make, model, or body style"
                      className="pl-10 h-12 text-lg border-none shadow-none focus:ring-0 focus:outline-none w-full focus-visible:ring-0"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggest(true);
                      }}
                      onFocus={() => setShowSuggest(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setActiveQuery(query.trim());
                          setShowSuggest(false);
                        }
                      }}
                    />
                    {showSuggest && suggestions.length > 0 && (
                      <div className="absolute mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[200] max-h-80 overflow-auto">
                        {suggestions.map((s) => {
                          const idx = s.label
                            .toLowerCase()
                            .indexOf(query.toLowerCase());
                          const before = s.label.slice(0, idx);
                          const match = s.label.slice(idx, idx + query.length);
                          const after = s.label.slice(idx + query.length);
                          return (
                            <button
                              key={s.label}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                setQuery(s.value);
                                setActiveQuery(s.value);
                                setShowSuggest(false);
                              }}
                            >
                              <span className="text-gray-900">
                                {before}
                                <span className="font-semibold underline">
                                  {match}
                                </span>
                                {after}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row border-t sm:border-t-0 sm:border-l border-gray-200 py-4 sm:py-0 pl-0 sm:pl-4 justify-center items-center gap-4 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                      <p className="font-bold text-xs text-center uppercase">
                        Sort By
                      </p>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-40 text-center border-none shadow-none focus:ring-0">
                          <SelectValue placeholder="Best match" />
                        </SelectTrigger>
                        <SelectContent className="z-[300]">
                          <SelectItem value="best">Best match</SelectItem>
                          <SelectItem value="price-low">
                            Price: Low to High
                          </SelectItem>
                          <SelectItem value="price-high">
                            Price: High to Low
                          </SelectItem>
                          <SelectItem value="time-left">
                            Ending Soonest
                          </SelectItem>
                          <SelectItem value="bids-high">Most Bids</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, index) => (
                  <Card
                    key={index}
                    className="shadow-none bg-white border-gray-200 overflow-hidden h-full flex flex-col p-0 rounded-xl"
                  >
                    <div className="relative h-48 bg-gray-100">
                      <Skeleton className="w-full h-full" />
                    </div>
                    <div className="p-4 flex flex-col gap-4 flex-1">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Skeleton className="w-6 h-6 rounded-full" />
                            <Skeleton className="w-20 h-4" />
                         </div>
                         <Skeleton className="w-16 h-5" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-auto">
                        <div className="space-y-1">
                           <Skeleton className="h-5 w-16" />
                           <Skeleton className="h-3 w-10" />
                        </div>
                         <div className="space-y-1">
                           <Skeleton className="h-5 w-16" />
                           <Skeleton className="h-3 w-10" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredAuctions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No auctions found matching your criteria
                </p>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#4a4a4a]">
                    {totalAuctions === 0
                      ? "Showing 0 entries"
                      : `Showing ${
                          startIndex + 1
                        } - ${endIndex} entries of ${totalAuctions}`}
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedAuctions.map((auction) => (
                    <Card
                      key={auction.id}
                      className="group shadow-sm hover:shadow-lg transition-all duration-300 bg-white border-gray-200 overflow-hidden cursor-pointer flex flex-col h-full rounded-xl p-0 gap-0"
                      onClick={() => router.push(`/auction/${auction.id}`)}
                    >
                      {/* Car Image - Full Width Top */}
                      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                        <Image
                          src={auction.images[0] || "/placeholder.svg"}
                          alt={auction.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute top-3 right-3">
                           <Badge
                            variant="secondary"
                            className="bg-white/90 backdrop-blur-sm shadow-sm text-gray-900 font-medium hover:bg-white"
                          >
                            {auction.auctionNumber}
                          </Badge>
                        </div>
                         <div className="absolute bottom-3 left-3 flex items-center gap-2">
                             <div
                                className={`w-6 h-6 ${auction.brandColor} rounded-full flex items-center justify-center shadow-sm`}
                              >
                                <span className="text-white text-[10px] font-bold">
                                  {auction.brand}
                                </span>
                              </div>
                              <span className="text-white text-xs font-medium drop-shadow-md bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-[2px]">
                                {auction.location}
                              </span>
                         </div>
                      </div>

                      <div className="p-4 flex flex-col gap-4 flex-1">
                        {/* Title & Details */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {auction.title}
                          </h3>
                          <p className="text-gray-500 text-sm line-clamp-1 mt-1">
                            {auction.details}
                          </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-auto pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Time Left</p>
                            <p className="text-sm font-bold text-gray-900">{auction.timeLeft}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Current Bid</p>
                            <p className="text-sm font-bold text-blue-600">{auction.currentBid}</p>
                          </div>
                           <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active Bids</p>
                            <p className="text-sm font-bold text-gray-900">{auction.activeBids}</p>
                          </div>
                           <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Ends on</p>
                            <p className="text-sm font-bold text-gray-900 truncate">{auction.endTime.split(',')[0]}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center border-t border-gray-200 pt-6 mt-6">
                    <Pagination
                      currentPage={currentPageSafe}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filter Panel */}
        {filterOpen && (
          <div className="fixed inset-0 bg-black/30 z-50 flex justify-end lg:hidden">
            <div className="bg-white w-3/4 max-w-xs p-4 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Filters</h2>
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
      </div>
    </div>
  );
};

export default AuctionListView;
