
'use client';

import { Sun, Thermometer, CalendarDays, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export function Header() {
  const { locale, setLocale } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity" aria-label="MeteoClan Home">
          <img
            src="/assets/logo_full.png"
            alt="MeteoClan"
            className="h-10 w-auto"
            onError={(e) => {
              e.currentTarget.src = ''; // Fallback placeholder if image fails
              e.currentTarget.alt = 'MeteoClan';
            }}
          />
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

          <div className="pl-2 border-l border-border/40 ml-1 flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-12 px-0 font-bold uppercase hover:bg-white/10">
                  {locale}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur">
                <DropdownMenuItem onClick={() => setLocale('es')} className="font-medium cursor-pointer">
                  ES - Español
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('en')} className="font-medium cursor-pointer">
                  EN - English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('pt')} className="font-medium cursor-pointer">
                  PT - Português
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
