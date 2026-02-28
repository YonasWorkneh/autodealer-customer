import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  fetchCars,
  fetchCarById,
  fetchMakes,
  fetchModels,
  postCar,
  getMyAds,
  deleteCar,
  makeCarFavorite,
  carFavorites,
  removeCarFavorite,
  getPopularCars,
  getMarketData,
  placeBid,
  fetchRatingAnalytics,
  postCarRating,
  postLead,
  postCarInspection,
} from "@/lib/carApi";
import { FetchedCarDetail, type FetchedCar } from "@/app/types/Car";
import type { Car } from "@/app/types/Car";
import type { RatingAnalytics } from "@/app/types/RatingAnalytics";

export function useCars() {
  return useQuery<FetchedCar[]>({
    queryKey: ["cars"],
    queryFn: () => fetchCars(1, 1000), // Fetch all for backward compatibility
  });
}

export function useCarsInfinite() {
  return useInfiniteQuery<FetchedCar[]>({
    queryKey: ["cars-infinite"],
    queryFn: ({ pageParam = 1 }) => fetchCars(pageParam as number, 20),
    getNextPageParam: (lastPage, allPages) => {
      // If last page has fewer items than limit, we've reached the end
      if (lastPage.length < 20) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
}

export function useCar(id: string) {
  return useQuery<FetchedCarDetail>({
    queryKey: ["car", id],
    queryFn: () => fetchCarById(id),
    enabled: !!id, // only run if id exists
  });
}

export function useMakes() {
  return useQuery({
    queryKey: ["makes"],
    queryFn: fetchMakes,
  });
}

export function useModels(makeId?: number) {
  return useQuery({
    queryKey: ["models", makeId],
    queryFn: () => fetchModels(makeId),
    enabled: makeId !== undefined,
  });
}

export function usePostCar(
  onError?: () => void,
  onSuccess?: (car: Car) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => postCar(formData),
    onError: () => {
      onError?.();
    },
    onSuccess: (data: Car) => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["my-ads"] });
      onSuccess?.(data);
    },
  });
}

export function usePostCarInspection() {
  return useMutation({
    mutationFn: postCarInspection,
  });
}

export function useMyAds(id: number | undefined) {
  return useQuery({
    queryKey: ["my-ads"],
    queryFn: () => getMyAds(id),
    enabled: id !== undefined,
  });
}

export function useUpdateCar(onError?: () => void, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => postCar(formData),
    onError: () => {
      console.log("error");
      onError?.();
    },
    onSuccess: () => {
      // refresh list of cars after posting
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
  });
}

export function useDeleteCar(onError?: () => void, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCar(id),
    onError: (err) => {
      console.log("error", err);
      onError?.();
    },
    onSuccess: (data) => {
      console.log("data", data);
      onSuccess?.();
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["my-ads", "cars"] }),
  });
}

export function useUpdateCarViews() {
  return useMutation({});
}

export function useUpdateFavorite(
  onSuccess?: () => void,
  onError?: () => void,
) {
  return useMutation({
    mutationFn: (id: number) => makeCarFavorite(id),
    onSuccess: () => onSuccess?.(),
    onError: () => onError?.(),
    onSettled: () => console.log(" settled"),
  });
}
export function useCarFavorites() {
  return useQuery({ queryKey: ["car-favorites"], queryFn: carFavorites });
}

export function useRemoveFavorite(
  onSuccess?: () => void,
  onError?: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeCarFavorite(id),
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["car-favorites"] });
    },
    onError: () => onError?.(),
  });
}

export function usePopularCars() {
  return useQuery({
    queryKey: ["popular-cars"],
    queryFn: getPopularCars,
  });
}

export function useMarketData() {
  return useQuery({
    queryKey: ["market-data"],
    queryFn: getMarketData,
  });
}

export function usePlaceBid(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ car, amount }: { car: number; amount: number }) =>
      placeBid(car, amount),
    onSuccess: () => {
      onSuccess?.();
      // Invalidate car queries to refresh bid data
      queryClient.invalidateQueries({ queryKey: ["car"] });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}

export function useRatingAnalytics(carId: string | number | undefined) {
  return useQuery<RatingAnalytics[]>({
    queryKey: ["rating-analytics", carId],
    queryFn: () => fetchRatingAnalytics(carId as string | number),
    enabled: !!carId,
  });
}

export function usePostCarRating(
  carId: string | number | undefined,
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string }) =>
      postCarRating(Number(carId), rating, comment),
    onSuccess: () => {
      onSuccess?.();
      // Invalidate rating analytics to refresh the data
      queryClient.invalidateQueries({ queryKey: ["rating-analytics", carId] });
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}

export function usePostLead(
  onSuccess?: () => void,
  onError?: (error: Error) => void,
) {
  return useMutation({
    mutationFn: ({ name, contact }: { name: string; contact: string }) =>
      postLead(name, contact),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}
