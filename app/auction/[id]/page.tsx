"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { useCar, usePlaceBid, useBidHistory } from "@/hooks/cars";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/store/user";
import type { FetchedCar } from "@/app/types/Car";

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

const formatTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
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

const AuctionDetailView = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useUserStore();
  const { toast } = useToast();
  const { data: car, isLoading, error, refetch, isRefetching } = useCar(id);
  const [bidAmount, setBidAmount] = useState<string>("");

  // Transform car data to auction display format
  const auction = useMemo(() => {
    if (!car) return null;

    // Check if car is an auction (case-insensitive)
    const saleType = car.sale_type?.toLowerCase();
    if (saleType !== "auction") return null;

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
      car: car,
    };
  }, [car]);

  const [mainImage, setMainImage] = useState("/placeholder.svg");

  // Update main image when auction data loads
  useEffect(() => {
    if (auction?.images && auction.images.length > 0) {
      setMainImage(auction.images[0]);
    }
  }, [auction]);

  useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error]);

  // Place bid handlers
  const onBidSuccess = () => {
    toast({
      title: "Success",
      description: "Your bid has been placed successfully.",
      variant: "success",
    });
    setBidAmount("");
    refetch(); // Refresh auction data to show updated bids
  };

  const onBidError = (error: Error) => {
    toast({
      title: "❌ Failed to Place Bid",
      description:
        error.message || "Something went wrong while placing your bid.",
      variant: "destructive",
    });
  };

  const { mutate: placeBidMutation, isPending: isPlacingBid } = usePlaceBid(
    onBidSuccess,
    onBidError
  );

  const { data: bidHistory = [], isLoading: isBidHistoryLoading } = useBidHistory(id);

  const handlePlaceBid = () => {
    if (!user.email) {
      toast({
        title: "❌ Login Required",
        description: "Please log in to place a bid.",
        variant: "destructive",
      });
      return;
    }

    if (!auction) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "❌ Invalid Bid Amount",
        description: "Please enter a valid bid amount.",
        variant: "destructive",
      });
      return;
    }

    // Validate bid is not below current bid
    if (amount < auction.currentBidValue) {
      toast({
        title: "❌ Bid Below Minimum",
        description: `Minimum bid is ${auction.currentBid}`,
        variant: "destructive",
      });
      return;
    }

    placeBidMutation({
      car: auction.car.id,
      amount: amount,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <Header color="black" />
        <div className="px-4 sm:px-6 md:px-20 lg:px-40 py-8 sm:py-10">
          {/* Back Button Skeleton */}
          <div className="mb-6 flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Images Skeleton */}
            <div className="flex-1 space-y-4">
              <Skeleton className="w-full aspect-[4/3] rounded-lg" />
              {/* Thumbnail Gallery Skeleton */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex-shrink-0"
                  />
                ))}
              </div>
            </div>

            {/* Right Column - Details Skeleton */}
            <div className="flex-1 space-y-6">
              {/* Title Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>

              {/* Auction Stats Skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>

              {/* Vehicle Details Skeleton */}
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between py-2 border-b border-gray-200"
                  >
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>

              {/* Bid Section Skeleton */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Skeleton className="flex-1 h-12 sm:h-16 rounded-md" />
                  <Skeleton className="w-full sm:w-32 h-12 sm:h-16 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-20 w-full rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <Header color="black" />
        <div className="px-4 sm:px-6 md:px-20 lg:px-40 py-8 sm:py-10">
          <Button
            variant="ghost"
            onClick={() => router.push("/auction")}
            className="mb-6 text-gray-600 hover:text-gray-900 bg-gray-100 cursor-pointer hover:bg-gray-200 px-3 py-2 rounded-md flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to auctions
          </Button>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Error loading auction</p>
            <p className="text-gray-400 text-sm mt-2">Please try again later</p>
            <Button
              variant="ghost"
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
              className="mt-6 bg-primary text-primary-foreground hover:bg-primary-hover cursor-pointer px-4 py-2 rounded-md flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              title="Retry loading auction"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
              />
              {isRefetching ? "Retrying..." : "Retry"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where car exists but is not an auction
  if (car && !auction) {
    return (
      <div className="bg-white min-h-screen">
        <Header color="black" />
        <div className="px-4 sm:px-6 md:px-20 lg:px-40 py-8 sm:py-10">
          <Button
            variant="ghost"
            onClick={() => router.push("/auction")}
            className="mb-6 text-gray-600 hover:text-gray-900 bg-gray-100 cursor-pointer hover:bg-gray-200 px-3 py-2 rounded-md flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to auctions
          </Button>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              This is not an auction listing
            </p>
            <p className="text-gray-400 text-sm mt-2">
              This car is listed as a fixed price sale
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where car is not found
  if (!car && !isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <Header color="black" />
        <div className="px-4 sm:px-6 md:px-20 lg:px-40 py-8 sm:py-10">
          <Button
            variant="ghost"
            onClick={() => router.push("/auction")}
            className="mb-6 text-gray-600 hover:text-gray-900 bg-gray-100 cursor-pointer hover:bg-gray-200 px-3 py-2 rounded-md flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to auctions
          </Button>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Auction not found</p>
            <p className="text-gray-400 text-sm mt-2">
              The auction you're looking for doesn't exist
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Safety check - if auction is still null at this point, show error
  if (!auction) {
    return (
      <div className="bg-white min-h-screen">
        <Header color="black" />
        <div className="px-4 sm:px-6 md:px-20 lg:px-40 py-8 sm:py-10">
          <Button
            variant="ghost"
            onClick={() => router.push("/auction")}
            className="mb-6 text-gray-600 hover:text-gray-900 bg-gray-100 cursor-pointer hover:bg-gray-200 px-3 py-2 rounded-md flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to auctions
          </Button>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Unable to load auction</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <Header color="black" />

      <div className="px-4 sm:px-6 md:px-20 lg:px-40 py-8 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/auction")}
            className="text-gray-600 hover:text-gray-900 bg-gray-100 cursor-pointer hover:bg-gray-200 px-3 py-2 rounded-md flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to auctions
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Images */}
          <div className="flex-1 space-y-4">
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={mainImage}
                alt={auction.title}
                width={600}
                height={450}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {auction.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setMainImage(img)}
                  className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden cursor-pointer ${
                    mainImage === img ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Car view ${i + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="flex-1 space-y-6">
            {/* Car Title */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {auction.title}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {auction.details}
              </p>
            </div>

            {/* Auction Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm sm:text-base">
              <div>
                <div className="font-bold text-gray-900">
                  {auction.timeLeft}
                </div>
                <div className="text-gray-600">Time Left</div>
              </div>
              <div>
                <div className="font-bold text-gray-900">{auction.endTime}</div>
                <div className="text-gray-600">Auction Ending</div>
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {auction.activeBids}
                </div>
                <div className="text-gray-600">Active bids</div>
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {auction.currentBid}
                </div>
                <div className="text-gray-600">Current bid</div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-2 sm:space-y-3">
              {[
                ["Year", auction.car.year?.toString() || "N/A"],
                ["Make", auction.car.make || "N/A"],
                ["Model", auction.car.model || "N/A"],
                ["Trim", auction.car.trim || "N/A"],
                [
                  "Condition",
                  auction.car.condition
                    ? auction.car.condition.charAt(0).toUpperCase() +
                      auction.car.condition.slice(1)
                    : "N/A",
                ],
                [
                  "Body Type",
                  auction.car.body_type
                    ? auction.car.body_type.charAt(0).toUpperCase() +
                      auction.car.body_type.slice(1)
                    : "N/A",
                ],
                [
                  "Fuel Type",
                  auction.car.fuel_type
                    ? auction.car.fuel_type.charAt(0).toUpperCase() +
                      auction.car.fuel_type.slice(1)
                    : "N/A",
                ],
                [
                  "Drivetrain",
                  auction.car.drivetrain
                    ? auction.car.drivetrain.toUpperCase()
                    : "N/A",
                ],
                ["Engine", auction.car.engine || "N/A"],
                ["Exterior Color", auction.car.exterior_color || "N/A"],
                ["Interior Color", auction.car.interior_color || "N/A"],
                [
                  "Mileage",
                  auction.car.mileage
                    ? `${auction.car.mileage.toLocaleString()} miles`
                    : "N/A",
                ],
                ["Current Bid", auction.currentBid],
              ]
                .filter(([_, value]) => value && value !== "N/A")
                .map(([label, value], idx, arr) => (
                  <div
                    key={label}
                    className={`flex justify-between py-2 ${
                      idx < arr.length - 1 ? "border-b border-gray-200" : ""
                    }`}
                  >
                    <span className="text-gray-600 text-sm sm:text-base">
                      {label}
                    </span>
                    <span className="text-gray-900 text-sm sm:text-base">
                      {value}
                    </span>
                  </div>
                ))}
            </div>

            {/* Bid Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder={`Enter your bid (Minimum ${auction.currentBid})`}
                  type="number"
                  min={auction.currentBidValue}
                  step="100"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  onBlur={(e) => {
                    // Validate on blur - show warning if bid is below minimum
                    if (e.target.value && auction) {
                      const amount = parseFloat(e.target.value);
                      if (!isNaN(amount) && amount < auction.currentBidValue) {
                        toast({
                          title: "❌ Bid Below Minimum",
                          description: `Minimum bid is ${auction.currentBid}`,
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                  disabled={isPlacingBid}
                  className="flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 py-3 sm:py-8 disabled:opacity-50"
                />
                <Button
                  onClick={handlePlaceBid}
                  disabled={isPlacingBid || !bidAmount}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover px-8 py-3 sm:py-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlacingBid ? "Placing Bid..." : "Place Bid"}
                </Button>
              </div>
              {auction.car.description && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base whitespace-pre-wrap">
                    {auction.car.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bid History */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Bid History</h3>
          {isBidHistoryLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex items-center gap-6">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : bidHistory.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No bids placed yet. Be the first to bid!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-200">
                    <th className="pb-3 font-medium">Bidder</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                    <th className="pb-3 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {[...bidHistory]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((bid, idx) => (
                      <tr key={bid.id} className={`${idx < bidHistory.length - 1 ? "border-b border-gray-100" : ""}`}>
                        <td className="py-3 text-gray-900">
                          {bid.profile.first_name} {bid.profile.last_name?.[0] ? `${bid.profile.last_name[0]}.` : ""}
                        </td>
                        <td className="py-3 text-right font-semibold text-primary">
                          ${parseFloat(bid.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </td>
                        <td className="py-3 text-right text-gray-500">
                          {formatTimeAgo(bid.created_at)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailView;
