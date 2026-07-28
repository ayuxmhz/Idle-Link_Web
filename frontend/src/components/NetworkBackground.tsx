"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  layer: number;
  phase: number;
  hue: "purple" | "blue" | "magenta";
  focal?: boolean;
}

interface Packet {
  a: number;
  b: number;
  progress: number;
  speed: number;
}

// Small/slow/dim particles read as "further back"; larger/faster/brighter
// ones read as "closer" — combined with the mouse-parallax offset below,
// this is what sells the sense of depth without any real 3D.
const LAYERS = [
  { count: 8, speed: 0.035, size: [1, 1.5] as const, parallax: 3 },
  { count: 6, speed: 0.07, size: [1.5, 2.2] as const, parallax: 7 },
  { count: 4, speed: 0.11, size: [2, 3] as const, parallax: 12 },
];

const HUES: Record<Particle["hue"], string> = {
  purple: "167,139,250",
  blue: "96,165,250",
  magenta: "217,141,214",
};

const PACKET_COUNT = 3;

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const particles: Particle[] = [];
    const packets: Packet[] = [];
    const mouse = { x: 0, y: 0, active: false };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      mouse.x = width / 2;
      mouse.y = height / 2;
    }

    const hues: Particle["hue"][] = ["purple", "blue", "magenta"];

    function init() {
      particles.length = 0;
      LAYERS.forEach((layer, li) => {
        for (let i = 0; i < layer.count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * layer.speed,
            vy: (Math.random() - 0.5) * layer.speed,
            r: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
            layer: li,
            phase: Math.random() * Math.PI * 2,
            hue: hues[Math.floor(Math.random() * hues.length)],
          });
        }
      });

      // The focal cluster: one larger, brighter node near the visual center
      // that other nearby nodes read as orbiting/feeding into.
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * width * 0.15,
        y: height / 2 + (Math.random() - 0.5) * height * 0.15,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        r: 4.2,
        layer: 2,
        phase: 0,
        hue: "purple",
        focal: true,
      });

      packets.length = 0;
      for (let i = 0; i < PACKET_COUNT; i++) {
        packets.push(spawnPacket());
      }
    }

    function spawnPacket(): Packet {
      const a = Math.floor(Math.random() * particles.length);
      let b = Math.floor(Math.random() * particles.length);
      if (b === a) b = (b + 1) % particles.length;
      return { a, b, progress: Math.random(), speed: 0.25 + Math.random() * 0.2 };
    }

    let raf = 0;
    let t = 0;

    function frame() {
      t += 0.016;
      ctx!.clearRect(0, 0, width, height);

      // Connections — the focal node gets a wider, brighter reach so it
      // reads as the hub the smaller nodes cluster around.
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const isFocalEdge = a.focal || b.focal;
          const maxDist = isFocalEdge ? Math.min(width, height) * 0.6 : Math.min(width, height) * 0.36;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * (isFocalEdge ? 0.28 : 0.16);
            ctx!.strokeStyle = `rgba(${HUES[a.hue]},${opacity})`;
            ctx!.lineWidth = isFocalEdge ? 0.8 : 0.5;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // Tiny light packets traveling continuously between nodes.
      for (const packet of packets) {
        packet.progress += 0.0035 * packet.speed * 60;
        if (packet.progress >= 1) {
          const next = spawnPacket();
          packet.a = next.a;
          packet.b = next.b;
          packet.speed = next.speed;
          packet.progress = 0;
        }
        const a = particles[packet.a];
        const b = particles[packet.b];
        if (!a || !b) continue;
        const eased = easeInOutSine(packet.progress);
        const px = a.x + (b.x - a.x) * eased;
        const py = a.y + (b.y - a.y) * eased;
        ctx!.beginPath();
        ctx!.arc(px, py, 1.4, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${HUES[a.hue]},0.85)`;
        ctx!.shadowColor = `rgba(${HUES[a.hue]},0.6)`;
        ctx!.shadowBlur = 4;
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Gentle pull toward nearby cursor — a soft field, not a hard snap.
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 90;
          if (dist < radius && dist > 0.01) {
            const force = (1 - dist / radius) * 0.012;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
          p.vx *= 0.98;
          p.vy *= 0.98;
        }

        const layer = LAYERS[Math.min(p.layer, LAYERS.length - 1)];
        const offsetX = ((mouse.x - width / 2) / width) * layer.parallax;
        const offsetY = ((mouse.y - height / 2) / height) * layer.parallax;

        const breathe = 0.5 + 0.5 * Math.sin(t * 0.8 + p.phase);
        const baseOpacity = p.focal ? 0.55 : 0.25;
        const opacity = baseOpacity + breathe * (p.focal ? 0.35 : 0.4);
        const radius = p.focal ? p.r + breathe * 0.8 : p.r;

        ctx!.beginPath();
        ctx!.arc(p.x + offsetX, p.y + offsetY, radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${HUES[p.hue]},${opacity})`;
        ctx!.shadowColor = `rgba(${HUES[p.hue]},${p.focal ? 0.55 : 0.4})`;
        ctx!.shadowBlur = p.focal ? 10 : 3.5;
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }

      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }

    function handleMouseLeave() {
      mouse.active = false;
    }

    const ro = new ResizeObserver(() => {
      resize();
      init();
    });
    ro.observe(canvas);
    resize();
    init();
    frame();
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#080A12" }}>
      {/* Soft floating gradient blobs — purple, blue, magenta */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-6 w-28 h-28 rounded-full bg-purple-600/20 blur-2xl animate-float-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 right-0 w-24 h-24 rounded-full bg-blue-600/15 blur-2xl animate-float-slower"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-fuchsia-500/10 blur-2xl animate-float-slow"
      />

      {/* Extremely subtle grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:20px_20px]"
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
