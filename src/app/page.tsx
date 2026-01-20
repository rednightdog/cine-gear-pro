import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-[#FDF5E6] text-[#1A1A1A]">
      <div className="z-10 max-w-3xl space-y-12">

        {/* Minimal Hero */}
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-serif italic tracking-tight text-[#1A1A1A]">
            CineBrain Pro
          </h1>
          <p className="text-lg md:text-xl font-sans font-light tracking-wide opacity-80 max-w-xl mx-auto leading-relaxed">
            The professional standard for building camera kits. <br className="hidden md:block" />
            Comprehensive database. Precise lists. Production ready.
          </p>
        </div>

        {/* Text-Only Actions */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-8">
          <Link
            href="/inventory"
            className="group flex items-center text-lg font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:opacity-60 transition-opacity"
          >
            Browse Catalog
            <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/builder"
            className="text-lg font-mono opacity-60 hover:opacity-100 hover:underline transition-all"
          >
            Go to My Kits
          </Link>
        </div>

        {/* Minimal Features List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-20 text-left border-t border-black/10 mt-12">
          <div className="space-y-2">
            <h3 className="font-serif italic text-xl">Production Ready</h3>
            <p className="text-sm opacity-60 font-sans leading-relaxed">
              Manage complex packages with serials and compatibility checks.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-serif italic text-xl">Extensive Database</h3>
            <p className="text-sm opacity-60 font-sans leading-relaxed">
              Detailed specs for Arri, RED, Sony, Cooke, and more.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-serif italic text-xl">Smart Kits</h3>
            <p className="text-sm opacity-60 font-sans leading-relaxed">
              Build templates for different shooting scenarios quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
