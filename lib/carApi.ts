import type { Car, FetchedCar } from "@/app/types/Car"; // move your interfaces to a types file for reusability
import { Favorite } from "@/app/types/Favorite";
import type { Make } from "@/app/types/Make";
import type { Model } from "@/app/types/Model";
import { getCredentials } from "./credential";
import type { MarketData } from "@/app/types/Market";

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

export async function fetchCars(): Promise<FetchedCar[]> {
  return fetcher<FetchedCar[]>("/inventory/cars/");
}

export async function fetchCarById(id: string): Promise<FetchedCar> {
  const credential = await getCredentials();
  return fetcher<FetchedCar>(`/inventory/cars/${id}`);
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
  const myAds = await fetcher<FetchedCar[]>("/inventory/cars/", {
    headers: {
      Authorization: `Bearer ${credential.access}`,
    },
  });
  return myAds.filter((car) => car.broker === id);
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
    const res = await fetch(`${BASE_URL}/api/bids/`, {
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
          `Failed to place bid: ${res.status} ${res.statusText}`
      );
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}
