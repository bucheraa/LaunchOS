import { notFound } from "next/navigation";
import { requireAuth, getWorkspace } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { isDemoMode } from "@/lib/demo/mode";
import { getDemoProject } from "@/lib/demo/store";

interface Props {
  params: { id: string };
  searchParams: { tab?: string };
}

export async function generateMetadata({ params }: Props) {
  const project = isDemoMode
    ? getDemoProject(params.id)
    : await db.project.findUnique({ where: { id: params.id }, select: { name: true } });
  return { title: project?.name ?? "Project" };
}

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const session = await requireAuth();
  const workspace = await getWorkspace(session.user.id!);
  if (!workspace) return null;

  const project = isDemoMode
    ? getDemoProject(params.id)
    : await db.project.findFirst({
        where: { id: params.id, workspaceId: workspace.id },
        include: {
          analysis: true,
          audienceSegments: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
          valuePropitions: { orderBy: { createdAt: "asc" } },
          messagingAngles: { orderBy: { createdAt: "asc" } },
          listingVariants: {
            include: { audienceSegment: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
          },
          screenshotPlans: { orderBy: { createdAt: "desc" } },
          screenshotMockups: { orderBy: { screenIndex: "asc" } },
          experiments: { orderBy: [{ status: "asc" }, { priority: "desc" }] },
          recommendations: {
            where: { status: { not: "DISMISSED" } },
            orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
          },
          competitors: { orderBy: { createdAt: "desc" } },
          keywordSets: {
            orderBy: { createdAt: "desc" },
            include: {
              keywords: { orderBy: { volume: "desc" } },
            },
            take: 2,
          },
          _count: {
            select: {
              listingVariants: true,
              experiments: true,
              recommendations: true,
              audienceSegments: true,
            },
          },
        },
      });

  if (!project) notFound();

  return <ProjectDetailView project={project as any} defaultTab={searchParams.tab} />;
}
