import { CheckCircle2, Circle, BookOpen, HelpCircle, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  order: number;
  type: "theory" | "quiz" | "coding";
  title: string;
  completed: boolean;
}

interface StepSidebarProps {
  steps: Step[];
  currentStepId: number;
  onStepClick: (stepId: number) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  theory: <BookOpen className="w-3.5 h-3.5" />,
  quiz: <HelpCircle className="w-3.5 h-3.5" />,
  coding: <Code2 className="w-3.5 h-3.5" />,
};

const typeLabels: Record<string, string> = {
  theory: "Теория",
  quiz: "Тест",
  coding: "Задание",
};

const typeColors: Record<string, string> = {
  theory: "text-blue-500 dark:text-blue-400",
  quiz: "text-amber-500 dark:text-amber-400",
  coding: "text-green-500 dark:text-green-400",
};

export function StepSidebar({ steps, currentStepId, onStepClick }: StepSidebarProps) {
  return (
    <nav className="flex flex-col gap-1 p-2" data-testid="step-sidebar">
      {steps.map((step) => {
        const isActive = step.id === currentStepId;
        const isCompleted = step.completed;

        return (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={cn(
              "w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all",
              isActive
                ? "bg-primary/10 text-primary border border-primary/20"
                : "hover:bg-muted/70 text-foreground/80 border border-transparent"
            )}
            data-testid={`step-btn-${step.id}`}
          >
            {/* Step number + completion */}
            <div className="flex-shrink-0 mt-0.5">
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-[hsl(142_72%_38%)]" />
              ) : isActive ? (
                <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/50" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <span className={cn("flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide", typeColors[step.type])}>
                  {typeIcons[step.type]}
                  {typeLabels[step.type]}
                </span>
              </div>
              <span className={cn("text-xs leading-snug line-clamp-2", isActive ? "font-semibold" : "font-normal")}>
                {step.title}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
