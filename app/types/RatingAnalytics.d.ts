export interface ReviewItem {
  email: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface RatingAnalytics {
  car_id: number;
  car_dealer_id: number;
  car_make_ref_name: string;
  car_model_ref_name: string;
  average_rating: number;
  total_ratings: number;
  rating_1: number;
  rating_2: number;
  rating_3: number;
  rating_4: number;
  rating_5: number;
  reviews: ReviewItem[];
}
