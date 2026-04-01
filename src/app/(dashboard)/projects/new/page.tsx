import { Header } from "@/components/layout/header";
import { CreateProjectForm } from "@/components/projects/create-project-form";

export default function NewProjectPage() {
  return (
    <div>
      <Header title="New Project" />
      <div className="p-6 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Create a new project</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us about your app. The more detail you provide, the better the AI-generated output.
          </p>
        </div>
        <CreateProjectForm />
      </div>
    </div>
  );
}
