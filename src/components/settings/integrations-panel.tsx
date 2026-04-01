"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { ExternalLink, Plug, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface IntegrationInfo {
  id: string;
  status: string;
  lastSyncedAt?: Date | null;
}

interface Props {
  integrationMap: Record<string, IntegrationInfo>;
}

const INTEGRATIONS = [
  {
    provider: "APPLE_APP_STORE_CONNECT",
    name: "Apple App Store Connect",
    description: "Push store listings directly to App Store Connect via the REST API.",
    icon: "🍎",
    docsUrl: "https://developer.apple.com/documentation/appstoreconnectapi",
    fields: [
      { key: "issuerId", label: "Issuer ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", type: "text" },
      { key: "keyId", label: "Key ID", placeholder: "XXXXXXXXXX", type: "text" },
      { key: "privateKey", label: "Private Key (.p8 contents)", placeholder: "-----BEGIN PRIVATE KEY-----\n...", type: "textarea" },
    ],
  },
  {
    provider: "GOOGLE_PLAY_DEVELOPER",
    name: "Google Play Developer",
    description: "Push store listings to Google Play via the Android Publisher API.",
    icon: "🤖",
    docsUrl: "https://developers.google.com/android-publisher",
    fields: [
      { key: "serviceAccountEmail", label: "Service Account Email", placeholder: "name@project.iam.gserviceaccount.com", type: "text" },
      { key: "privateKey", label: "Private Key (JSON key file → private_key field)", placeholder: "-----BEGIN RSA PRIVATE KEY-----\n...", type: "textarea" },
    ],
  },
  {
    provider: "REVENUECAT",
    name: "RevenueCat",
    description: "Connect subscription data for monetization insights.",
    icon: "💰",
    docsUrl: "https://www.revenuecat.com/docs/api-v1",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "text" },
    ],
  },
  {
    provider: "STRIPE",
    name: "Stripe",
    description: "Manage billing and subscription plans (configured via environment variables).",
    icon: "💳",
    docsUrl: "https://stripe.com/docs",
    fields: [], // managed via env
    envOnly: true,
  },
];

function IntegrationRow({ integration, existing }: { integration: typeof INTEGRATIONS[0]; existing?: IntegrationInfo }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function connect() {
    setSaving(true);
    try {
      const body = { ...form, provider: integration.provider };
      const res = await fetch(`/api/integrations/${integration.provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Connection failed", description: json.error, variant: "destructive" });
        return;
      }
      toast({ title: "Credentials saved", description: "Click 'Test' to verify the connection." });
      setOpen(false);
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    try {
      const res = await fetch(`/api/integrations/${integration.provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast({ title: "Test failed", description: json.error ?? "Connection error", variant: "destructive" });
        return;
      }
      toast({ title: "Connection verified!", description: json.apps ? `Found ${json.apps.length} app(s)` : undefined });
    } finally {
      setTesting(false);
    }
  }

  async function disconnect() {
    setDisconnecting(true);
    try {
      const res = await fetch(`/api/integrations/${integration.provider}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast({ title: "Disconnect failed", variant: "destructive" });
        return;
      }
      toast({ title: "Integration disconnected" });
      window.location.reload();
    } finally {
      setDisconnecting(false);
    }
  }

  const isConnected = existing?.status === "CONNECTED";
  const isPending = existing?.status === "PENDING";

  return (
    <div className="border-b last:border-b-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{integration.icon}</span>
          <div>
            <p className="text-sm font-medium">{integration.name}</p>
            <p className="text-xs text-muted-foreground">{integration.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {existing && <StatusBadge status={existing.status} />}

          {integration.envOnly ? (
            <a
              href={integration.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              Docs <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <>
              {existing && (
                <>
                  <Button size="sm" variant="outline" onClick={testConnection} disabled={testing}>
                    {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Test"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={disconnect}
                    disabled={disconnecting}
                  >
                    {disconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Disconnect"}
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant={existing ? "ghost" : "outline"}
                onClick={() => setOpen((v) => !v)}
              >
                {existing ? (
                  open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <><Plug className="mr-1.5 h-3.5 w-3.5" />Connect</>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {open && !integration.envOnly && (
        <div className="px-6 pb-5 space-y-3 bg-muted/30 border-t">
          <p className="text-xs text-muted-foreground pt-4">
            Enter your credentials below.{" "}
            <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
              View API docs <ExternalLink className="h-3 w-3" />
            </a>
          </p>
          {integration.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-xs">{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  rows={4}
                  placeholder={field.placeholder}
                  className="font-mono text-xs resize-none"
                  value={form[field.key] ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                />
              ) : (
                <Input
                  placeholder={field.placeholder}
                  className="font-mono text-xs"
                  value={form[field.key] ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={connect} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              Save Credentials
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function IntegrationsPanel({ integrationMap }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Integrations</CardTitle>
        <CardDescription>
          Connect your app stores and monetization platforms. Credentials are stored securely in your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {INTEGRATIONS.map((integration) => (
            <IntegrationRow
              key={integration.provider}
              integration={integration}
              existing={integrationMap[integration.provider]}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
