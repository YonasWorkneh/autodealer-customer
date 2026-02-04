"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Share2,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Gauge,
  Globe,
  LifeBuoy,
  Calendar,
  Star,
  Send,
  Instagram,
  Facebook,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Header from "@/components/Header";
import { useParams, useRouter } from "next/navigation";
import { useCar, useCarFavorites, useUpdateFavorite, useRatingAnalytics, usePostLead } from "@/hooks/cars";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import ReviewSection from "@/components/ReviewSection";
import { useProfile, useProfileById } from "@/hooks/profile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { updateCarViews } from "@/lib/carApi";

export default function CarListingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [readIndex, setReadIndex] = useState<number>(140);
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [nameError, setNameError] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactTab, setContactTab] = useState<"phone" | "email">("phone");

  const searchParams = useParams();
  const router = useRouter();
  const { id } = searchParams;

  const { data: car, isLoading, error } = useCar(id as string);
  const { data: favorites } = useCarFavorites();
  const { data: ratingData } = useRatingAnalytics(id as string);
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ip, setIp] = useState<string | null>(null);

  // Get dealer or broker ID (whichever is not null)
  const dealerOrBrokerId = car?.dealer || car?.broker;
  const { data: dealerBrokerProfile, isLoading: isLoadingProfile, error: profileError } = useProfileById(dealerOrBrokerId || null);

  // Pre-fill form with profile data when dialog opens
  useEffect(() => {
    if (isContactDialogOpen && profile) {
      const fullName = profile.first_name && profile.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : profile.first_name || profile.last_name || "";
      setContactName(fullName);
      
      // Extract the remaining part if contact starts with +251
      if (profile.contact) {
        if (profile.contact.includes("@")) {
          // It's an email
          setContactNumber(profile.contact);
          setContactTab("email");
        } else if (profile.contact.startsWith("+251")) {
          setContactNumber(profile.contact.substring(4)); // Remove +251
          setContactTab("phone");
        } else if (profile.contact.startsWith("251")) {
          setContactNumber(profile.contact.substring(3)); // Remove 251
          setContactTab("phone");
        } else {
          setContactNumber(profile.contact);
          setContactTab("phone");
        }
      } else {
        setContactNumber("");
        setContactTab("phone");
      }
    }
    // Clear errors when dialog opens
    if (isContactDialogOpen) {
      setNameError("");
      setContactError("");
    }
  }, [isContactDialogOpen, profile]);

  const { mutate: postLead, isPending: isSubmittingLead } = usePostLead(
    () => {
      toast({
        title: "Success",
        description: "Your inquiry has been submitted successfully!",
        variant: "success",
      });
      setIsContactDialogOpen(false);
      setContactName("");
      setContactNumber("");
      setNameError("");
      setContactError("");
    },
    (error: any) => {
      // Parse API error response
      const errorData = error?.response || error?.data || {};
      
      // Clear previous errors
      setNameError("");
      setContactError("");
      
      // Set field-specific errors
      if (errorData.name && Array.isArray(errorData.name)) {
        setNameError(errorData.name[0]);
      }
      if (errorData.contact && Array.isArray(errorData.contact)) {
        setContactError(errorData.contact[0]);
      }
      
      // Show general error toast if no field-specific errors
      if (!errorData.name && !errorData.contact) {
        toast({
          title: "❌ Error",
          description: error.message || "Failed to submit inquiry. Please try again.",
        });
      }
    }
  );

  const validateContact = (value: string, tab: "phone" | "email"): string => {
    if (!value.trim()) {
      return "Contact is required";
    }
    
    if (tab === "email") {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
      return "";
    } else {
      // Phone number validation
      const phoneDigits = value.replace(/\D/g, ""); // Remove non-digits
      
      if (phoneDigits.length === 0) {
        return "Please enter a valid phone number";
      }
      
      if (phoneDigits.length !== 9) {
        return "Phone number must be exactly 9 digits";
      }
      
      if (!phoneDigits.startsWith("7") && !phoneDigits.startsWith("9")) {
        return "Phone number must start with 7 or 9 (Ethiopian mobile providers)";
      }
      
      return "";
    }
  };

  const handleSubmitContact = () => {
    // Clear previous errors
    setNameError("");
    setContactError("");
    
    if (!contactName.trim()) {
      setNameError("Name is required");
      return;
    }
    
    if (!contactNumber.trim()) {
      setContactError("Contact is required");
      return;
    }
    
    // Validate contact based on active tab
    const contactValidationError = validateContact(contactNumber, contactTab);
    if (contactValidationError) {
      setContactError(contactValidationError);
      return;
    }
    
    // Format contact: if it's a phone number (9 digits), prepend +251
    let formattedContact = contactNumber;
    if (contactTab === "phone") {
      const phoneDigits = contactNumber.replace(/\D/g, "");
      if (phoneDigits.length === 9 && (phoneDigits.startsWith("7") || phoneDigits.startsWith("9"))) {
        formattedContact = `+251${phoneDigits}`;
      }
    }
    
    postLead({ name: contactName, contact: formattedContact });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactName(e.target.value);
    if (nameError) setNameError("");
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // If it's phone tab, only allow digits and limit to 9 digits
    if (contactTab === "phone") {
      // Remove non-digits
      value = value.replace(/\D/g, "");
      // Limit to 9 digits
      value = value.slice(0, 9);
    }
    
    setContactNumber(value);
    
    // Clear error if user is typing
    if (contactError) {
      const validationError = validateContact(value, contactTab);
      if (!validationError) {
        setContactError("");
      }
    }
  };

  const handleTabChange = (value: string) => {
    setContactTab(value as "phone" | "email");
    setContactNumber("");
    setContactError("");
  };

  // Extract rating data
  const ratingAnalytics = ratingData?.[0];
  const averageRating = ratingAnalytics?.average_rating || 0;
  const totalRatings = ratingAnalytics?.total_ratings || 0;

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

  const { mutate: toggleFavorite } = useUpdateFavorite(onSuccess, onError);

  const favorited = favorites?.findIndex(
    (favorite) => favorite.car === car?.id
  );

  // Get car images from API data or fallback to placeholder
  const carImages = car?.images?.map((img) => img.image_url) || [
    "/placeholder.svg",
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + carImages.length) % carImages.length
    );
  };

  // Get features from car data
  const getCarFeatures = () => {
    if (!car) return [];
    const features = [];

    if (car.all_wheel_steering) features.push("All Wheel Steering");
    if (car.anti_lock_brakes) features.push("Anti-Lock Brakes/ABS");
    if (car.cruise_control) features.push("Cruise Control");
    if (car.dual_exhaust) features.push("Dual Exhaust");
    if (car.front_airbags) features.push("Front Airbags");
    if (car.power_steering) features.push("Power Steering");
    if (car.side_airbags) features.push("Side Airbags");
    if (car.tiptronic_gears) features.push("Tiptronic Gears");
    if (car.bluetooth) features.push("Bluetooth");
    if (car.leather_seats) features.push("Leather Seats");
    if (car.navigation_system) features.push("Navigation System");
    if (car.sunroof) features.push("Sunroof");
    if (car.power_windows) features.push("Power Windows");
    if (car.power_locks) features.push("Power Locks");
    if (car.climate_control) features.push("Climate Control");
    if (car.keyless_entry) features.push("Keyless Entry");

    return features;
  };

  const features = getCarFeatures();
  const visibleFeatures = showAllFeatures ? features : features.slice(0, 8);
  const message = car?.description || "No description available for this car.";

  // Share functionality
  const shareData = {
    title: `${car?.year} ${car?.make} ${car?.model} ${car?.trim ? `(${car.trim})` : ""
      }`,
    text: `${message.slice(0, 100)}... Price: ${formatPrice(car?.price || "")}`,
    url: window.location.href,
    image: carImages[currentImageIndex],
  };

  const shareLinks = [
    {
      name: "Telegram",
      icon: <Send className="w-4 h-4" />,
      url: `https://t.me/share/url?url=${encodeURIComponent(
        shareData.url
      )}&text=${encodeURIComponent(
        `${shareData.title}\n${shareData.text}\nImage: ${shareData.image}`
      )}`,
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-4 h-4" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareData.url
      )}&quote=${encodeURIComponent(`${shareData.title}\n${shareData.text}`)}`,
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-4 h-4" />,
      url: `https://www.instagram.com/`, // Instagram requires manual posting
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-4 h-4" />,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${shareData.title}\n${shareData.text}\n${shareData.url}\nImage: ${shareData.image}`
      )}`,
    },
    {
      name: "X",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: `https://x.com/intent/tweet?text=${encodeURIComponent(
        `${shareData.title}\n${shareData.text}`
      )}&url=${encodeURIComponent(shareData.url)}`,
    },
  ];

  const handleShare = (url: string, name: string) => {
    if (name === "Instagram") {
      toast({
        title: "Instagram Sharing",
        description:
          "Link, title, description, and image URL copied to clipboard. Paste them manually in Instagram.",
      });
      navigator.clipboard.writeText(
        `${shareData.title}\n${shareData.text}\n${shareData.url}\nImage: ${shareData.image}`
      );
    } else {
      window.open(url, "_blank");
    }
    setIsShareDropdownOpen(false);
  };

  useEffect(() => {
    // Reset image index when car changes
    setCurrentImageIndex(0);
  }, [car?.id]);

  useEffect(() => {
    async function fetchIp() {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        setIp(data.ip);
        await updateCarViews(
          Array.isArray(id) ? parseInt(id[0]) : parseInt(id || ""),
          data.ip
        );
      } catch (err) {
        console.error("Failed to fetch IP", err);
      }
    }
    fetchIp();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Header color="black" />
        <div className="px-0 sm:px-6 lg:px-50 py-6 md:py-10">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="bg-gray-200 h-32 rounded-lg"></div>
              </div>
              <div className="bg-gray-200 h-64 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !car) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Header color="black" />
        <div className="px-0 sm:px-6 lg:px-50 py-6 md:py-10">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Car Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The car you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => window.history.back()}
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <Header color="black" />
      <div className="px-0 sm:px-6 lg:px-50 py-6 md:py-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/listing")}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-foreground hover:bg-muted cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listing
        </Button>
        
        {/* Main Car Image */}
        <div className="relative mb-6">
          <div className="relative overflow-hidden rounded-lg bg-white shadow-lg">
            <Image
              src={carImages[currentImageIndex]}
              alt={`${car.year} ${car.make} ${car.model}`}
              width={120}
              height={120}
              className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] object-cover cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            />

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs sm:text-sm">
              <Image
                src={"/image-count.svg"}
                width={120}
                height={120}
                alt="img-count"
                className="size-3 sm:size-4"
              />
              {currentImageIndex + 1} / {carImages.length}
            </div>

            {/* Navigation arrows for main image */}
            {carImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent cursor-pointer"
              onClick={() => toggleFavorite(car.id)}
            >
              <Heart
                className={`w-4 h-4 ${favorited !== -1 ? "fill-primary text-primary" : ""
                  }`}
              />
              {favorited !== -1 ? "Favorited" : "Favorite"}
            </Button>
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-transparent cursor-pointer"
                    onClick={() => setIsShareDropdownOpen(!isShareDropdownOpen)}
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="mt-2 w-48 bg-white shadow-lg rounded-lg"
                >
                  {shareLinks.map((link) => (
                    <DropdownMenuItem
                      key={link.name}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
                      onClick={() => handleShare(link.url, link.name)}
                    >
                      {link.icon}
                      {link.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {/* <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent cursor-pointer"
                onClick={() => setIsShareDropdownOpen(!isShareDropdownOpen)}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              {isShareDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
                  {shareLinks.map((link) => (
                    <button
                      key={link.name}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
                      onClick={() => handleShare(link.url, link.name)}
                    >
                      {link.icon}
                      {link.name}
                    </button>
                  ))}
                </div>
              )} */}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price and Title */}
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-black mb-2">
                {formatPrice(car.price)}
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold mb-4">
                {car.year} {car.make} {car.model}{" "}
                {car.trim ? `(${car.trim})` : ""}
              </h1>

              <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{car.year}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Gauge className="w-4 h-4" />
                  <span>{car.mileage?.toLocaleString()} miles</span>
                </div>
                <div className="flex items-center gap-1">
                  <LifeBuoy className="w-4 h-4" />
                  <span className="capitalize">{car.condition}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span className="capitalize">{car.fuel_type}</span>
                </div>
              </div>
            </div>

            {/* Car Overview */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">
                  Car Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3 sm:border-r sm:pr-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interior Color</span>
                      <span className="font-medium">
                        {car.interior_color || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exterior Color</span>
                      <span className="font-medium">
                        {car.exterior_color || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Body Type</span>
                      <span className="font-medium capitalize">
                        {car.body_type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Drivetrain</span>
                      <span className="font-medium capitalize">
                        {car.drivetrain}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engine</span>
                      <span className="font-medium">{car.engine || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fuel Type</span>
                      <span className="font-medium capitalize">
                        {car.fuel_type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sale Type</span>
                      <span className="font-medium capitalize">
                        {car.sale_type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className="font-medium capitalize">
                        {car.status}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">
                  {car.year} {car.make} {car.model}
                </h2>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">
                  {message.slice(0, readIndex)}{" "}
                  {message.length > 140 && readIndex !== message.length ? (
                    <span className="text-gray-700 mb-4 cursor-pointer">
                      ...
                    </span>
                  ) : (
                    <></>
                  )}
                </p>
                {message.length > 140 && (
                  <Button
                    variant="link"
                    className="text-black p-0 h-auto font-normal cursor-pointer"
                    onClick={() =>
                      setReadIndex(
                        readIndex === message.length ? 140 : message.length
                      )
                    }
                  >
                    {readIndex === message.length ? "Show less" : "Read more"}
                  </Button>
                )}
                <div className="mt-4 text-xs sm:text-sm text-gray-500">
                  Posted on: {new Date(car.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            {features.length > 0 && (
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold">
                      Features
                    </h2>
                    {features.length > 8 && (
                      <Button
                        variant="link"
                        className="text-black p-0 h-auto font-normal cursor-pointer"
                        onClick={() => setShowAllFeatures(!showAllFeatures)}
                      >
                        {showAllFeatures ? "Show less" : "Show all"}
                      </Button>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {visibleFeatures.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dealer/Broker Info */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                {isLoadingProfile ? (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-bold animate-pulse">
                      ?
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-400">
                        Loading...
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400">Loading...</p>
                    </div>
                  </div>
                ) : profileError || !dealerBrokerProfile ? (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-bold">
                      ?
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-600">
                        {car?.dealer ? "Dealer" : car?.broker ? "Broker" : "Seller"}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Profile unavailable
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-4">
                    {dealerBrokerProfile.image_url ? (
                      <Image
                        src={dealerBrokerProfile.image_url}
                        alt={dealerBrokerProfile.dealer_profile?.company_name || `${dealerBrokerProfile.first_name} ${dealerBrokerProfile.last_name}`}
                        width={48}
                        height={48}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                        {(() => {
                          // Get initial from company name (dealer) or name (broker)
                          const displayName = dealerBrokerProfile.dealer_profile?.company_name ||
                            `${dealerBrokerProfile.first_name} ${dealerBrokerProfile.last_name}`.trim() ||
                            dealerBrokerProfile.first_name ||
                            dealerBrokerProfile.last_name ||
                            "?";
                          return displayName.charAt(0).toUpperCase();
                        })()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">
                        {dealerBrokerProfile.dealer_profile?.company_name ||
                          `${dealerBrokerProfile.first_name} ${dealerBrokerProfile.last_name}`.trim() ||
                          dealerBrokerProfile.first_name ||
                          dealerBrokerProfile.last_name ||
                          "Unknown"}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 capitalize">
                        {car?.dealer ? "Dealer" : car?.broker ? "Broker" : "Seller"}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 border-t py-4">
                  <Button
                    onClick={() => setIsContactDialogOpen(true)}
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-hover flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contact
                  </Button>
                </div>
                {/* rating */}
                <div className="flex items-center gap-2 sm:gap-3 mt-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`${index < Math.round(averageRating)
                        ? "text-yellow-500 fill-amber-400"
                        : "text-gray-300"
                        } `}
                    />
                  ))}
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {averageRating > 0 ? `${averageRating.toFixed(1)}/5` : "No ratings yet"}
                    {totalRatings > 0 && ` (${totalRatings} ${totalRatings === 1 ? 'rating' : 'ratings'})`}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <ReviewSection carId={id as string} />
                </div>
              </CardContent>
            </Card>

            {/* Inspection Badge */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">
                    CARS INSPECTED
                  </h3>
                  <p className="text-xs sm:text-sm mb-3">by AUTO—Dealer</p>
                  <Button
                    size="sm"
                    className="bg-background text-foreground hover:bg-muted cursor-pointer"
                  >
                    View Listings
                  </Button>
                </div>
                <div className="mt-2 flex justify-center">
                  <Image
                    src="/id6-orange.png"
                    alt="Inspected car"
                    width={120}
                    height={120}
                    className="w-1/2 h-auto object-cover rounded"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 w-screen h-screen bg-black z-50 flex items-center justify-center p-2 sm:p-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 z-10 bg-[#111] hover:bg-[#222] text-white p-2 sm:p-3 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute top-4 right-4 sm:right-20 z-10 flex gap-2 sm:gap-4">
              <button
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-white bg-[#111] hover:bg-[#222] rounded-lg transition-colors cursor-pointer text-xs sm:text-sm"
                onClick={() => toggleFavorite(car.id)}
              >
                <Heart
                  className={`w-4 h-4 ${favorited !== -1 ? "fill-primary text-primary" : ""
                    }`}
                />
                {favorited !== -1 ? "Favorited" : "Favorite"}
              </button>
              <div className="relative">
                <button
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-white bg-[#111] hover:bg-[#222] rounded-lg transition-colors cursor-pointer text-xs sm:text-sm"
                  onClick={() => setIsShareDropdownOpen(!isShareDropdownOpen)}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                {isShareDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
                    {shareLinks.map((link) => (
                      <button
                        key={link.name}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => handleShare(link.url, link.name)}
                      >
                        {link.icon}
                        {link.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main image */}
            <Image
              src={carImages[currentImageIndex] || "/placeholder.svg"}
              alt={`${car.year} ${car.make} ${car.model}`}
              width={120}
              height={120}
              className="w-full max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl h-auto object-contain"
            />

            {/* Navigation arrows */}
            {carImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-[#111] hover:bg-[#222] text-white p-2 sm:p-3 rounded-full transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-[#111] hover:bg-[#222] text-white p-2 sm:p-3 rounded-full transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm">
              Showing {currentImageIndex + 1} of {carImages.length}
            </div>
          </div>
        )}

        {/* Contact Dialog */}
        <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Contact Dealer</DialogTitle>
              <DialogDescription>
                Fill in your details to inquire about this vehicle. We'll get back to you soon.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={contactName}
                  onChange={handleNameChange}
                  disabled={isSubmittingLead}
                  className={nameError ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50" : ""}
                />
                {nameError && (
                  <p className="text-sm text-red-500 mt-1">{nameError}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Tabs value={contactTab} onValueChange={handleTabChange} className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="contact">Contact</Label>
                    <TabsList className="h-8 p-0 bg-transparent border-b border-gray-200">
                      <TabsTrigger
                        value="phone"
                        className="cursor-pointer px-4 py-1.5 text-sm font-medium text-gray-600 data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent shadow-none"
                      >
                        Phone
                      </TabsTrigger>
                      <TabsTrigger
                        value="email"
                        className="cursor-pointer px-4 py-1.5 text-sm font-medium text-gray-600 data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent shadow-none"
                      >
                        Email
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="phone" className="mt-0">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-sm">
                        +251
                      </span>
                      <Input
                        id="contact"
                        type="tel"
                        placeholder="912345678"
                        value={contactNumber}
                        onChange={handleContactChange}
                        disabled={isSubmittingLead}
                        className={`rounded-l-none ${contactError ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50" : ""}`}
                      />
                    </div>
                    {contactError && (
                      <p className="text-sm text-red-500 mt-1">{contactError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 9-digit phone number starting with 7 or 9
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="email" className="mt-0">
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={contactNumber}
                      onChange={handleContactChange}
                      disabled={isSubmittingLead}
                      className={contactError ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50" : ""}
                    />
                    {contactError && (
                      <p className="text-sm text-red-500 mt-1">{contactError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your email address
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsContactDialogOpen(false)}
                disabled={isSubmittingLead}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitContact}
                disabled={isSubmittingLead || !contactName.trim() || !contactNumber.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                {isSubmittingLead ? "Submitting..." : "Submit Inquiry"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
