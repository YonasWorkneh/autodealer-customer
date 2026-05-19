import { useQuery } from "@tanstack/react-query";
import { fetchBuyerAnalytics } from "@/lib/analytics";

export function useBuyerAnalytics() {
  return useQuery({
    queryKey: ["buyer-analytics"],
    queryFn: fetchBuyerAnalytics,
  });
}
