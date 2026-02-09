"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { useNotifications, useMarkNotificationAsRead } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Trash2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/store/user";

export default function NotificationsPage() {
    const { data: notifications, isLoading, refetch, isRefetching } = useNotifications();
    const markAsRead = useMarkNotificationAsRead();
    const { user } = useUserStore();

    const handleMarkAsRead = (id: number) => {
        markAsRead.mutate(id);
    };

    const sortedNotifications = notifications?.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            <Header color="black" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                        <p className="mt-1 text-gray-500">
                            Stay updated with your latest activities
                        </p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${isRefetching ? 'animate-spin' : ''}`}
                        title="Refresh notifications"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse h-24"></div>
                        ))}
                    </div>
                ) : sortedNotifications?.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
                        <p className="text-gray-500 mt-1">We'll notify you when something important happens.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedNotifications?.map((notification: any) => (
                            <div
                                key={notification.id}
                                className={`group relative bg-white p-6 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${!notification.is_read ? 'border-l-4 border-l-primary bg-primary/5' : 'border-gray-100'
                                    }`}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`text-lg font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </h3>
                                            {!notification.is_read && (
                                                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">New</span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 leading-relaxed">{notification.message}</p>
                                        <p className="text-xs text-gray-400 mt-3 font-medium">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
