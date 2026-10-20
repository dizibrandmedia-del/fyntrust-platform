"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import {
  Search as SearchIcon,
  Briefcase,
  Wrench,
  MapPin,
  FileText,
  ArrowRight,
} from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({
    services: [],
    tools: [],
    cities: [],
    articles: [],
  });

  async function executeSearch(searchTerm: string) {
    if (!searchTerm.trim()) {
      setResults({ services: [], tools: [], cities: [], articles: [] });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/public/search?q=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const json = await res.json();
        setResults(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const totalCount =
    results.services.length +
    results.tools.length +
    results.cities.length +
    results.articles.length;

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="accent" size="md">
          Platform Search
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-fyn-slate">
          Search Services, Calculators & Regional Desks
        </h1>
        <p className="text-xs sm:text-sm text-fyn-slate-muted">
          Find Chartered Accountant services, free compliance tools, local branches, and statutory guides.
        </p>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-xl mx-auto pt-2">
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="e.g. GST registration, TDS calculator, Lucknow, Virtual CFO..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 text-xs"
            />
          </div>
          <Button variant="primary" size="md" type="submit" disabled={loading}>
            Search
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Searching Fyntrust directory..." />
        </div>
      ) : query && totalCount === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border space-y-3">
          <p className="text-sm font-bold text-fyn-slate">No results found for "{query}"</p>
          <p>Try searching for "GST", "Income Tax", "Accounting", "Company Registration", or "Lucknow".</p>
        </Card>
      ) : (
        <div className="space-y-10">
          {/* Services Results */}
          {results.services.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-heading text-fyn-slate flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-fyn-primary" /> CA & Financial Services ({results.services.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.services.map((srv: any) => (
                  <Link key={srv.id} href={`/services/${srv.slug}`}>
                    <Card variant="default" className="p-5 border-fyn-slate-border hover:border-fyn-primary hover:shadow-md transition-all space-y-2 h-full flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-fyn-slate font-heading">{srv.name}</h3>
                        <p className="text-xs text-fyn-slate-muted line-clamp-2">{srv.shortDescription}</p>
                      </div>
                      <div className="pt-2 border-t border-fyn-slate-border flex items-center justify-between text-xs font-bold text-[#01574F]">
                        <span>View Service</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tools Results */}
          {results.tools.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-heading text-fyn-slate flex items-center gap-2">
                <Wrench className="w-4 h-4 text-fyn-primary" /> Free Calculators & Tools ({results.tools.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.tools.map((tool: any) => (
                  <Link key={tool.slug} href={`/tools/${tool.slug}`}>
                    <Card variant="default" className="p-5 border-fyn-slate-border hover:border-fyn-primary hover:shadow-md transition-all space-y-2 h-full flex flex-col justify-between">
                      <div className="space-y-1">
                        <Badge variant="accent" size="sm">{tool.category}</Badge>
                        <h3 className="font-bold text-sm text-fyn-slate font-heading">{tool.title}</h3>
                        <p className="text-xs text-fyn-slate-muted line-clamp-2">{tool.description}</p>
                      </div>
                      <div className="pt-2 border-t border-fyn-slate-border flex items-center justify-between text-xs font-bold text-[#01574F]">
                        <span>Launch Tool</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Regional Desks */}
          {results.cities.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-heading text-fyn-slate flex items-center gap-2">
                <MapPin className="w-4 h-4 text-fyn-primary" /> Regional CA Hubs ({results.cities.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.cities.map((city: any) => (
                  <Link key={city.id} href={`/ca-services/${city.slug}`}>
                    <Card variant="default" className="p-5 border-fyn-slate-border hover:border-fyn-primary hover:shadow-md transition-all space-y-2 h-full flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-fyn-slate-muted uppercase tracking-wider font-bold">{city.state}</span>
                        <h3 className="font-bold text-sm text-fyn-slate font-heading">CA Services in {city.name}</h3>
                        <p className="text-xs text-fyn-slate-muted line-clamp-2">{city.shortDescription}</p>
                      </div>
                      <div className="pt-2 border-t border-fyn-slate-border flex items-center justify-between text-xs font-bold text-[#01574F]">
                        <span>Explore {city.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Guides & Articles */}
          {results.articles.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-heading text-fyn-slate flex items-center gap-2">
                <FileText className="w-4 h-4 text-fyn-primary" /> Knowledge Guides & Articles ({results.articles.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.articles.map((art: any, idx: number) => (
                  <Link key={idx} href="/resources">
                    <Card variant="default" className="p-5 border-fyn-slate-border hover:border-fyn-primary hover:shadow-md transition-all space-y-2 h-full flex flex-col justify-between">
                      <div className="space-y-1">
                        <Badge variant="neutral" size="sm">{art.category}</Badge>
                        <h3 className="font-bold text-sm text-fyn-slate font-heading">{art.title}</h3>
                        <p className="text-xs text-fyn-slate-muted line-clamp-2">{art.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-fyn-slate-border flex items-center justify-between text-xs font-bold text-[#01574F]">
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PublicSearchPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] font-body py-12 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      <Breadcrumbs items={[{ name: "Search", url: "/search" }]} />
      <Suspense fallback={<div className="py-20 flex justify-center"><Loader size="lg" text="Loading search..." /></div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
