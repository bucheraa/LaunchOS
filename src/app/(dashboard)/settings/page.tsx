import { requireAuth, getWorkspace } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ExternalLink, Link as LinkIcon, Plug } from "lucide-react";

const INTEGRATIONS = [
  {
    provider: "APPLE_APP_STORE_CONNECT",
    name: "Apple App Store Connect",
    description: "Sync app metadata and listings directly to App Store Connect.",
    icon: "🍎",
    docsUrl: "https://developer.apple.com/documentation/appstoreconnectapi",
  },
  {
    provider: "GOOGLE_PLAY_DEVELOPER",
    name: "Google Play Developer",
    description: "Push store listings to Google Play via the Developer API.",
    icon: "🤖",
    docsUrl: "https://developers.google.com/android-publisher",
  },
  {
    provider: "REVENUECAT",
    name: "RevenueCat",
    description: "Connect subscription data for monetization insights.",
    icon: "💰",
    docsUrl: "https://www.revenuecat.com/docs",
  },
  {
    provider: "STRIPE",
    name: "Stripe",
    description: "Manage billing and subscription plans.",
    icon: "💳",
    docsUrl: "https://stripe.com/docs",
  },
];

export default async function SettingsPage() {
  const session = await requireAuth();
  const workspace = await getWorkspace(session.user.id!);
  if (!workspace) return null;

  const integrations = await db.integration.findMany({
    where: { workspaceId: workspace.id },
  });

  const integrationMap = Object.fromEntries(
    integrations.map((i) => [i.provider, i])
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

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Integrations</CardTitle>
            <CardDescription>
              Connect your app stores and monetization platforms.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {INTEGRATIONS.map((integration) => {
                const connected = integrationMap[integration.provider];
                return (
                  <div key={integration.provider} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{integration.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {connected ? (
                        <>
                          <StatusBadge status={connected.status} />
                          <Button size="sm" variant="outline">Configure</Button>
                        </>
                      ) : (
                        <>
                          <a
                            href={integration.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            Docs <ExternalLink className="h-3 w-3" />
                          </a>
                          <Button size="sm" variant="outline">
                            <Plug className="mr-1.5 h-3.5 w-3.5" />
                            Connect
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Billing</CardTitle>
            <CardDescription>Manage your subscription and payment method.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current plan</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {workspace.plan.toLowerCase()} plan
                </p>
              </div>
              <Button variant="outline" size="sm">
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>

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
