import { requireAuth, getWorkspace } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/shared/status-badge";
import { IntegrationsPanel } from "@/components/settings/integrations-panel";
import { BillingPanel } from "@/components/settings/billing-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireAuth();
  const workspace = await getWorkspace(session.user.id!);
  if (!workspace) return null;

  const integrations = await db.integration.findMany({
    where: { workspaceId: workspace.id },
  });

  const integrationMap = Object.fromEntries(
    integrations.map((i) => [i.provider, { id: i.id, status: i.status, lastSyncedAt: i.lastSyncedAt }])
  );

  return (
    <div>
      <Header title="Settings" />
      <div className="p-6 space-y-6 max-w-3xl">
        {/* Workspace */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Workspace name</p>
              <p className="text-sm font-medium">{workspace.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Plan</p>
              <StatusBadge status={workspace.plan} />
            </div>
          </CardContent>
        </Card>

        {/* Integrations (interactive, client component) */}
        <IntegrationsPanel integrationMap={integrationMap} />

        {/* Billing */}
        <BillingPanel plan={workspace.plan} />

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{session.user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{session.user.name ?? "—"}</p>
            </div>
            <div className="pt-2 border-t flex gap-2">
              <Button variant="outline" size="sm">Change password</Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
