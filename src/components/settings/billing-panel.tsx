"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    features: ["3 projects", "50 AI generations/mo", "Basic store copy"],
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "$49/mo",
    features: [
      "10 projects",
      "500 AI generations/mo",
      "Keyword research",
      "Screenshot mockups",
      "Competitor analysis",
      "Store integrations (Apple + Google)",
    ],
  },
  {
    id: "GROWTH",
    name: "Growth",
    price: "$149/mo",
    features: [
      "Unlimited projects",
      "Unlimited AI usage",
      "All integrations",
      "Priority support",
      "Custom locales",
      "Team members",
    ],
  },
];

export function BillingPanel({ plan }: { plan: string }) {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.url) {
        toast({ title: "Billing portal unavailable", description: json.error, variant: "destructive" });
        return;
      }
      window.location.href = json.url;
    } finally {
      setLoading(false);
    }
  }

  async function checkout(planId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        toast({ title: "Checkout failed", description: json.error, variant: "destructive" });
        return;
      }
      window.location.href = json.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Billing</CardTitle>
        <CardDescription>Manage your subscription and payment method.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Current plan</p>
            <div className="mt-1">
              <StatusBadge status={plan} />
            </div>
          </div>
          {plan !== "FREE" && (
            <Button variant="outline" size="sm" onClick={openPortal} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              Manage Subscription
            </Button>
          )}
        </div>

        {plan === "FREE" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {PLANS.filter((p) => p.id !== "FREE").map((p) => (
              <div key={p.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.price}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => checkout(p.id)}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Upgrade"}
                  </Button>
                </div>
                <ul className="space-y-1">
                  {p.features.map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
