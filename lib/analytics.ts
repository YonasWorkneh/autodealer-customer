import { API_BASE_URL } from "./config";
import { getCredentials } from "./credential";

export async function fetchBuyerAnalytics() {
  const credential = await getCredentials();
  const res = await fetch(`${API_BASE_URL}/analytics/buyer-analytics/`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch analytics: ${res.status} ${res.statusText}`,
    );
  }

  const data = await res.json();
  console.log("buyer-analytics response:", data);
  return data;
}
