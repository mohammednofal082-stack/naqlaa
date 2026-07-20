"use client";

import Image from "next/image";
import { DashboardLayout, Header } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/page-header";
import { useProfile } from "@/hooks/data";
import { ExternalLink, Github, FolderGit2 } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n";

export default function ProjectsPage() {
  const { t } = useI18n();
  const { data: profileData, loading } = useProfile();
  const projects = profileData?.profile.projects ?? [];

  if (loading) {
    return (
      <DashboardLayout>
        <Header title={t("مشاريع التخرج", "Graduation Projects")} subtitle={t("اعرض مشاريعك واجذب الشركات", "Showcase your projects and attract companies")} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="nq-skeleton h-80 rounded-xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title={t("مشاريع التخرج", "Graduation Projects")} subtitle={t("اعرض مشاريعك واجذب الشركات", "Showcase your projects and attract companies")} />

      <div className="nq-page-enter mt-6">
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title={t("لا مشاريع بعد", "No projects yet")}
            description={t("أضف مشاريعك من ملفك الشخصي ليراها أصحاب العمل", "Add your projects from your profile so employers can see them")}
            action={
              <Link href="/profile/edit" className="btn-primary">{t("أضف مشروعاً", "Add a Project")}</Link>
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <Card key={project.id} hover className="nq-lift p-0 overflow-hidden">
                <div className="relative h-44">
                  <Image src={project.image} alt={project.title} fill className="object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-lg text-text mb-2">{project.title}</h3>
                  <p className="text-text-secondary text-sm mb-3 leading-relaxed">{project.description}</p>
                  <p className="text-text-muted text-xs mb-4">{project.technologies.join(" · ")}</p>
                  <div className="flex gap-3">
                    {project.githubUrl && (
                      <a href={project.githubUrl} className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text transition-colors">
                        <Github className="w-4 h-4" /> GitHub
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} className="flex items-center gap-1 text-sm font-medium text-blue hover:underline">
                        <ExternalLink className="w-4 h-4" /> Demo
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
