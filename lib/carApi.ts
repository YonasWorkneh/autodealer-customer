import type { Car, FetchedCar, FetchedCarDetail } from "@/app/types/Car"; // move your interfaces to a types file for reusability
import { Favorite } from "@/app/types/Favorite";
import type { Make } from "@/app/types/Make";
import type { Model } from "@/app/types/Model";
import { getCredentials } from "./credential";
import type { MarketData } from "@/app/types/Market";
import type { RatingAnalytics } from "@/app/types/RatingAnalytics";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchCars(
  page: number = 1,
  limit: number = 20,
): Promise<FetchedCar[]> {
  const url = `/inventory/cars/?page=${page}&limit=${limit}`;
  return fetcher<FetchedCar[]>(url);
}

export async function fetchCarById(id: string): Promise<FetchedCarDetail> {
  const credential = await getCredentials();
  return fetcher<FetchedCarDetail>(`/inventory/cars/${id}`);
}

export async function fetchMakes(): Promise<Make[]> {
  return fetcher<Make[]>("/inventory/makes/");
}

export async function fetchModels(makeId?: number): Promise<Model[]> {
  const url = makeId
    ? `/inventory/models/?make=${makeId}`
    : "/inventory/models/";
  return fetcher<Model[]>(url);
}

export async function postCar(formData: FormData): Promise<Car> {
  const credential = await getCredentials();

  return fetcher<Car>("/inventory/cars/", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${credential.access}`,
    },
  });
}

export async function getMyAds(id: number | undefined) {
  if (!id) return [];
  const credential = await getCredentials();
  const myAds = await fetcher<FetchedCar[]>("/inventory/user-cars/", {
    headers: {
      Authorization: `Bearer ${credential.access}`,
    },
  });
  return myAds;
}

export async function deleteCar(id: number) {
  const credential = await getCredentials();
  const res = await fetch(`${BASE_URL}/inventory/cars/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${credential.access}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Delete failed: ${res.status} ${res.statusText}`);
  }

  // Return something serializable (plain object)
  return { success: true, id };
}

export async function updateCarViews(car_id: number, ip_address: string) {
  const crednetial = await getCredentials();
  const res = await fetch(`${BASE_URL}/inventory/car-views/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${crednetial.access}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ip_address, car_id }),
  });
  const data = await res.json();
}

export async function makeCarFavorite(id: number) {
  const credential = await getCredentials();
  try {
    const res = await fetch(`${BASE_URL}/inventory/car-favorites/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credential.access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ car: id }),
    });
    if (!res.ok) throw new Error(`Something went wrong`);
  } catch (err) {
    throw err;
  }
}

export async function carFavorites() {
  const credential = await getCredentials();
  try {
    const res = await fetch(`${BASE_URL}/inventory/car-favorites/`, {
      headers: {
        Authorization: `Bearer ${credential.access}`,
      },
    });
    if (!res.ok) throw new Error("Error fetching favorite cars.");
    const data: Favorite[] = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}

export async function removeCarFavorite(id: number) {
  const credential = await getCredentials();
  try {
    const res = await fetch(`${BASE_URL}/inventory/car-favorites/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${credential.access}`,
      },
    });
    if (!res.ok) throw new Error("Error removing favorite car.");
    return { success: true, id };
  } catch (err) {
    throw err;
  }
}

export async function getPopularCars() {
  try {
    const popularCars = await fetcher<FetchedCar[]>("/inventory/popular-cars/");
    return popularCars;
  } catch (err) {
    throw err;
  }
}

export async function getMarketData() {
  const credential = await getCredentials();
  try {
    return await fetcher<MarketData>("/inventory/cars/buyer-analytics", {
      headers: {
        Authorization: `Bearer ${credential.access}`,
      },
    });
  } catch (err) {
    throw err;
  }
}

export async function placeBid(car: number, amount: number) {
  const credential = await getCredentials();
  try {
    const res = await fetch(`${BASE_URL}/bids/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credential.access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ car, amount }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to place bid: ${res.status} ${res.statusText}`,
      );
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export async function fetchRatingAnalytics(
  carId: string | number,
): Promise<RatingAnalytics[]> {
  const credential = await getCredentials();
  try {
    const url = `/analytics/rating_analytics/?car_id=${carId}`;
    return fetcher<RatingAnalytics[]>(url, {
      headers: {
        Authorization: `Bearer ${credential.access}`,
      },
    });
  } catch (err) {
    throw err;
  }
}

export async function postCarRating(
  carId: number,
  rating: number,
  comment: string,
) {
  const credential = await getCredentials();
  try {
    const res = await fetch(`${BASE_URL}/ratings/car-ratings/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credential.access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        car: carId,
        rating: rating,
        comment: comment,
      }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to post rating: ${res.status} ${res.statusText}`,
      );
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export type CarInspectionPayload = {
  car_id: number;
  inspected_by: string;
  inspection_date: string;
  remarks: string;
  condition_status: "excellent" | "good" | "fair" | "poor";
};

export async function postCarInspection(payload: CarInspectionPayload) {
  const credential = await getCredentials();
  const res = await fetch(`${BASE_URL}/inventory/car-inspections/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credential.access}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        errorData.detail ||
        `Failed to submit inspection: ${res.status} ${res.statusText}`,
    );
  }
  return res.json();
}

export async function postLead(name: string, contact: string) {
  const credential = await getCredentials();
  try {
    const res = await fetch(`${BASE_URL}/sales/leads/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credential.access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        contact: contact,
        status: "inquiry",
      }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(
        errorData.message ||
          `Failed to submit inquiry: ${res.status} ${res.statusText}`,
      ) as Error & { response?: any; data?: any };
      error.response = errorData;
      error.data = errorData;
      throw error;
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}
