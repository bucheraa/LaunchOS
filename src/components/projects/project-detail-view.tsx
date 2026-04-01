"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { categoryLabel, platformLabel, pricingLabel } from "@/lib/utils";
import { Settings, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ProjectWithRelations } from "@/types";
import { ProjectOverviewTab } from "./tabs/overview-tab";
import { ProjectAnalysisTab } from "./tabs/analysis-tab";
import { ProjectStoreCopyTab } from "./tabs/store-copy-tab";
import { ProjectScreenshotTab } from "./tabs/screenshot-tab";
import { ProjectExperimentsTab } from "./tabs/experiments-tab";
import { ProjectRecommendationsTab } from "./tabs/recommendations-tab";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "analysis", label: "Analysis" },
  { id: "store-copy", label: "Store Copy" },
  { id: "screenshots", label: "Screenshots" },
  { id: "experiments", label: "Experiments" },
  { id: "recommendations", label: "Recommendations" },
];

interface Props {
  project: ProjectWithRelations;
  defaultTab?: string;
}

export function ProjectDetailView({ project, defaultTab = "overview" }: Props) {
  const router = useRouter();

  function handleTabChange(tab: string) {
    router.replace(`/projects/${project.id}?tab=${tab}`, { scroll: false });
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title={project.name}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${project.id}/settings`}>
              <Settings className="mr-1.5 h-3.5 w-3.5" />
              Settings
            </Link>
          </Button>
        }
      />

      {/* Project meta bar */}
      <div className="flex flex-wrap items-center gap-3 border-b px-6 py-3 bg-background">
        <StatusBadge status={project.status} />
        <span className="text-xs text-muted-foreground">
          {project.platform.map(platformLabel).join(" & ")}
        </span>
        <span className="text-muted-foreground text-xs">·</span>
        <span className="text-xs text-muted-foreground">{categoryLabel(project.category)}</span>
        <span className="text-muted-foreground text-xs">·</span>
        <span className="text-xs text-muted-foreground">{pricingLabel(project.pricingModel)}</span>
        {project.appStoreUrl && (
          <a
            href={project.appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            App Store <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {project.playStoreUrl && (
          <a
            href={project.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            Play Store <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <Tabs
        defaultValue={defaultTab}
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="border-b px-6 pt-2">
          <TabsList className="h-auto bg-transparent p-0 gap-1">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 pb-2 text-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="overview" className="m-0">
            <ProjectOverviewTab project={project} />
          </TabsContent>
          <TabsContent value="analysis" className="m-0">
            <ProjectAnalysisTab project={project} />
          </TabsContent>
          <TabsContent value="store-copy" className="m-0">
            <ProjectStoreCopyTab project={project} />
          </TabsContent>
          <TabsContent value="screenshots" className="m-0">
            <ProjectScreenshotTab project={project} />
          </TabsContent>
          <TabsContent value="experiments" className="m-0">
            <ProjectExperimentsTab project={project} />
          </TabsContent>
          <TabsContent value="recommendations" className="m-0">
            <ProjectRecommendationsTab project={project} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
