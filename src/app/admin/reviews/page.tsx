"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import {
  Star,
  CheckCircle2,
  XCircle,
  EyeOff,
  Filter,
  Plus,
  Save,
} from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newReview, setNewReview] = useState({
    customerName: "",
    businessName: "",
    city: "Lucknow",
    serviceName: "GST Return Filing Retainer",
    rating: 5,
    reviewText: "",
    status: "APPROVED",
  });

  async function fetchReviews() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data?.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });
      if (res.ok) {
        setCreating(false);
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = reviews.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Reviews & Testimonials Moderation
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Moderate genuine verified customer testimonials before publishing to public website and structured schema.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setCreating(!creating)}>
          <Plus className="w-4 h-4 mr-1" /> Add Verified Review
        </Button>
      </div>

      {/* Creation Modal */}
      {creating && (
        <Card variant="default" className="p-6 border-fyn-primary bg-emerald-50/20 space-y-4">
          <div className="flex items-center justify-between border-b border-fyn-slate-border pb-3">
            <h2 className="text-base font-bold font-heading text-fyn-slate">
              Record Customer Testimonial
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>
              Cancel
            </Button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Customer / Founder Name *</label>
                <Input
                  required
                  placeholder="e.g. Alok Verma"
                  value={newReview.customerName}
                  onChange={(e) => setNewReview({ ...newReview, customerName: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Business Name *</label>
                <Input
                  required
                  placeholder="e.g. Awadh BioPharma Pvt Ltd"
                  value={newReview.businessName}
                  onChange={(e) => setNewReview({ ...newReview, businessName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-fyn-slate mb-1">City *</label>
                <Input
                  required
                  placeholder="e.g. Lucknow"
                  value={newReview.city}
                  onChange={(e) => setNewReview({ ...newReview, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Service Delivered *</label>
                <Input
                  required
                  placeholder="e.g. Private Limited Company Registration"
                  value={newReview.serviceName}
                  onChange={(e) => setNewReview({ ...newReview, serviceName: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-bold text-fyn-slate mb-1">Rating (1 to 5 Stars)</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                  <option value={3}>3 Stars ★★★☆☆</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-fyn-slate mb-1">Review Feedback *</label>
              <textarea
                required
                rows={3}
                placeholder="The Fyntrust team completed our statutory GST filing smoothly..."
                value={newReview.reviewText}
                onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
                className="w-full p-3 rounded-xl border border-fyn-slate-border text-xs bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="primary" size="md" type="submit" disabled={actionLoading}>
                <Save className="w-4 h-4 mr-1" /> Publish Verified Review
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["ALL", "PENDING", "APPROVED", "REJECTED", "HIDDEN"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              statusFilter === st ? "bg-[#01574F] text-white font-bold" : "bg-white border text-fyn-slate"
            }`}
          >
            {st} {st === "PENDING" && pendingCount > 0 ? `(${pendingCount})` : ""}
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading reviews..." />
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No reviews found in this moderation view.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rev) => (
            <Card key={rev.id} variant="default" className="p-5 border-fyn-slate-border space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>

                  <Badge
                    variant={
                      rev.status === "APPROVED"
                        ? "accent"
                        : rev.status === "PENDING"
                        ? "warning"
                        : "danger"
                    }
                    size="sm"
                  >
                    {rev.status}
                  </Badge>
                </div>

                <p className="text-xs text-fyn-slate font-medium leading-relaxed italic">
                  "{rev.reviewText}"
                </p>

                <div className="text-[11px] text-fyn-slate-muted pt-1">
                  <strong className="text-fyn-slate">{rev.customerName}</strong> • {rev.businessName} ({rev.city})
                  <span className="block text-[10px] text-fyn-primary font-semibold">{rev.serviceName}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-fyn-slate-border flex items-center justify-between gap-2">
                <span className="text-[10px] text-fyn-slate-muted">
                  {new Date(rev.createdAt).toLocaleDateString("en-IN")}
                </span>

                <div className="flex items-center gap-1.5">
                  {rev.status !== "APPROVED" && (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => handleUpdateStatus(rev.id, "APPROVED")}
                      disabled={actionLoading}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                  )}

                  {rev.status !== "REJECTED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(rev.id, "REJECTED")}
                      disabled={actionLoading}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                    </Button>
                  )}

                  {rev.status !== "HIDDEN" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateStatus(rev.id, "HIDDEN")}
                      disabled={actionLoading}
                    >
                      <EyeOff className="w-3.5 h-3.5 mr-1" /> Hide
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
