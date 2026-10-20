"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import {
  Search,
  Globe,
  Plus,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Save,
} from "lucide-react";

export default function AdminSeoPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function fetchSeoPages() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/seo");
      if (res.ok) {
        const json = await res.json();
        setPages(json.data?.pages || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSeoPages();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    try {
      setSaving(true);
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPage),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchSeoPages();
        setEditingPage(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = pages.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.slug.toLowerCase().includes(q) ||
      p.metaTitle.toLowerCase().includes(q) ||
      (p.pageType && p.pageType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            SEO & Metadata Command Centre
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Configure canonical tags, Open Graph previews, JSON-LD schema, and search engine robots directives across all routes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            setEditingPage({
              pageType: "CUSTOM",
              slug: "",
              metaTitle: "",
              metaDescription: "",
              canonicalUrl: "",
              ogTitle: "",
              ogDescription: "",
              robotsIndex: true,
              robotsFollow: true,
              schemaType: "WebPage",
              sitemapIncluded: true,
            })
          }
        >
          <Plus className="w-4 h-4 mr-1" /> Add Custom Page SEO
        </Button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          ✓ SEO metadata updated successfully!
        </div>
      )}

      {/* Editor Modal / Drawer */}
      {editingPage && (
        <Card variant="default" className="p-6 border-fyn-primary bg-emerald-50/20 space-y-4">
          <div className="flex items-center justify-between border-b border-fyn-slate-border pb-3">
            <h2 className="text-base font-bold font-heading text-fyn-slate">
              {editingPage.id ? `Edit SEO: /${editingPage.slug}` : "New SEO Configuration"}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setEditingPage(null)}>
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Page Slug / Route *</label>
                <Input
                  required
                  placeholder="e.g. ca-services/lucknow or services/gst-registration"
                  value={editingPage.slug}
                  onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-fyn-slate mb-1">Schema Type</label>
                <select
                  value={editingPage.schemaType || "WebPage"}
                  onChange={(e) => setEditingPage({ ...editingPage, schemaType: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                >
                  <option value="WebPage">WebPage</option>
                  <option value="FinancialService">FinancialService</option>
                  <option value="Service">Service</option>
                  <option value="LocalBusiness">LocalBusiness</option>
                  <option value="FAQPage">FAQPage</option>
                  <option value="Article">Article</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-fyn-slate mb-1">Meta Title (Max 60 chars) *</label>
              <Input
                required
                maxLength={70}
                placeholder="e.g. Top Chartered Accountant in Lucknow | Fyntrust"
                value={editingPage.metaTitle}
                onChange={(e) => setEditingPage({ ...editingPage, metaTitle: e.target.value })}
              />
              <span className="text-[10px] text-fyn-slate-muted">{editingPage.metaTitle?.length || 0} / 70 characters</span>
            </div>

            <div>
              <label className="block font-bold text-fyn-slate mb-1">Meta Description (Max 160 chars) *</label>
              <textarea
                required
                maxLength={165}
                rows={2}
                placeholder="Brief compelling description summarizing the statutory service..."
                value={editingPage.metaDescription}
                onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                className="w-full p-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
              />
              <span className="text-[10px] text-fyn-slate-muted">{editingPage.metaDescription?.length || 0} / 165 characters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Canonical URL (Optional)</label>
                <Input
                  placeholder="https://fyntrust.in/..."
                  value={editingPage.canonicalUrl || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, canonicalUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-bold text-fyn-slate mb-1">OG Image URL (Optional)</label>
                <Input
                  placeholder="/images/fyntrust-og.png"
                  value={editingPage.ogImage || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, ogImage: e.target.value })}
                />
              </div>
            </div>

            {/* Robots Checkboxes */}
            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPage.robotsIndex}
                  onChange={(e) => setEditingPage({ ...editingPage, robotsIndex: e.target.checked })}
                />
                <span className="font-bold text-fyn-slate">Index (Allow Google Search Indexing)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPage.robotsFollow}
                  onChange={(e) => setEditingPage({ ...editingPage, robotsFollow: e.target.checked })}
                />
                <span className="font-bold text-fyn-slate">Follow (Follow internal links)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPage.sitemapIncluded}
                  onChange={(e) => setEditingPage({ ...editingPage, sitemapIncluded: e.target.checked })}
                />
                <span className="font-bold text-fyn-slate">Include in XML Sitemap</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="primary" size="md" type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save SEO Metadata"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Filter by route slug, title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 text-xs"
        />
      </div>

      {/* Pages Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading SEO registry..." />
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No SEO configuration records found.
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Route Slug</th>
                  <th className="p-4">Meta Title</th>
                  <th className="p-4">Robots</th>
                  <th className="p-4">Schema Type</th>
                  <th className="p-4">Sitemap</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-fyn-primary">
                      /{p.slug}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-fyn-slate line-clamp-1">{p.metaTitle}</div>
                      <div className="text-[10px] text-fyn-slate-muted line-clamp-1">{p.metaDescription}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant={p.robotsIndex ? "accent" : "warning"} size="sm">
                        {p.robotsIndex ? "INDEX" : "NOINDEX"}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-fyn-slate-muted">
                      {p.schemaType || "WebPage"}
                    </td>
                    <td className="p-4">
                      {p.sitemapIncluded ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400" />
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => setEditingPage(p)}>
                        Edit SEO
                      </Button>
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
