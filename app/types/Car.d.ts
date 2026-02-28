export interface Car {
  id: number;
  // Required fields
  make_ref: string;
  model_ref: string;
  year: number;
  price: string; // $decimal
  mileage: number;
  fuel_type: "Electric" | "Hybrid" | "Petrol" | "Diesel";
  seller: {
    id: number;
    is_verified: boolean;
    name: string;
    type: "dealer" | "broker" | "buyer";
  };
  seller_average_rating?: number;

  // Optional fields
  alarm_anti_theft?: boolean;
  all_wheel_steering?: boolean;
  archieved?: boolean;
  aux_audio_in?: boolean;
  bluetooth?: boolean;
  body_kit?: boolean;
  body_type?:
    | "Sedan"
    | "SUV"
    | "Truck"
    | "Coupe"
    | "Hatchback"
    | "Convertible"
    | "Wagon"
    | "Van"
    | "Other";
  broker?: number;
  cassette_player?: boolean;
  climate_control?: boolean;
  cooled_seats?: boolean;
  convertible?: boolean;
  cruise_control?: boolean;
  dealer?: number;
  description?: string;
  delivered?: boolean;
  dual_exhaust?: boolean;
  dvd_player?: boolean;
  electric?: boolean;
  exterior_color?: string;
  fog_lights?: boolean;
  front_airbags?: boolean;
  hybrid?: boolean;
  keyless_entry?: boolean;
  keyless_start?: boolean;
  leather_seats?: boolean;
  make?: string;
  mileage?: number;
  model?: string;
  navigation_system?: boolean;
  n2o_system?: boolean;
  off_road_kit?: boolean;
  off_road_tyres?: boolean;
  parking_sensors?: boolean;
  performance_tyres?: boolean;
  petrol?: boolean;
  power_locks?: boolean;
  power_mirrors?: boolean;
  power_seats?: boolean;
  power_steering?: boolean;
  power_sunroof?: boolean;
  power_windows?: boolean;
  posted_by?: number;
  premium_lights?: boolean;
  premium_paint?: boolean;
  premium_sound_system?: boolean;
  premium_wheels_rims?: boolean;
  rear_view_camera?: boolean;
  rwd?: boolean;
  sale_type?: "Fixed Price" | "Auction";
  satellite_radio?: boolean;
  side_airbags?: boolean;
  sold?: boolean;
  status?:
    | "Available"
    | "live"
    | "Reserved"
    | "Sold"
    | "Pending Inspection"
    | "Under Maintenance"
    | "Delivered"
    | "rejected"
    | "payment-pending"
    | "expired"
    | "Archived";
  sunroof?: boolean;
  tiptronic_gears?: boolean;
  truck?: boolean;
  trim?: string;
  turbo?: boolean;
  van?: boolean;
  vehicle_condition?: "New" | "Used";
  vhs_player?: boolean;
  wagon?: boolean;
  winch?: boolean;
  year_model?: number;
  uploaded_images?: Array<object>;
  drivetrain?: "FWD" | "RWD" | "AWD" | "4WD";
  /** Display by iterating this array of feature strings (preferred over individual boolean fields) */
  features?: string[];
}

export interface Feature {
  id: string;
  label: string;
  checked: boolean;
  field: string;
}

export type CarImage = {
  id: number;
  car: number;
  image_url: string;
  is_featured: boolean;
  caption: string | null;
  uploaded_at: string; // ISO timestamp
};

export type FetchedCar = {
  id: number;
  make: string;
  model: string;
  year: number;
  price: string; // decimal stored as string
  model_ref: number;
  make_ref: number;
  features?: string[];
  body_type:
    | "sedan"
    | "suv"
    | "truck"
    | "coupe"
    | "hatchback"
    | "convertible"
    | "wagon"
    | "van"
    | "other"
    | string;
  sale_type: "fixed_price" | "auction" | string;
  status: "available" | "sold" | "reserved" | string;
  featured_image: string;
  seller: string;
  created_at: string; // ISO timestamp
};

export type FetchedCarDetail = {
  id: number;
  dealer: number | null;
  broker: number | null;
  posted_by: number;

  images: CarImage[];
  bids: any[];

  verification_status: "pending" | "verified" | "rejected";
  seller: {
    id: number;
    is_verified: boolean;
    name: string;
    type: "dealer" | "broker" | "buyer";
  };
  seller_average_rating: number | null;

  make_ref: number;
  model_ref: number;
  dealer_average_rating: number | null;
  broker_average_rating: number | null;

  make: string;
  model: string;
  year: number;
  price: string; // decimal stored as string
  mileage: number;
  fuel_type: "petrol" | "diesel" | "electric" | "hybrid" | string;
  body_type:
    | "sedan"
    | "suv"
    | "truck"
    | "coupe"
    | "hatchback"
    | "convertible"
    | "wagon"
    | "van"
    | "other"
    | string;

  exterior_color: string;
  interior_color: string;
  engine: string;
  drivetrain: "fwd" | "rwd" | "awd" | "4wd" | string;
  condition: "new" | "used" | string;
  trim: string | null;
  description: string;

  status: "available" | "sold" | "reserved" | string;
  sale_type: "fixed_price" | "auction" | string;
  auction_end: string | null;
  priority: boolean;

  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  /** Display by iterating this array of feature strings */
  features: string[];
}
