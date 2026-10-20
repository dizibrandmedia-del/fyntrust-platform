"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import {
  MapPin,
  Search,
  Plus,
  ExternalLink,
  CheckCircle2,
  Save,
} from "lucide-react";

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingCity, setEditingCity] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  async function fetchCities() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cities");
      if (res.ok) {
        const json = await res.json();
        setCities(json.data?.cities || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCities();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCity) return;

    try {
      setSaving(true);
      const isNew = !editingCity.id;
      const url = isNew ? "/api/admin/cities" : `/api/admin/cities/${editingCity.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCity),
      });

      if (res.ok) {
        fetchCities();
        setEditingCity(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = cities.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            PAN India Cities & Regional Hubs
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Manage regional CA coverage, local branch profiles, and city-level landing page availability.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            setEditingCity({
              name: "",
              slug: "",
              state: "Uttar Pradesh",
              shortDescription: "",
              isPopular: false,
              featuredStatus: false,
              status: "ACTIVE",
            })
          }
        >
          <Plus className="w-4 h-4 mr-1" /> Add New City Hub
        </Button>
      </div>

      {/* Editor Card */}
      {editingCity && (
        <Card variant="default" className="p-6 border-fyn-primary bg-emerald-50/20 space-y-4">
          <div className="flex items-center justify-between border-b border-fyn-slate-border pb-3">
            <h2 className="text-base font-bold font-heading text-fyn-slate">
              {editingCity.id ? `Edit City: ${editingCity.name}` : "Add New City Hub"}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setEditingCity(null)}>
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">City Name *</label>
                <Input
                  required
                  placeholder="e.g. Lucknow"
                  value={editingCity.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = editingCity.id ? editingCity.slug : name.toLowerCase().replace(/\s+/g, "-");
                    setEditingCity({ ...editingCity, name, slug });
                  }}
                />
              </div>

              <div>
                <label className="block font-bold text-fyn-slate mb-1">Slug *</label>
                <Input
                  required
                  placeholder="e.g. lucknow"
                  value={editingCity.slug}
                  onChange={(e) => setEditingCity({ ...editingCity, slug: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-fyn-slate mb-1">State *</label>
                <Input
                  required
                  placeholder="e.g. Uttar Pradesh"
                  value={editingCity.state}
                  onChange={(e) => setEditingCity({ ...editingCity, state: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-fyn-slate mb-1">Short Regional Description</label>
              <textarea
                rows={2}
                placeholder="Brief summary of local industrial presence and tax circles..."
                value={editingCity.shortDescription || ""}
                onChange={(e) => setEditingCity({ ...editingCity, shortDescription: e.target.value })}
                className="w-full p-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingCity.isPopular}
                  onChange={(e) => setEditingCity({ ...editingCity, isPopular: e.target.checked })}
                />
                <span className="font-bold text-fyn-slate">Major Commercial Hub (Featured on Homepage)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingCity.featuredStatus}
                  onChange={(e) => setEditingCity({ ...editingCity, featuredStatus: e.target.checked })}
                />
                <span className="font-bold text-fyn-slate">Featured Status</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="primary" size="md" type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save City Details"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search by city name, state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 text-xs"
        />
      </div>

      {/* Cities Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading cities..." />
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No cities found. Click "Add New City Hub" above to create one.
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">City</th>
                  <th className="p-4">State</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Hub Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((city) => (
                  <tr key={city.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-fyn-slate">
                      {city.name}
                    </td>
                    <td className="p-4 text-fyn-slate font-medium">
                      {city.state}
                    </td>
                    <td className="p-4 font-mono text-fyn-primary">
                      /ca-services/{city.slug}
                    </td>
                    <td className="p-4">
                      {city.isPopular ? (
                        <Badge variant="accent" size="sm">Major Hub</Badge>
                      ) : (
                        <span className="text-fyn-slate-muted text-[11px]">Regional</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={city.isActive ? "accent" : "warning"} size="sm">
                        {city.status || "ACTIVE"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingCity(city)}>
                          Edit
                        </Button>
                        <Link href={`/ca-services/${city.slug}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
