
'use client';

import { Sun, Thermometer, CalendarDays, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity" aria-label="WeatherWise Home">
          <Sun className="h-6 w-6 mr-2 text-yellow-400" aria-hidden="true" />
          <span className="font-bold text-xl">WeatherWise</span>
        </Link>
        <div className="flex items-center space-x-1 relative">
          <Button variant="ghost" size="icon" asChild>
            <Link href="#current-weather" aria-label="Go to current weather">
              <Thermometer />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="#forecast" aria-label="Go to 6-day forecast">
              <CalendarDays />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="#moon-calendar" aria-label="Go to moon calendar">
              <Moon />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
