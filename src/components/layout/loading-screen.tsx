'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function LoadingScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // Simular o esperar a que la app esté lista. 
        // En una app real esto podría estar ligado a un estado global de "ready".
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2000); // 2 segundos de splash mínimo como pidió el usuario

        const removeTimer = setTimeout(() => {
            setShouldRender(false);
        }, 2500); // Dar tiempo a la animación de fade-out

        return () => {
            clearTimeout(timer);
            clearTimeout(removeTimer);
        };
    }, []);

    if (!shouldRender) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] transition-opacity duration-500 ease-in-out",
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
        >
            <div className="relative flex flex-col items-center gap-6 animate-pulse">
                <img
                    src="/assets/logo_big.png"
                    alt="MeteoClan Logo"
                    className="w-48 md:w-64 h-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                />
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );
}
