"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { formatCurrency } from "@/lib/utils";
import { Users, Building2, Phone, Mail, MapPin, ArrowLeft, ShoppingBag, FileText, Receipt, ShieldCheck } from "lucide-react";

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    city: "",
    state: "",
    address: "",
    gstNumber: "",
    panNumber: "",
    isActive: true,
  });

  async function fetchCustomer() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/customers/${id}`);
      if (res.ok) {
        const json = await res.json();
        setCustomer(json.data);
        setFormData({
          businessName: json.data.businessName || "",
          businessType: json.data.businessType || "",
          city: json.data.city || "",
          state: json.data.state || "",
          address: json.data.address || "",
          gstNumber: json.data.gstNumber || "",
          panNumber: json.data.panNumber || "",
          isActive: json.data.user?.isActive ?? true,
        });
      }
    } catch (err) {
      console.error("Failed to load customer:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setEditing(false);
        fetchCustomer();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading customer profile..." />
      </div>
    );
  }

  if (!customer) {
    return <div className="p-8 text-center text-xs text-fyn-slate-muted">Customer not found.</div>;
  }

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-fyn-slate-border pb-6">
        <div className="space-y-1">
          <Link href="/admin/customers" className="text-xs font-bold text-fyn-primary flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading text-fyn-slate">
              {customer.businessName}
            </h1>
            <Badge variant={customer.user?.isActive ? "accent" : "danger"} size="sm">
              {customer.user?.isActive ? "Active Account" : "Deactivated"}
            </Badge>
          </div>
        </div>

        <Button variant={editing ? "ghost" : "outline"} size="sm" onClick={() => setEditing(!editing)}>
          {editing ? "Cancel Editing" : "Edit Enterprise Details"}
        </Button>
      </div>

      {/* Enterprise Details / Edit Form */}
      {editing ? (
        <Card variant="default" className="p-6 border-fyn-slate-border">
          <form onSubmit={handleUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-fyn-slate mb-1">Company / Entity Name</label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">Business Constitution</label>
              <Input
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">City</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">State</label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">GSTIN</label>
              <Input
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-fyn-slate mb-1">PAN Number</label>
              <Input
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                className="text-xs font-mono uppercase"
              />
            </div>
            <div className="sm:col-span-2">
              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card variant="default" className="p-5 border-fyn-slate-border space-y-2 text-xs">
            <span className="text-fyn-slate-muted block font-semibold text-[11px]">Primary Applicant</span>
            <div className="font-bold text-fyn-slate text-sm font-heading">{customer.user?.fullName}</div>
            <div className="text-fyn-slate-muted">{customer.user?.mobile}</div>
            <div className="text-fyn-slate-muted">{customer.user?.email}</div>
          </Card>

          <Card variant="default" className="p-5 border-fyn-slate-border space-y-2 text-xs">
            <span className="text-fyn-slate-muted block font-semibold text-[11px]">Statutory Identifiers</span>
            <div>GSTIN: <strong className="font-mono text-fyn-slate">{customer.gstNumber || "Not Provided"}</strong></div>
            <div>PAN: <strong className="font-mono text-fyn-slate uppercase">{customer.panNumber || "Not Provided"}</strong></div>
            <div>Registered: <span className="text-fyn-slate-muted">{new Date(customer.createdAt).toLocaleDateString()}</span></div>
          </Card>

          <Card variant="default" className="p-5 border-fyn-slate-border space-y-2 text-xs">
            <span className="text-fyn-slate-muted block font-semibold text-[11px]">Account Overview</span>
            <div>Orders: <strong>{customer.orders?.length || 0}</strong></div>
            <div>Invoices: <strong>{customer.invoices?.length || 0}</strong></div>
            <div>Documents in Vault: <strong>{customer.documents?.length || 0}</strong></div>
          </Card>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-heading text-fyn-slate">Active & Past Filings</h2>
        <div className="bg-white rounded-2xl border border-fyn-slate-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-fyn-slate-border text-fyn-slate font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.orders?.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-fyn-primary">{o.orderNumber}</td>
                    <td className="p-4 font-semibold text-fyn-slate">{o.service?.name}</td>
                    <td className="p-4 font-bold text-fyn-slate font-heading">{formatCurrency(o.totalAmount)}</td>
                    <td className="p-4"><Badge variant="primary" size="sm">{o.status}</Badge></td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/orders/${o.id}`}>
                        <Button variant="ghost" size="sm">Manage →</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
