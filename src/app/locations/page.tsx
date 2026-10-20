"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import {
  MapPin,
  Search,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Globe2,
} from "lucide-react";

export default function LocationsDirectoryPage() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("ALL");

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true);
        const res = await fetch("/api/public/cities");
        if (res.ok) {
          const json = await res.json();
          setCities(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
  }, []);

  const states = Array.from(new Set(cities.map((c) => c.state))).filter(Boolean);

  const filtered = cities.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      (c.shortDescription && c.shortDescription.toLowerCase().includes(q));
    const matchesState = selectedState === "ALL" || c.state === selectedState;
    return matchesSearch && matchesState;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-body py-12 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
      <Breadcrumbs items={[{ name: "PAN India Locations", url: "/locations" }]} />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="accent" size="md">
          PAN India Coverage
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-bold font-heading text-fyn-slate">
          PAN India CA, Tax & Legal Service Network
        </h1>
        <p className="text-sm sm:text-base text-fyn-slate-muted leading-relaxed">
          Fyntrust delivers premier Chartered Accountancy, Company Registration, GST & Virtual CFO services across every major commercial hub and industrial district in India.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by city or state (e.g. Lucknow, Delhi, Mumbai)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSelectedState("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              selectedState === "ALL" ? "bg-[#01574F] text-white font-bold" : "bg-white border text-fyn-slate"
            }`}
          >
            All States
          </button>
          {states.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                selectedState === st ? "bg-[#01574F] text-white font-bold" : "bg-white border text-fyn-slate"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Locations Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading PAN India location network..." />
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No cities found matching your search. Try searching for "Lucknow", "Delhi", "Mumbai", or "Varanasi".
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((city) => (
            <Link key={city.id} href={`/ca-services/${city.slug}`} className="group">
              <Card
                variant="default"
                className="h-full p-6 border-fyn-slate-border hover:border-fyn-primary hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-fyn-primary uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {city.state}
                    </span>
                    {city.isPopular && (
                      <Badge variant="accent" size="sm">
                        Major Hub
                      </Badge>
                    )}
                  </div>

                  <h2 className="text-lg font-bold font-heading text-fyn-slate group-hover:text-fyn-primary transition-colors">
                    CA Services in {city.name}
                  </h2>

                  <p className="text-xs text-fyn-slate-muted leading-relaxed line-clamp-2">
                    {city.shortDescription || `Certified CA & CS business advisory for enterprises, startups, and traders in ${city.name}.`}
                  </p>
                </div>

                <div className="pt-3 border-t border-fyn-slate-border flex items-center justify-between text-xs font-bold text-[#01574F]">
                  <span>Explore Local Services</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Corporate Offices Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#142A2B] to-[#01574F] text-white space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[#78BB69]" />
          <h2 className="text-xl sm:text-2xl font-bold font-heading">Fyntrust Corporate Offices</h2>
        </div>
        <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
          In addition to full digital PAN India coverage, Fyntrust operates physical corporate offices in Lucknow (Hazratganj Financial District) and Ghazipur (Commercial Complex) to support local business founders.
        </p>
        <div className="pt-2">
          <Link href="/contact">
            <Button variant="accent" size="sm" className="font-bold">
              Book Office Appointment →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
