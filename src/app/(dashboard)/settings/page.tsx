import { requireAuth, getWorkspace } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { Header } from "@/components/layout/header";
import { IntegrationsPanel } from "@/components/settings/integrations-panel";
import { BillingPanel } from "@/components/settings/billing-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoIntegrations } from "@/lib/demo/store";
import { Building2, User, CreditCard, Plug } from "lucide-react";

export const metadata = { title: "Settings" };

const PLAN_STYLES: Record<string, { label: string; className: string }> = {
  FREE:    { label: "Free",    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
  STARTER: { label: "Starter", className: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  GROWTH:  { label: "Growth",  className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
};

export default async function SettingsPage() {
  const session = await requireAuth();
  const workspace = await getWorkspace(session.user.id!);
  if (!workspace) return null;

  const integrations = isDemoMode
    ? getDemoIntegrations()
    : await db.integration.findMany({
        where: { workspaceId: workspace.id },
      });

  const integrationMap = Object.fromEntries(
    integrations.map((i) => [i.provider, { id: i.id, status: i.status, lastSyncedAt: i.lastSyncedAt }])
  );

  const planStyle = PLAN_STYLES[workspace.plan] ?? PLAN_STYLES.FREE;

  return (
    <div>
      <Header title="Settings" subtitle="Manage your workspace, integrations and billing" />
      <div className="p-6 space-y-5 max-w-3xl">

        {/* Workspace */}
        <Card>
          <CardHeader className="py-4 px-5 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-500/10 p-1.5">
                <Building2 className="h-4 w-4 text-blue-500" />
              </div>
              <CardTitle className="text-sm font-semibold">Workspace</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Workspace name</p>
                <p className="text-sm font-semibold">{workspace.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Current plan</p>
                <Badge className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border-0 ${planStyle.className}`}>
                  {planStyle.label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations (interactive, client component) */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="rounded-lg bg-violet-500/10 p-1.5">
              <Plug className="h-4 w-4 text-violet-500" />
            </div>
            <h2 className="text-sm font-semibold">Integrations</h2>
          </div>
          <IntegrationsPanel integrationMap={integrationMap} />
        </div>

        {/* Billing */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="rounded-lg bg-emerald-500/10 p-1.5">
              <CreditCard className="h-4 w-4 text-emerald-500" />
            </div>
            <h2 className="text-sm font-semibold">Billing</h2>
          </div>
          <BillingPanel plan={workspace.plan} />
        </div>

        {/* Account */}
        <Card>
          <CardHeader className="py-4 px-5 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-orange-500/10 p-1.5">
                <User className="h-4 w-4 text-orange-500" />
              </div>
              <CardTitle className="text-sm font-semibold">Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid gap-4 sm:grid-cols-2 mb-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-semibold">{session.user.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Name</p>
                <p className="text-sm font-semibold">{session.user.name ?? "—"}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" size="sm">Change password</Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
