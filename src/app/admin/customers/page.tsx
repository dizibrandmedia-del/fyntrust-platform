"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { Users, Search, Building2, Phone, Mail, MapPin } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/customers");
        if (res.ok) {
          const json = await res.json();
          setCustomers(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load customers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const s = search.toLowerCase();
    return (
      (c.businessName && c.businessName.toLowerCase().includes(s)) ||
      (c.user?.fullName && c.user.fullName.toLowerCase().includes(s)) ||
      (c.user?.email && c.user.email.toLowerCase().includes(s)) ||
      (c.user?.mobile && c.user.mobile.includes(s)) ||
      (c.city && c.city.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-fyn-slate">
            Customer Enterprises & Clients
          </h1>
          <p className="text-xs sm:text-sm text-fyn-slate-muted">
            Manage registered Indian businesses, GSTIN/PAN legal profiles, active subscriptions, and compliance accounts.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card variant="default" className="p-4 border-fyn-slate-border">
        <div className="max-w-md">
          <Input
            placeholder="Search by Company, Name, Phone, Email, City..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />
        </div>
      </Card>

      {/* Customers List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading customer directory..." />
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-xs text-fyn-slate-muted border-fyn-slate-border">
          No customer accounts found.
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Business Entity</th>
                  <th className="p-4">Primary Contact</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Orders & Filings</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-fyn-slate font-heading">{c.businessName}</div>
                      <div className="text-[10px] text-fyn-slate-muted">{c.businessType || "Private Limited"}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-fyn-slate">{c.user?.fullName}</div>
                      <div className="text-[10px] text-fyn-slate-muted">{c.user?.mobile} • {c.user?.email}</div>
                    </td>
                    <td className="p-4 text-fyn-slate-muted">
                      {c.city || "Lucknow"}, {c.state || "UP"}
                    </td>
                    <td className="p-4">
                      <Badge variant="neutral" size="sm">
                        {c.orders?.length || 0} Orders
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={c.user?.isActive ? "accent" : "danger"} size="sm">
                        {c.user?.isActive ? "Active" : "Deactivated"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/customers/${c.id}`}>
                        <Button variant="outline" size="sm" className="font-bold">
                          View Profile →
                        </Button>
                      </Link>
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
