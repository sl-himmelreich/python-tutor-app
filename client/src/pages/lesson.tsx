import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StepSidebar } from "@/components/step-sidebar";
import { TheoryView } from "@/components/theory-view";
import { QuizView } from "@/components/quiz-view";
import { CodingView } from "@/components/coding-view";
import { AITeacherChat } from "@/components/ai-teacher-chat";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, ChevronLeft, BookOpen, HelpCircle, Code2, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepWithProgress {
  id: number;
  lessonId: number;
  order: number;
  type: "theory" | "quiz" | "coding";
  title: string;
  content: string;
  hint: string | null;
  solution: string | null;
  completed: boolean;
  userCode: string | null;
  attempts: number;
}

interface LessonDetail {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  steps: StepWithProgress[];
  totalSteps: number;
  completedSteps: number;
  completionPercent: number;
}

const typeIcons: Record<string, React.ReactNode> = {
  theory: <BookOpen className="w-4 h-4" />,
  quiz: <HelpCircle className="w-4 h-4" />,
  coding: <Code2 className="w-4 h-4" />,
};

const typeLabels: Record<string, string> = {
  theory: "Теория",
  quiz: "Тест",
  coding: "Задание",
};

export default function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: lesson, isLoading } = useQuery<LessonDetail>({
    queryKey: ["/api/lessons", slug],
    enabled: !!slug,
  });

  const progressMutation = useMutation({
    mutationFn: (data: { lessonSlug: string; stepId: number; completed: boolean; userCode?: string }) =>
      apiRequest("POST", "/api/progress", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lessons", slug] });
      queryClient.invalidateQueries({ queryKey: ["/api/lessons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="flex gap-6">
          <Skeleton className="h-[600px] w-64 rounded-xl flex-shrink-0" />
          <Skeleton className="h-[600px] flex-1 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-2">Урок не найден</p>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              На главную
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const steps = lesson.steps.sort((a, b) => a.order - b.order);
  // Default to first incomplete step, or first step
  const activeStepId = currentStepId ?? (
    steps.find((s) => !s.completed)?.id ?? steps[0]?.id
  );
  const currentStep = steps.find((s) => s.id === activeStepId) || steps[0];
  const currentIndex = steps.findIndex((s) => s.id === currentStep?.id);
  const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;

  const handleComplete = (code?: string) => {
    if (!currentStep) return;
    progressMutation.mutate({
      lessonSlug: lesson.slug,
      stepId: currentStep.id,
      completed: true,
      userCode: code,
    });
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStepId(stepId);
    setSidebarOpen(false);
  };

  const parsedContent = currentStep ? JSON.parse(currentStep.content) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="mobile-menu-toggle"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/">
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors" data-testid="back-to-dashboard">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Все уроки</span>
            </button>
          </Link>

          <div className="w-px h-4 bg-border" />

          {/* Lesson title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">{lesson.title}</span>
          </div>

          {/* Progress */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
            <Progress value={lesson.completionPercent} className="w-24 h-1.5" />
            <span>{lesson.completionPercent}%</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "bg-sidebar border-r border-sidebar-border flex-shrink-0 overflow-y-auto",
            "fixed lg:static top-[57px] bottom-0 left-0 z-40 w-64 transition-transform duration-200",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
          data-testid="lesson-sidebar"
        >
          <div className="p-3 pb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-1">
              Шаги урока
            </p>
          </div>
          <StepSidebar
            steps={steps as any}
            currentStepId={currentStep?.id || 0}
            onStepClick={handleStepClick}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
            {/* Step header */}
            {currentStep && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full",
                    currentStep.type === "theory" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                    currentStep.type === "quiz" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  )}>
                    {typeIcons[currentStep.type]}
                    {typeLabels[currentStep.type]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Шаг {currentIndex + 1} из {steps.length}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground" data-testid="step-title">
                  {currentStep.title}
                </h2>
              </div>
            )}

            {/* Step content */}
            {currentStep && parsedContent && (
              <div className="bg-card border border-card-border rounded-xl p-5 sm:p-6">
                {currentStep.type === "theory" && (
                  <TheoryView
                    content={parsedContent}
                    isCompleted={currentStep.completed}
                    onComplete={() => handleComplete()}
                  />
                )}
                {currentStep.type === "quiz" && (
                  <QuizView
                    content={parsedContent}
                    isCompleted={currentStep.completed}
                    onComplete={() => handleComplete()}
                  />
                )}
                {currentStep.type === "coding" && (
                  <CodingView
                    content={parsedContent}
                    hint={currentStep.hint}
                    solution={currentStep.solution}
                    savedCode={currentStep.userCode}
                    isCompleted={currentStep.completed}
                    onComplete={(code) => handleComplete(code)}
                  />
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              {prevStep ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setCurrentStepId(prevStep.id)}
                  data-testid="prev-step-btn"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Назад
                </Button>
              ) : (
                <Link href="/">
                  <Button variant="outline" size="sm" className="gap-2" data-testid="back-btn">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    К урокам
                  </Button>
                </Link>
              )}

              {nextStep ? (
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setCurrentStepId(nextStep.id)}
                  data-testid="next-step-btn"
                >
                  Следующий шаг
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Link href="/">
                  <Button size="sm" className="gap-2" data-testid="finish-lesson-btn">
                    Завершить урок
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* AI Teacher Chat */}
      <AITeacherChat
        lessonTitle={lesson.title}
        lessonDescription={lesson.description}
        currentStepTitle={currentStep?.title || ""}
        currentStepType={currentStep?.type || ""}
      />
    </div>
  );
}
