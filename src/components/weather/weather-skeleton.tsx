'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/glass-card";

export function WeatherSkeleton() {
    return (
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Current Weather Skeleton */}
            <div className="lg:col-span-3">
                <GlassCard className="p-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-start mb-8">
                        <div className="flex flex-col items-center md:items-start gap-2 w-full">
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-5 h-5 rounded-full" />
                                <Skeleton className="h-8 w-48" />
                            </div>
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-6 mb-8">
                        <Skeleton className="h-6 w-32" />
                        <div className="flex items-center justify-center gap-8 w-full">
                            <div className="flex flex-col items-center gap-2">
                                <Skeleton className="h-16 w-32 md:h-20 md:w-48" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-2 p-3 bg-white/5 rounded-lg">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        ))}
                    </div>

                    {/* Hourly Forecast Skeleton */}
                    <div className="mt-8 pb-2 overflow-hidden">
                        <div className="flex space-x-4 overflow-x-hidden">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="flex flex-col items-center p-2 rounded-lg gap-2 min-w-[70px] bg-white/5">
                                    <Skeleton className="h-3 w-10" />
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <Skeleton className="h-4 w-8" />
                                    <Skeleton className="h-3 w-6" />
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Forecast Skeleton */}
            <div className="lg:col-span-3">
                <GlassCard className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-7 w-40" />
                        <Skeleton className="h-9 w-20" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center p-4 rounded-lg bg-white/5 gap-3">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <div className="flex flex-col items-center gap-1">
                                    <Skeleton className="h-5 w-8" />
                                    <Skeleton className="h-4 w-6" />
                                </div>
                                <Skeleton className="h-4 w-10" />
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Moon Calendar Skeleton */}
            <div className="lg:col-span-3">
                <GlassCard className="p-6">
                    <div className="flex flex-col items-center gap-4">
                        <Skeleton className="h-7 w-48" />
                        <div className="flex flex-col md:flex-row items-center gap-8 w-full justify-center">
                            <Skeleton className="w-32 h-32 rounded-full" />
                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
