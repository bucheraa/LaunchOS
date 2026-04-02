"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { categoryLabel, platformLabel, pricingLabel } from "@/lib/utils";
import { ExternalLink, Smartphone, Monitor, Tag, DollarSign } from "lucide-react";
import Link from "next/link";
import type { ProjectWithRelations } from "@/types";
import { ProjectOverviewTab } from "./tabs/overview-tab";
import { ProjectAnalysisTab } from "./tabs/analysis-tab";
import { ProjectStoreCopyTab } from "./tabs/store-copy-tab";
import { ProjectScreenshotTab } from "./tabs/screenshot-tab";
import { ProjectExperimentsTab } from "./tabs/experiments-tab";
import { ProjectRecommendationsTab } from "./tabs/recommendations-tab";
import { ProjectCompetitorsTab } from "./tabs/competitors-tab";

const TABS = [
  { id: "overview",         label: "Overview" },
  { id: "analysis",         label: "Analysis" },
  { id: "store-copy",       label: "Store Copy" },
  { id: "screenshots",      label: "Screenshots" },
  { id: "experiments",      label: "Experiments" },
  { id: "competitors",      label: "Competitors" },
  { id: "recommendations",  label: "Recommendations" },
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
        subtitle={`${categoryLabel(project.category)} · ${project.platform.map(platformLabel).join(" & ")}`}
        actions={
          <div className="flex items-center gap-2">
            {project.appStoreUrl && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5" asChild>
                <a href={project.appStoreUrl} target="_blank" rel="noopener noreferrer">
                  <Smartphone className="h-3.5 w-3.5" />
                  App Store
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </Button>
            )}
            {project.playStoreUrl && (
              <Button variant="outline" size="sm" className="h-8 gap-1.5" asChild>
                <a href={project.playStoreUrl} target="_blank" rel="noopener noreferrer">
                  <Monitor className="h-3.5 w-3.5" />
                  Play Store
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </Button>
            )}
          </div>
        }
      />

      {/* Project meta pills */}
      <div className="flex flex-wrap items-center gap-2 border-b px-6 py-2.5 bg-muted/20">
        <StatusBadge status={project.status} />
        <div className="flex items-center gap-1 rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
          <Tag className="h-3 w-3" />
          {categoryLabel(project.category)}
        </div>
        <div className="flex items-center gap-1 rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
          <DollarSign className="h-3 w-3" />
          {pricingLabel(project.pricingModel)}
        </div>
        {project.platform.map((p) => (
          <div key={p} className="flex items-center gap-1 rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
            {p === "IOS" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
            {platformLabel(p)}
          </div>
        ))}
      </div>

      <Tabs
        defaultValue={defaultTab}
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="border-b px-6 bg-background">
          <TabsList className="h-auto bg-transparent p-0 gap-0">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3.5 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-colors"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <TabsContent value="overview"        className="m-0"><ProjectOverviewTab project={project} /></TabsContent>
          <TabsContent value="analysis"        className="m-0"><ProjectAnalysisTab project={project} /></TabsContent>
          <TabsContent value="store-copy"      className="m-0"><ProjectStoreCopyTab project={project} /></TabsContent>
          <TabsContent value="screenshots"     className="m-0"><ProjectScreenshotTab project={project} /></TabsContent>
          <TabsContent value="experiments"     className="m-0"><ProjectExperimentsTab project={project} /></TabsContent>
          <TabsContent value="competitors"     className="m-0"><ProjectCompetitorsTab project={project} /></TabsContent>
          <TabsContent value="recommendations" className="m-0"><ProjectRecommendationsTab project={project} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
