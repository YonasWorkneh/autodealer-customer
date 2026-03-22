"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Plus, ChevronDown, ChevronUp, Loader2, ClipboardCheck } from "lucide-react";
import {
  useMakes,
  useModels,
  usePostCar,
  useCar,
  useUpdateCar,
  usePostCarInspection,
} from "@/hooks/cars";
import type { CarInspectionPayload } from "@/lib/carApi";
import Header from "@/components/Header";
import { indexedDBManager, convertFormDataToCarForm } from "@/lib/indexedDB";
import type { Feature } from "../types/Car";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/user";
import { useProfile } from "@/hooks/profile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Validation schema
const formSchema = z.object({
  make: z.number().refine((val) => val > 0, "Please select a make"),
  model: z.number().refine((val) => val > 0, "Please select a model"),
  year: z.string().min(1, "Please select a year"),
  mileage: z
    .string()
    .min(1, "Mileage is required")
    .regex(/^\d+$/, "Please enter a valid mileage"),
  engine: z.string().min(1, "Engine type is required"),
  gearbox: z.string().min(1, "Gearbox type is required"),
  bodyColor: z.string().min(1, "Exterior color is required"),
  interiorColor: z.string().min(1, "Interior color is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .regex(/^\d+$/, "Please enter a valid price"),
  salesType: z.string().min(1, "Sales type is required"),
  description: z.string().min(1, "Description is required"),
  images: z.array(z.instanceof(File)).min(1, "At least one image is required"),
  bodyType: z.string().min(1, "Body type is required"),
  vin: z.string().min(1, "VIN is required"),
  origin: z.string().min(1, "Origin is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function PlaceAddForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const c_id = searchParams.get("c_id");
  const { user } = useUserStore();
  const { data: profile } = useProfile();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [featuredImageIndex, setFeaturedImageIndex] = useState<number>(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showInspectionStep, setShowInspectionStep] = useState(false);
  const [createdCarId, setCreatedCarId] = useState<number | null>(null);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionModalError, setInspectionModalError] = useState<string | null>(null);
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      make: 0,
      model: 0,
      year: "",
      mileage: "",
      engine: "",
      gearbox: "",
      bodyColor: "",
      interiorColor: "",
      fuelType: "",
      price: "",
      salesType: "",
      description: "",
      images: [],
      bodyType: "",
      vin: "",
      origin: "",
    },
  });

  const watchedMake = watch("make");
  const { data: makes, isLoading: isMakesLoading } = useMakes();
  const { data: models, isLoading: isModelsLoading } = useModels(watchedMake);
  const { data: carData, isLoading: isCarLoading } = useCar(c_id ? c_id : "");

  const resetFormToInitial = () => {
    reset({
      make: 0,
      model: 0,
      year: "",
      mileage: "",
      engine: "",
      gearbox: "",
      bodyColor: "",
      interiorColor: "",
      fuelType: "",
      price: "",
      salesType: "",
      description: "",
      images: [],
      bodyType: "",
      vin: "",
      origin: "",
    });
    setImages([]);
    setFeaturedImageIndex(0);
    setTechnicalFeatures((prev) =>
      prev.map((tec) => ({ ...tec, checked: false })),
    );
    setExtras((prev) => prev.map((extra) => ({ ...extra, checked: false })));
    setStep(1);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const onSuccessUpdate = () => {
    resetFormToInitial();
  };

  const onSuccessPost = (car: { id: number }) => {
    setSubmitError(null);
    setCreatedCarId(car.id);
    setShowInspectionStep(true);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const onError = () => {
    reset({
      make: 0,
      model: 0,
      year: "",
      mileage: "",
      engine: "",
      gearbox: "",
      bodyColor: "",
      interiorColor: "",
      fuelType: "",
      price: "",
      salesType: "",
      description: "",
      images: [],
      bodyType: "",
      vin: "",
      origin: "",
    });
    setImages([]);
    setFeaturedImageIndex(0);
    setTechnicalFeatures((prev) =>
      prev.map((tec) => ({ ...tec, checked: false })),
    );
    setExtras((prev) => prev.map((extra) => ({ ...extra, checked: false })));
    setStep(1);
    setSubmitError("Something went wrong. Please try again");
    setTimeout(() => setSubmitError(null), 5000);
  };

  const {
    mutate: postCar,
    isPending: isPostPending,
    isSuccess: isPostSuccess,
  } = usePostCar(onError, onSuccessPost);
  const {
    mutate: updateCar,
    isPending: isUpdatePending,
    isSuccess: isUpdateSuccess,
  } = useUpdateCar(onError, onSuccessUpdate);
  const { mutate: postInspection, isPending: isInspectionPending } =
    usePostCarInspection();

  // Generate years from 1921 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1920 },
    (_, i) => currentYear - i,
  );

  const fuelTypes = ["Diesel", "Electric", "Hybrid", "Petrol"];
  const engineTypes = [
    "Inline-3",
    "Inline-4",
    "Inline-6",
    "V6",
    "V8",
    "V10",
    "V12",
    "Boxer (Flat)",
    "Rotary (Wankel)",
    "Turbocharged",
    "Supercharged",
    "Naturally Aspirated",
    "Other",
  ];
  const bodyTypes: { value: string; label: string }[] = [
    { value: "sedan", label: "Sedan" },
    { value: "suv", label: "SUV" },
    { value: "truck", label: "Truck" },
    { value: "coupe", label: "Coupe" },
    { value: "hatchback", label: "Hatchback" },
    { value: "convertible", label: "Convertible" },
    { value: "wagon", label: "Wagon" },
    { value: "van", label: "Van" },
    { value: "other", label: "Other" },
  ];
  const gearboxTypes = [
    "Manual",
    "Automatic",
    "CVT",
    "Semi-Automatic",
    "Other",
  ];
  const salesTypes = ["Auction", "Fixed Price"];
  const [technicalFeatures, setTechnicalFeatures] = useState<Feature[]>([
    {
      id: "tiptronic",
      label: "Tiptronic Gears",
      checked: false,
      field: "tiptronic_gears",
    },
    {
      id: "front-airbags",
      label: "Front Airbags",
      checked: false,
      field: "front_airbags",
    },
    {
      id: "dual-exhaust",
      label: "Dual Exhaust",
      checked: false,
      field: "dual_exhaust",
    },
    {
      id: "side-airbags",
      label: "Side Airbags",
      checked: false,
      field: "side_airbags",
    },
    {
      id: "power-steering",
      label: "Power Steering",
      checked: false,
      field: "power_steering",
    },
    {
      id: "n2o-system",
      label: "N2O System",
      checked: false,
      field: "n2o_system",
    },
    {
      id: "cruise-control",
      label: "Cruise Control",
      checked: false,
      field: "cruise_control",
    },
    {
      id: "front-wheel-drive",
      label: "Front Wheel Drive",
      checked: false,
      field: "front_wheel_drive",
    },
    {
      id: "rear-wheel-drive",
      label: "Rear Wheel Drive",
      checked: false,
      field: "rear_wheel_drive",
    },
    {
      id: "4-wheel-drive",
      label: "4 Wheel Drive",
      checked: false,
      field: "four_wheel_drive",
    },
    {
      id: "all-wheel-steering",
      label: "All Wheel Steering",
      checked: false,
      field: "all_wheel_steering",
    },
    {
      id: "anti-lock-brakes",
      label: "Anti-Lock Brakes/ABS",
      checked: false,
      field: "anti_lock_brakes",
    },
    {
      id: "all-wheel-drive",
      label: "All Wheel Drive",
      checked: false,
      field: "all_wheel_drive",
    },
  ]);

  const [extras, setExtras] = useState<Feature[]>([
    {
      id: "bluetooth-system",
      label: "Bluetooth System",
      checked: false,
      field: "bluetooth",
    },
    {
      id: "heated-seats",
      label: "Heated Seats",
      checked: false,
      field: "heated_seats",
    },
    { id: "cd-player", label: "CD Player", checked: false, field: "cd_player" },
    {
      id: "power-locks",
      label: "Power Locks",
      checked: false,
      field: "power_locks",
    },
    {
      id: "premium-wheels",
      label: "Premium Wheels/Rims",
      checked: false,
      field: "premium_wheels_rims",
    },
    { id: "winch", label: "Winch", checked: false, field: "winch" },
    {
      id: "alarm",
      label: "Alarm/Anti-Theft System",
      checked: false,
      field: "alarm_anti_theft",
    },
    {
      id: "cooled-seats",
      label: "Cooled Seats",
      checked: false,
      field: "cooled_seats",
    },
    {
      id: "keyless-start",
      label: "Keyless Start",
      checked: false,
      field: "keyless_start",
    },
    { id: "body-kit", label: "Body Kit", checked: false, field: "body_kit" },
    {
      id: "navigation",
      label: "Navigation System",
      checked: false,
      field: "navigation_system",
    },
    {
      id: "premium-lights",
      label: "Premium Lights",
      checked: false,
      field: "premium_lights",
    },
    {
      id: "cassette-player",
      label: "Cassette Player",
      checked: false,
      field: "cassette_player",
    },
    {
      id: "fog-lights",
      label: "Fog Lights",
      checked: false,
      field: "fog_lights",
    },
    {
      id: "leather-seats",
      label: "Leather Seats",
      checked: false,
      field: "leather_seats",
    },
    { id: "roof-rack", label: "Roof Rack", checked: false, field: "roof_rack" },
    {
      id: "dvd-player",
      label: "DVD Player",
      checked: false,
      field: "dvd_player",
    },
    {
      id: "power-mirrors",
      label: "Power Mirrors",
      checked: false,
      field: "power_mirrors",
    },
    {
      id: "power-sunroof",
      label: "Power Sunroof",
      checked: false,
      field: "power_sunroof",
    },
    {
      id: "aux-audio-in",
      label: "Aux Audio In",
      checked: false,
      field: "aux_audio_in",
    },
    {
      id: "brush-guard",
      label: "Brush Guard",
      checked: false,
      field: "brush_guard",
    },
    {
      id: "air-conditioning",
      label: "Air Conditioning",
      checked: false,
      field: "air_conditioning",
    },
    {
      id: "performance-tyres",
      label: "Performance Tyres",
      checked: false,
      field: "performance_tyres",
    },
    {
      id: "premium-sound",
      label: "Premium Sound System",
      checked: false,
      field: "premium_sound_system",
    },
    { id: "heat", label: "Heat", checked: false, field: "heat" },
    {
      id: "vhs-player",
      label: "VHS Player",
      checked: false,
      field: "vhs_player",
    },
    {
      id: "offroad-kit",
      label: "Off-Road Kit",
      checked: false,
      field: "off_road_kit",
    },
    {
      id: "am-fm-radio",
      label: "AM/FM Radio",
      checked: false,
      field: "am_fm_radio",
    },
    { id: "moonroof", label: "Moonroof", checked: false, field: "moonroof" },
    {
      id: "racing-seats",
      label: "Racing Seats",
      checked: false,
      field: "racing_seats",
    },
    {
      id: "premium-paint",
      label: "Premium Paint",
      checked: false,
      field: "premium_paint",
    },
    { id: "spoiler", label: "Spoiler", checked: false, field: "spoiler" },
    {
      id: "power-windows",
      label: "Power Windows",
      checked: false,
      field: "power_windows",
    },
    { id: "sunroof", label: "Sunroof", checked: false, field: "sunroof" },
    {
      id: "climate-control",
      label: "Climate Control",
      checked: false,
      field: "climate_control",
    },
    {
      id: "parking-sensors",
      label: "Parking Sensors",
      checked: false,
      field: "parking_sensors",
    },
    {
      id: "rear-view-camera",
      label: "Rear View Camera",
      checked: false,
      field: "rear_view_camera",
    },
    {
      id: "keyless-entry",
      label: "Keyless Entry",
      checked: false,
      field: "keyless_entry",
    },
    {
      id: "offroad-tyres",
      label: "Off-Road Tyres",
      checked: false,
      field: "off_road_tyres",
    },
    {
      id: "satellite-radio",
      label: "Satellite Radio",
      checked: false,
      field: "satellite_radio",
    },
    {
      id: "power-seats",
      label: "Power Seats",
      checked: false,
      field: "power_seats",
    },
  ]);

  // Pre-fill form with car data when c_id is present
  useEffect(() => {
    if (carData && c_id) {
      setTimeout(() => {
        reset({
          make: carData.make_ref,
          model: carData.model_ref,
          year: carData.year.toString(),
          mileage: carData.mileage.toString(),
          engine: carData.engine,
          gearbox: carData.drivetrain === "fwd" ? "Manual" : carData.drivetrain,
          bodyColor: carData.exterior_color,
          interiorColor: carData.interior_color,
          fuelType: carData.fuel_type?.toLowerCase() || carData.fuel_type,
          price: carData.price.toString(),
          salesType:
            carData.sale_type === "fixed_price" ? "Fixed Price" : "Auction",
          description: carData.description,
          bodyType: carData.body_type,
          vin: carData.vin,
          origin: carData.origin,
          images: [],
        });

        // Set technical features
        setTechnicalFeatures((prev) =>
          prev.map((feature) => ({
            ...feature,
            checked: (carData as any)[feature.field] || false,
          })),
        );

        // Set extras
        setExtras((prev) =>
          prev.map((extra) => ({
            ...extra,
            checked: (carData as any)[extra.field] || false,
          })),
        );
      }, 1000);
    }
  }, [carData, c_id, reset]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = [...images, ...Array.from(e.target.files)];
      setImages(newImages);
      setValue("images", newImages);
      // If this is the first image, make it featured by default
      if (images.length === 0) {
        setFeaturedImageIndex(0);
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue("images", newImages);

    // Adjust featured image index if needed
    if (index === featuredImageIndex) {
      // If we're removing the featured image, set the first remaining image as featured
      setFeaturedImageIndex(newImages.length > 0 ? 0 : 0);
    } else if (index < featuredImageIndex) {
      // If we're removing an image before the featured one, adjust the index
      setFeaturedImageIndex(featuredImageIndex - 1);
    }
  };

  const setFeaturedImage = (index: number) => {
    setFeaturedImageIndex(index);
  };

  const handleNext = async () => {
    const fieldsToValidate =
      step === 1
        ? [
            "make",
            "model",
            "year",
            "mileage",
            "engine",
            "gearbox",
            "bodyColor",
            "interiorColor",
            "fuelType",
            "fuelType",
            "bodyType",
            "vin",
            "origin",
          ]
        : ["price", "salesType", "description", "images"];

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setStep(2);
    }
  };

  const [showAllTechnical, setShowAllTechnical] = useState(false);
  const [showAllExtras, setShowAllExtras] = useState(false);

  const handleTechnicalFeatureChange = (id: string, checked: boolean) => {
    setTechnicalFeatures((prev) =>
      prev.map((feature) =>
        feature.id === id ? { ...feature, checked } : feature,
      ),
    );
  };

  const handleExtraChange = (id: string, checked: boolean) => {
    setExtras((prev) =>
      prev.map((extra) => (extra.id === id ? { ...extra, checked } : extra)),
    );
  };

  const visibleTechnicalFeatures = showAllTechnical
    ? technicalFeatures
    : technicalFeatures.slice(0, 6);
  const visibleExtras = showAllExtras ? extras : extras.slice(0, 4);

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Create FormData for API submission
      const carForm = new FormData();

      // Add all form fields to FormData
      carForm.append("make_ref", data.make.toString());
      carForm.append("model_ref", data.model.toString());
      carForm.append("year", data.year);
      carForm.append("mileage", data.mileage);
      carForm.append("condition", parseInt(data.mileage) > 0 ? "used" : "new");
      carForm.append("engine", data.engine);
      carForm.append("gearbox", data.gearbox);
      carForm.append("exterior_color", data.bodyColor);
      carForm.append("interior_color", data.interiorColor);
      carForm.append("fuel_type", data.fuelType);
      carForm.append("price", data.price);
      carForm.append(
        "sales_type",
        data.salesType === "Fixed Price" ? "fixed_price" : "auction",
      );
      carForm.append("description", data.description);
      carForm.append("body_type", data.bodyType);
      carForm.append("vin", data.vin);
      carForm.append("origin", data.origin);

      // Add images to FormData
      data.images.forEach((image, index) => {
        carForm.append(`uploaded_images[${index}].image_file`, image);
        console.log(image.name, index === featuredImageIndex);
        carForm.append(
          `uploaded_images[${index}].is_featured`,
          String(index === featuredImageIndex ? "True" : "False"),
        );
        // caption = file name
        carForm.append(`uploaded_images[${index}].caption`, image.name);
      });

      const selectedTechnical = technicalFeatures.filter((tec) => tec.checked);
      const selectedExtras = extras.filter((extra) => extra.checked);
      selectedTechnical.forEach((technical) =>
        carForm.append(technical.field, String(technical.checked)),
      );
      selectedExtras.forEach((extra) =>
        carForm.append(extra.field, String(extra.checked)),
      );
      console.log("profile", profile);
      if (
        profile?.dealer_profile === null &&
        profile?.broker_profile === null
      ) {
        // Store in IndexedDB
        const carFormData = convertFormDataToCarForm(
          carForm,
          data.images,
          "payment-pending",
        );
        const savedId = await indexedDBManager.saveCarForm(carFormData);
        router.push(`/pricing?p_id=${savedId}`);
      } else {
        if (!profile?.dealer_profile) {
          carForm.append("broker", String(profile?.broker_profile?.id));
        } else {
          carForm.append("dealer", String(profile?.dealer_profile?.id));
        }

        if (c_id) {
          // Update existing car
          carForm.append("id", c_id);
          updateCar(carForm);
        } else {
          // Create new car
          console.log(Object.fromEntries(carForm));
          postCar(carForm);
          // console.log("CAr Form");
          // console.log(Object.fromEntries(carForm));
        }
      }
    } catch (error) {
      console.error("Error saving form data:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save form data",
      );
    }
  };

  useEffect(() => {
    if (!user.email) router.push("/signin");
  }, [user.email, router]);

  // If the user is not yet a dealer or broker, redirect them to pricing
  // so they see offers before accessing the place-add form.
  useEffect(() => {
    if (!profile) return;
    if (profile.dealer_profile === null && profile.broker_profile === null) {
      router.push("/pricing");
    }
  }, [profile, router]);

  const [inspectionInspectedBy, setInspectionInspectedBy] = useState("");
  const [inspectionDate, setInspectionDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [inspectionRemarks, setInspectionRemarks] = useState("");
  const [inspectionCondition, setInspectionCondition] = useState<
    "excellent" | "good" | "fair" | "poor"
  >("excellent");

  const handleSkipInspection = () => {
    setSubmitError(null);
    setShowInspectionStep(false);
    setCreatedCarId(null);
    resetFormToInitial();
    router.push("/mylistings");
  };

  const handleSubmitInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdCarId) return;
    const payload: CarInspectionPayload = {
      car_id: createdCarId,
      inspected_by: inspectionInspectedBy,
      inspection_date: inspectionDate,
      remarks: inspectionRemarks,
      condition_status: inspectionCondition,
    };
    postInspection(payload, {
      onSuccess: () => {
        setShowInspectionStep(false);
        setCreatedCarId(null);
        resetFormToInitial();
        router.push("/mylistings");
      },
      onError: () => {
        setSubmitError(
          "Failed to submit inspection. You can skip and add it later.",
        );
      },
    });
  };

  const handleSubmitInspectionModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!c_id) return;
    setInspectionModalError(null);
    const payload: CarInspectionPayload = {
      car_id: parseInt(c_id, 10),
      inspected_by: inspectionInspectedBy,
      inspection_date: inspectionDate,
      remarks: inspectionRemarks,
      condition_status: inspectionCondition,
    };
    postInspection(payload, {
      onSuccess: () => {
        setShowInspectionModal(false);
        toast({
          title: "Success",
          description: "Inspection details have been saved.",
          variant: "success",
        });
      },
      onError: () => {
        setInspectionModalError("Failed to submit inspection. Please try again.");
      },
    });
  };

  if (!user.email) return null;

  if (showInspectionStep && createdCarId) {
    return (
      <div>
        <Header color="black" />
        <div className="grid my-auto place-items-center pt-5 pb-12">
          <div className="w-full max-w-2xl bg-transparent rounded-lg p-8">
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
              <p className="text-sm font-medium">
                Your car has been posted successfully. Optionally add inspection
                details below.
              </p>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Add inspection details (optional)
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Submit inspection info to help buyers, or skip to go to My Ads.
            </p>
            <form onSubmit={handleSubmitInspection} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inspected_by">Inspected by</Label>
                <Input
                  id="inspected_by"
                  value={inspectionInspectedBy}
                  onChange={(e) => setInspectionInspectedBy(e.target.value)}
                  placeholder="e.g. Top Garage Motors"
                  className="h-12 border-border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspection_date">Inspection date</Label>
                <Input
                  id="inspection_date"
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="h-12 border-border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={inspectionRemarks}
                  onChange={(e) => setInspectionRemarks(e.target.value)}
                  placeholder="e.g. Engine and brakes are in excellent condition."
                  className="min-h-[100px] border-border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition_status">Condition status</Label>
                <Select
                  value={inspectionCondition}
                  onValueChange={(v: "excellent" | "good" | "fair" | "poor") =>
                    setInspectionCondition(v)
                  }
                >
                  <SelectTrigger className="h-12 border-border rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {submitError && (
                <p className="text-red-500 text-sm">{submitError}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkipInspection}
                  className="flex-1 cursor-pointer"
                >
                  Skip and go to My Ads
                </Button>
                <Button
                  type="submit"
                  disabled={isInspectionPending}
                  className="flex-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary-hover"
                >
                  {isInspectionPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Submit inspection"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header color="black" />
      <div className="grid my-auto place-items-center pt-5">
        <div className="w-full max-w-2xl bg-transparent rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-black/70 uppercase text-center">
              {c_id ? "Edit Car Details" : "Car Details Form"}
            </h1>
            {c_id && !isCarLoading && (
              <Button
                type="button"
                variant="outline"
                className="mt-4 gap-2 cursor-pointer"
                onClick={() => {
                  setInspectionModalError(null);
                  setShowInspectionModal(true);
                }}
              >
                <ClipboardCheck className="h-4 w-4" />
                Add inspection details
              </Button>
            )}
          </div>

          {/* Inspection modal (edit mode only) */}
          {c_id && (
            <Dialog open={showInspectionModal} onOpenChange={setShowInspectionModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add inspection details</DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground text-sm mb-4">
                  Optionally add inspection info for this listing.
                </p>
                <form onSubmit={handleSubmitInspectionModal} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal_inspected_by">Inspected by</Label>
                    <Input
                      id="modal_inspected_by"
                      value={inspectionInspectedBy}
                      onChange={(e) => setInspectionInspectedBy(e.target.value)}
                      placeholder="e.g. Top Garage Motors"
                      className="h-12 border-border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal_inspection_date">Inspection date</Label>
                    <Input
                      id="modal_inspection_date"
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="h-12 border-border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal_remarks">Remarks</Label>
                    <Textarea
                      id="modal_remarks"
                      value={inspectionRemarks}
                      onChange={(e) => setInspectionRemarks(e.target.value)}
                      placeholder="e.g. Engine and brakes are in excellent condition."
                      className="min-h-[100px] border-border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal_condition_status">Condition status</Label>
                    <Select
                      value={inspectionCondition}
                      onValueChange={(v: "excellent" | "good" | "fair" | "poor") =>
                        setInspectionCondition(v)
                      }
                    >
                      <SelectTrigger className="h-12 border-border rounded-md">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {inspectionModalError && (
                    <p className="text-red-500 text-sm">{inspectionModalError}</p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 cursor-pointer"
                      onClick={() => setShowInspectionModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isInspectionPending}
                      className="flex-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary-hover"
                    >
                      {isInspectionPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Submit inspection"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Loading State for Edit Mode */}
          {c_id && isCarLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Success Message */}
              {(isPostSuccess || isUpdateSuccess) && submitSuccess && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">
                        {c_id
                          ? "Car updated successfully!"
                          : "Form submitted successfully! Your car has been posted."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submitError && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Make Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="make" className="text-sm text-gray-500">
                        Select Make
                      </Label>
                      <Controller
                        name="make"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value ? field.value.toString() : ""}
                            onValueChange={(value) => {
                              field.onChange(Number(value));
                              setValue("model", 0); // reset model when make changes
                            }}
                          >
                            <SelectTrigger className="w-full h-12 border-black/10 rounded-md py-8">
                              <SelectValue placeholder="Select Make" />
                            </SelectTrigger>
                            <SelectContent className="max-h-56">
                              {isMakesLoading ? (
                                <SelectItem value="0" disabled>
                                  Loading...
                                </SelectItem>
                              ) : (
                                makes?.map((make: any) => (
                                  <SelectItem
                                    key={make.id}
                                    value={make.id.toString()}
                                  >
                                    {make.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.make && (
                        <p className="text-red-500 text-sm">
                          {errors.make.message}
                        </p>
                      )}
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="model" className="text-sm text-gray-500">
                        Model
                      </Label>
                      <Controller
                        name="model"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value ? field.value.toString() : ""}
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            disabled={!watchedMake || watchedMake === 0}
                          >
                            <SelectTrigger
                              className={`w-full h-12 border-black/10 rounded-md py-8 ${
                                errors.model ? "border-red-500" : ""
                              }`}
                            >
                              <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                            <SelectContent>
                              {isModelsLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              ) : (
                                (models
                                  ?.filter(
                                    (model) => model.make_id === watchedMake,
                                  )
                                  .map((model) => (
                                    <SelectItem
                                      key={model.id}
                                      value={model.id.toString()}
                                    >
                                      {model.name}
                                    </SelectItem>
                                  )) ?? null)
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.model && (
                        <p className="text-red-500 text-sm">
                          {errors.model.message}
                        </p>
                      )}
                    </div>

                    {/* Vin and Origin */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vin" className="text-sm text-gray-500">
                          VIN
                        </Label>
                        <Input
                          id="vin"
                          placeholder="Enter VIN"
                          {...control.register("vin")}
                          className="w-full h-12 border-black/10 rounded-md"
                        />
                        {errors.vin && (
                          <p className="text-red-500 text-sm">
                            {errors.vin.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="origin"
                          className="text-sm text-gray-500"
                        >
                          Origin
                        </Label>
                        <Input
                          id="origin"
                          placeholder="Enter Origin"
                          {...control.register("origin")}
                          className="w-full h-12 border-black/10 rounded-md"
                        />
                        {errors.origin && (
                          <p className="text-red-500 text-sm">
                            {errors.origin.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Year and Mileage Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="year" className="text-sm text-gray-500">
                          Year
                        </Label>
                        <Controller
                          name="year"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger
                                className={`w-full h-12 border-black/10 rounded-md py-8 ${
                                  errors.year ? "border-red-500" : ""
                                }`}
                              >
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                              <SelectContent>
                                {years.map((year) => (
                                  <SelectItem
                                    key={year}
                                    value={year.toString()}
                                  >
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.year && (
                          <p className="text-red-500 text-sm">
                            {errors.year.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="mileage"
                          className="text-sm text-gray-500"
                        >
                          Mileage
                        </Label>
                        <Controller
                          name="mileage"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="mileage"
                              type="number"
                              placeholder="50000"
                              className={`h-12 border-black/10 rounded-md py-8 ${
                                errors.mileage ? "border-red-500" : ""
                              }`}
                            />
                          )}
                        />
                        {errors.mileage && (
                          <p className="text-red-500 text-sm">
                            {errors.mileage.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Engine and Gearbox Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="engine"
                          className="text-sm text-gray-500"
                        >
                          Engine
                        </Label>
                        <Controller
                          name="engine"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger
                                className={`w-full h-12 border-black/10 rounded-md py-8 ${
                                  errors.engine ? "border-red-500" : ""
                                }`}
                              >
                                <SelectValue placeholder="Select engine" />
                              </SelectTrigger>
                              <SelectContent>
                                {engineTypes.map((engine) => (
                                  <SelectItem key={engine} value={engine}>
                                    {engine}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.engine && (
                          <p className="text-red-500 text-sm">
                            {errors.engine.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="gearbox"
                          className="text-sm text-gray-500"
                        >
                          Gearbox
                        </Label>
                        <Controller
                          name="gearbox"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger
                                className={`w-full h-12 border-black/10 rounded-md py-8 ${
                                  errors.gearbox ? "border-red-500" : ""
                                }`}
                              >
                                <SelectValue placeholder="Select gearbox" />
                              </SelectTrigger>
                              <SelectContent>
                                {gearboxTypes.map((gearbox) => (
                                  <SelectItem key={gearbox} value={gearbox}>
                                    {gearbox}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.gearbox && (
                          <p className="text-red-500 text-sm">
                            {errors.gearbox.message}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Fuel Type & Body Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fuel" className="text-sm text-gray-500">
                          Fuel Type
                        </Label>
                        <Controller
                          name="fuelType"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger
                                className={`w-full h-12 border-black/10 rounded-md py-8 ${
                                  errors.fuelType ? "border-red-500" : ""
                                }`}
                              >
                                <SelectValue placeholder="Select fuel type" />
                              </SelectTrigger>
                              <SelectContent>
                                {fuelTypes.map((fuel) => (
                                  <SelectItem
                                    key={fuel}
                                    value={fuel.toLowerCase()}
                                  >
                                    {fuel}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.fuelType && (
                          <p className="text-red-500 text-sm">
                            {errors.fuelType.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="bodyType"
                          className="text-sm text-gray-500"
                        >
                          Body Type
                        </Label>
                        <Controller
                          name="bodyType"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger
                                className={`w-full h-12 border-black/10 rounded-md py-8 ${
                                  errors.bodyType ? "border-red-500" : ""
                                }`}
                              >
                                <SelectValue placeholder="Select body type" />
                              </SelectTrigger>
                              <SelectContent>
                                {bodyTypes.map((bodyType) => (
                                  <SelectItem
                                    key={bodyType.label}
                                    value={bodyType.value}
                                  >
                                    {bodyType.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.bodyType && (
                          <p className="text-red-500 text-sm">
                            {errors.bodyType.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="bodyColor"
                          className="text-sm text-gray-500"
                        >
                          Exterior Color
                        </Label>
                        <Controller
                          name="bodyColor"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="bodyColor"
                              type="text"
                              placeholder="Grey"
                              className={`h-12 border-black/10 rounded-md py-8 ${
                                errors.bodyColor ? "border-red-500" : ""
                              }`}
                            />
                          )}
                        />
                        {errors.bodyColor && (
                          <p className="text-red-500 text-sm">
                            {errors.bodyColor.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="interiorColor"
                          className="text-sm text-gray-500"
                        >
                          Interior Color
                        </Label>
                        <Controller
                          name="interiorColor"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="interiorColor"
                              type="text"
                              placeholder="White"
                              className={`h-12 border-black/10 rounded-md py-8 ${
                                errors.interiorColor ? "border-red-500" : ""
                              }`}
                            />
                          )}
                        />
                        {errors.interiorColor && (
                          <p className="text-red-500 text-sm">
                            {errors.interiorColor.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Next Button */}
                    <div className="flex justify-end pt-8">
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="px-8 py-3 bg-primary text-primary-foreground hover:bg-primary-hover rounded cursor-pointer"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    {/* Images Upload */}
                    <div className="space-y-3">
                      <Label htmlFor="upload" className="text-sm text-gray-500">
                        Uploads
                      </Label>
                      <p className="text-xs text-gray-400">
                        Upload car images. Click the checkbox to mark the main
                        image for your listing.
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                          <Plus className="w-6 h-6 text-gray-500" />
                          <span className="mt-1 text-sm text-gray-500">
                            Add
                          </span>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {images.map((file, idx) => (
                          <div
                            key={idx}
                            className="relative w-full h-32 rounded-lg overflow-hidden border"
                          >
                            <Image
                              src={URL.createObjectURL(file)}
                              alt="Car Image"
                              fill
                              className="object-cover"
                            />
                            {/* Featured Badge */}
                            {idx === featuredImageIndex && (
                              <Checkbox
                                className="absolute top-1 left-1"
                                checked={true}
                              />
                            )}
                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full size-[20px] text-xs cursor-pointer hover:bg-black/70"
                            >
                              ✕
                            </button>
                            {/* Set as Featured Button */}
                            {idx !== featuredImageIndex && (
                              <Checkbox
                                className="absolute top-1 left-1"
                                checked={false}
                                onCheckedChange={() => setFeaturedImage(idx)}
                              />
                            )}
                          </div>
                        ))}
                        {c_id &&
                          carData?.images?.map((img: any, idx: number) => (
                            <div
                              key={`existing-${idx}`}
                              className="relative w-full h-32 rounded-lg overflow-hidden border"
                            >
                              <Image
                                src={img.image_url}
                                alt={img.caption || "Car Image"}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                      </div>
                      {errors.images && (
                        <p className="text-red-500 text-sm">
                          {errors.images.message}
                        </p>
                      )}
                    </div>
                    {/* Price + Sales Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="price"
                          className="text-sm text-gray-500"
                        >
                          Price
                        </Label>
                        <Controller
                          name="price"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="price"
                              type="number"
                              placeholder="Enter price"
                              className={`h-12 border-black/10 rounded-md py-8 ${
                                errors.price ? "border-red-500" : ""
                              }`}
                            />
                          )}
                        />
                        {errors.price && (
                          <p className="text-red-500 text-sm">
                            {errors.price.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="salesType"
                          className="text-sm text-gray-500"
                        >
                          Sales Type
                        </Label>
                        <Controller
                          name="salesType"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger
                                className={`w-full h-12 border-black/10 rounded-md py-8 ${
                                  errors.salesType ? "border-red-500" : ""
                                }`}
                              >
                                <SelectValue placeholder="Select sales type" />
                              </SelectTrigger>
                              <SelectContent>
                                {salesTypes.map((sale) => (
                                  <SelectItem key={sale} value={sale}>
                                    {sale}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.salesType && (
                          <p className="text-red-500 text-sm">
                            {errors.salesType.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-sm text-gray-500"
                      >
                        Description
                      </Label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            id="description"
                            placeholder="Write a short description about your car..."
                            className={`min-h-[120px] border-black/10 rounded-md ${
                              errors.description ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-6">
                      {/* Technical Features Section */}
                      <div className="border border-border rounded-lg">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                          <h2 className="text-gray-500">Technical Features</h2>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setShowAllTechnical(!showAllTechnical);
                            }}
                            className="flex items-center gap-2 text-sm"
                          >
                            {showAllTechnical ? "Show less" : "Show more"}
                            {showAllTechnical ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {visibleTechnicalFeatures.map((feature) => (
                              <div
                                key={feature.id}
                                className="flex items-center space-x-3"
                              >
                                <Checkbox
                                  id={feature.id}
                                  checked={feature.checked}
                                  onCheckedChange={(checked) =>
                                    handleTechnicalFeatureChange(
                                      feature.id,
                                      checked as boolean,
                                    )
                                  }
                                  className="w-5 h-5 transition-all duration-200 cursor-pointer"
                                />
                                <label
                                  htmlFor={feature.id}
                                  className="text-foreground cursor-pointer select-none text-sm"
                                >
                                  {feature.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Extras Section */}
                      <div className="border border-border rounded-lg">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                          <h2 className="text-gray-500">Extras</h2>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setShowAllExtras(!showAllExtras);
                            }}
                            className="flex items-center gap-2 text-sm"
                          >
                            {showAllExtras ? "Show less" : "Show more"}
                            {showAllExtras ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {visibleExtras.map((extra) => (
                              <div
                                key={extra.id}
                                className="flex items-center space-x-3"
                              >
                                <Checkbox
                                  id={extra.id}
                                  checked={extra.checked}
                                  onCheckedChange={(checked) =>
                                    handleExtraChange(
                                      extra.id,
                                      checked as boolean,
                                    )
                                  }
                                  className="w-5 h-5 transition-all duration-200 cursor-pointer"
                                />
                                <label
                                  htmlFor={extra.id}
                                  className="text-foreground cursor-pointer select-none text-sm"
                                >
                                  {extra.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between pt-8">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep(1)}
                        className="px-8 py-3 text-gray-600 hover:text-gray-800 cursor-pointer bg-gray-100 hover:bg-gray-200"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded min-w-[95px]"
                        disabled={isPostPending || isUpdatePending}
                      >
                        {isPostPending || isUpdatePending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <p>{c_id ? "Update" : "Submit"}</p>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
