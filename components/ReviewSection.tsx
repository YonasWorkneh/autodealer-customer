"use client";

import { useState } from "react";
import { Star, ChevronDown, ChevronUp, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Review } from "@/app/types/Review";

interface ReviewSectionProps {
    carId: string;
}

const INITIAL_REVIEWS: Review[] = [
    {
        id: "1",
        user_name: "John Doe",
        rating: 5,
        comment: "This car is in excellent condition. Highly recommended!",
        created_at: new Date().toISOString(),
    },
    {
        id: "2",
        user_name: "Jane Smith",
        rating: 4,
        comment: "Great deal, but the interior could have been cleaner. Overall happy.",
        created_at: new Date().toISOString(),
    },
    {
        id: "3",
        user_name: "Mike Johnson",
        rating: 5,
        comment: "Smooth transaction and vertex car. The dealer was very professional.",
        created_at: new Date().toISOString(),
    },
];

export default function ReviewSection({ carId }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
    const [isExpanded, setIsExpanded] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);

    const handlePostReview = () => {
        if (!newComment || selectedRating === 0) return;

        const newReview: Review = {
            id: Math.random().toString(36).substr(2, 9),
            user_name: "You",
            rating: selectedRating,
            comment: newComment,
            created_at: new Date().toISOString(),
        };

        setReviews([newReview, ...reviews]);
        setNewComment("");
        setSelectedRating(0);
    };

    const visibleReviews = isExpanded ? reviews : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm sm:text-base">User Reviews</h3>
                {reviews.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs h-8 px-2 hover:bg-gray-100"
                    >
                        {isExpanded ? (
                            <span className="flex items-center gap-1">
                                Hide Reviews <ChevronUp className="w-3 h-3" />
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                Show Reviews ({reviews.length}) <ChevronDown className="w-3 h-3" />
                            </span>
                        )}
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                <AnimatePresence initial={false}>
                    {visibleReviews.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <Card className="bg-gray-50/50 border-none shadow-none">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                                            {review.user_name[0]}
                                        </div>
                                        <span className="text-xs font-medium">{review.user_name}</span>
                                        <div className="flex items-center ml-auto">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < review.rating
                                                        ? "text-yellow-500 fill-amber-400"
                                                        : "text-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">{review.comment}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold mb-2">Post a Review</p>
                <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => {
                        const ratingValue = i + 1;
                        return (
                            <button
                                key={i}
                                type="button"
                                className="cursor-pointer focus:outline-none"
                                onMouseEnter={() => setHoverRating(ratingValue)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setSelectedRating(ratingValue)}
                            >
                                <Star
                                    className={`w-5 h-5 transition-colors ${ratingValue <= (hoverRating || selectedRating)
                                        ? "text-yellow-500 fill-amber-400"
                                        : "text-gray-300"
                                        }`}
                                />
                            </button>
                        );
                    })}
                </div>
                <div className="relative">
                    <Textarea
                        placeholder="What do you think about this car?"
                        className="text-xs min-h-[80px] pr-10 resize-none bg-white border-gray-200 focus:border-black focus:ring-0"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                        onClick={handlePostReview}
                        disabled={!newComment || selectedRating === 0}
                        className={`absolute bottom-2 right-2 p-1.5 rounded-lg transition-colors ${newComment && selectedRating > 0
                            ? "bg-black text-white hover:bg-gray-800 cursor-pointer"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
