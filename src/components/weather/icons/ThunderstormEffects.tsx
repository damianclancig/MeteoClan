'use client';

import React, { useState, useEffect, useRef } from 'react';

// ─── Constantes ───────────────────────────────────────────────
const BOLT_POSITIONS = [
  { left: '72%', top: '22%' },
  { left: '32%', top: '18%' },
  { left: '52%', top: '25%' },
];
const LIGHTNING_ASSETS = [
  '/assets/weather/lightning01.webp?v=2',
  '/assets/weather/lightning02.webp?v=2',
  '/assets/weather/lightning03.webp?v=2',
];
const BOLT_SIZES: Record<string, string> = {
  '/assets/weather/lightning01.webp?v=2': '240%',
  '/assets/weather/lightning02.webp?v=2': '60%',
  '/assets/weather/lightning03.webp?v=2': '240%',
};

interface BoltState {
  visible: boolean;
  asset: string;
  position: { left: string; top: string };
  flipped: boolean;
}
const OFF_BOLT: BoltState = {
  visible: false,
  asset: LIGHTNING_ASSETS[0],
  position: BOLT_POSITIONS[0],
  flipped: false,
};

const rnd = (min: number, max: number) => min + Math.random() * (max - min);

interface StormProps {
  onCloudFlash: React.Dispatch<React.SetStateAction<boolean>>;
}

function useLatestCallback<T extends (...args: never[]) => unknown>(cb: T): React.RefObject<T> {
  const ref = useRef(cb);
  ref.current = cb;
  return ref;
}

const BoltLayer: React.FC<{ bolt: BoltState }> = ({ bolt }) => {
  if (!bolt.visible) return null;
  return (
    <>
      <style>{`
        @keyframes boltAppear {
          0%   { opacity: 0; }
          10%  { opacity: 1; }
          80%  { opacity: 0.9; }
          100% { opacity: 0; }
        }
      `}</style>
      <img
        src={bolt.asset}
        className="absolute h-auto object-contain z-[8] pointer-events-none"
        style={{
          width: BOLT_SIZES[bolt.asset] ?? '240%',
          top: bolt.position.top,
          left: bolt.position.left,
          transform: `translateX(-50%)${bolt.flipped ? ' scaleX(-1)' : ''}`,
          animation: 'boltAppear 0.15s linear forwards',
          transition: 'none',
        }}
      />
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// TORMENTA LIGERA (210)
// ─────────────────────────────────────────────────────────────
export const LightStorm: React.FC<StormProps> = ({ onCloudFlash }) => {
  const [bolt, setBolt] = useState<BoltState>(OFF_BOLT);
  const boltRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudActiveRef = useRef(false);
  const cloudCb = useLatestCallback(onCloudFlash);

  const fireBolt = () => {
    const asset = LIGHTNING_ASSETS[Math.floor(Math.random() * LIGHTNING_ASSETS.length)];
    const pos = BOLT_POSITIONS[Math.floor(Math.random() * BOLT_POSITIONS.length)];
    setBolt({ visible: true, asset, position: pos, flipped: Math.random() > 0.5 });
    setTimeout(() => setBolt(OFF_BOLT), 150);
  };

  const flashCloud = () => {
    if (cloudActiveRef.current) return;
    cloudActiveRef.current = true;
    cloudCb.current?.(true);
    setTimeout(() => { cloudCb.current?.(false); cloudActiveRef.current = false; }, 130);
  };

  useEffect(() => {
    const schedule = () => {
      boltRef.current = setTimeout(() => {
        fireBolt();
        if (Math.random() < 0.5) flashCloud();
        const extra = Math.random() < 0.25 ? rnd(3000, 7000) : 0;
        boltRef.current = setTimeout(schedule, extra);
      }, rnd(5000, 9000));
    };
    boltRef.current = setTimeout(schedule, rnd(500, 2000));
    return () => { if (boltRef.current) clearTimeout(boltRef.current); };
  }, []);

  useEffect(() => {
    const schedule = () => {
      cloudRef.current = setTimeout(() => {
        flashCloud();
        schedule();
      }, rnd(2000, 4000));
    };
    cloudRef.current = setTimeout(schedule, rnd(100, 3000));
    return () => { if (cloudRef.current) clearTimeout(cloudRef.current); };
  }, []);

  return <BoltLayer bolt={bolt} />;
};

// ─────────────────────────────────────────────────────────────
// TORMENTA MEDIA (211)
// ─────────────────────────────────────────────────────────────
export const ModerateStorm: React.FC<StormProps> = ({ onCloudFlash }) => {
  const [bolt, setBolt] = useState<BoltState>(OFF_BOLT);
  const boltRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudActiveRef = useRef(false);
  const cloudCb = useLatestCallback(onCloudFlash);

  const fireBolt = () => {
    const asset = LIGHTNING_ASSETS[Math.floor(Math.random() * LIGHTNING_ASSETS.length)];
    const pos = BOLT_POSITIONS[Math.floor(Math.random() * BOLT_POSITIONS.length)];
    setBolt({ visible: true, asset, position: pos, flipped: Math.random() > 0.5 });
    setTimeout(() => setBolt(OFF_BOLT), 150);
  };

  useEffect(() => {
    const schedule = () => {
      boltRef.current = setTimeout(() => {
        fireBolt();
        if (Math.random() < 0.25) setTimeout(fireBolt, rnd(180, 320));
        const extra = Math.random() < 0.18 ? rnd(3000, 5000) : 0;
        boltRef.current = setTimeout(schedule, extra);
      }, rnd(2000, 4000));
    };
    boltRef.current = setTimeout(schedule, rnd(500, 1500));
    return () => { if (boltRef.current) clearTimeout(boltRef.current); };
  }, []);

  useEffect(() => {
    const schedule = () => {
      cloudRef.current = setTimeout(() => {
        if (!cloudActiveRef.current) {
          cloudActiveRef.current = true;
          cloudCb.current?.(true);
          setTimeout(() => { cloudCb.current?.(false); cloudActiveRef.current = false; }, 130);
        }
        schedule();
      }, rnd(3500, 7000));
    };
    cloudRef.current = setTimeout(schedule, rnd(1000, 3000));
    return () => { if (cloudRef.current) clearTimeout(cloudRef.current); };
  }, []);

  return <BoltLayer bolt={bolt} />;
};

// ─────────────────────────────────────────────────────────────
// TORMENTA FUERTE (212)
// ─────────────────────────────────────────────────────────────
export const HeavyStorm: React.FC<StormProps> = ({ onCloudFlash }) => {
  const [bolt, setBolt] = useState<BoltState>(OFF_BOLT);
  const boltRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudActiveRef = useRef(false);
  const cloudCb = useLatestCallback(onCloudFlash);

  const fireBolt = (delay = 0) => {
    setTimeout(() => {
      const asset = LIGHTNING_ASSETS[Math.floor(Math.random() * LIGHTNING_ASSETS.length)];
      const pos = BOLT_POSITIONS[Math.floor(Math.random() * BOLT_POSITIONS.length)];
      setBolt({ visible: true, asset, position: pos, flipped: Math.random() > 0.5 });
      setTimeout(() => setBolt(OFF_BOLT), 150);
    }, delay);
  };

  useEffect(() => {
    const schedule = () => {
      boltRef.current = setTimeout(() => {
        const r = Math.random();
        const burst = r < 0.15 ? 3 : r < 0.4 ? 2 : 1;
        for (let i = 0; i < burst; i++) fireBolt(i * rnd(180, 280));
        const extra = Math.random() < 0.08 ? rnd(2000, 4000) : 0;
        boltRef.current = setTimeout(schedule, extra);
      }, rnd(1200, 2500));
    };
    boltRef.current = setTimeout(schedule, rnd(200, 800));
    return () => { if (boltRef.current) clearTimeout(boltRef.current); };
  }, []);

  useEffect(() => {
    const schedule = () => {
      cloudRef.current = setTimeout(() => {
        if (!cloudActiveRef.current) {
          cloudActiveRef.current = true;
          cloudCb.current?.(true);
          setTimeout(() => { cloudCb.current?.(false); cloudActiveRef.current = false; }, 130);
        }
        schedule();
      }, rnd(900, 1600));
    };
    cloudRef.current = setTimeout(schedule, rnd(100, 400));
    return () => { if (cloudRef.current) clearTimeout(cloudRef.current); };
  }, []);

  return <BoltLayer bolt={bolt} />;
};

// ─────────────────────────────────────────────────────────────
// TORMENTA EXTREMA / RAGGED (221)
// - Secuencias de 3-5 rayos ultra rápidos
// - Pausas de ~1 segundo entre secuencias
// - Flashing de nubes constante y agresivo
// ─────────────────────────────────────────────────────────────
export const ExtremeStorm: React.FC<StormProps> = ({ onCloudFlash }) => {
  const [bolt, setBolt] = useState<BoltState>(OFF_BOLT);
  const boltRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudActiveRef = useRef(false);
  const cloudCb = useLatestCallback(onCloudFlash);

  const fireBolt = (delay = 0) => {
    setTimeout(() => {
      const asset = LIGHTNING_ASSETS[Math.floor(Math.random() * LIGHTNING_ASSETS.length)];
      const pos = BOLT_POSITIONS[Math.floor(Math.random() * BOLT_POSITIONS.length)];
      setBolt({ visible: true, asset, position: pos, flipped: Math.random() > 0.5 });
      setTimeout(() => setBolt(OFF_BOLT), 140);
    }, delay);
  };

  const flashCloud = () => {
    if (cloudActiveRef.current) return;
    cloudActiveRef.current = true;
    cloudCb.current?.(true);
    setTimeout(() => { cloudCb.current?.(false); cloudActiveRef.current = false; }, 120);
  };

  // Loop de Rayos en Secuencias (3-5 disparos + pausa breve)
  useEffect(() => {
    const scheduleBurst = () => {
      const burstCount = Math.floor(rnd(3, 6)); // 3 a 5
      for (let i = 0; i < burstCount; i++) {
        // Disparos dentro de la ráfaga
        fireBolt(i * rnd(150, 250));
        // Sincronizar algunos flashes con los rayos
        if (Math.random() < 0.7) setTimeout(flashCloud, i * rnd(150, 250));
      }
      
      // Programar la siguiente ráfaga tras ~1 segundo de pausa
      boltRef.current = setTimeout(scheduleBurst, rnd(900, 1300));
    };

    boltRef.current = setTimeout(scheduleBurst, 500);
    return () => { if (boltRef.current) clearTimeout(boltRef.current); };
  }, []);

  // Loop de Flashes de Nubes independiente (muy frecuente)
  useEffect(() => {
    const schedule = () => {
      cloudRef.current = setTimeout(() => {
        flashCloud();
        schedule();
      }, rnd(400, 900));
    };
    cloudRef.current = setTimeout(schedule, 200);
    return () => { if (cloudRef.current) clearTimeout(cloudRef.current); };
  }, []);

  return <BoltLayer bolt={bolt} />;
};
