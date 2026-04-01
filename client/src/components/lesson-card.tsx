import { Link } from "wouter";
import { CheckCircle2, BookOpen, ChevronRight, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  totalSteps: number;
  completedSteps: number;
  completionPercent: number;
  isLocked?: boolean;
}

const categoryColors: Record<string, string> = {
  "Основы": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Условия": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Циклы": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "Функции": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "Списки": "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  "Строки": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "Словари": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "Проекты": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

export function LessonCard({
  slug,
  title,
  description,
  category,
  order,
  totalSteps,
  completedSteps,
  completionPercent,
  isLocked = false,
}: LessonCardProps) {
  const isCompleted = completionPercent === 100;
  const isStarted = completedSteps > 0;
  const colorClass = categoryColors[category] || "bg-muted text-muted-foreground";

  return (
    <div
      className={cn(
        "bg-card border border-card-border rounded-xl p-5 flex flex-col gap-4 transition-all duration-200",
        isLocked
          ? "opacity-60 cursor-not-allowed"
          : "hover:shadow-md hover:border-primary/30 cursor-pointer"
      )}
      data-testid={`lesson-card-${slug}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Order number or check */}
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0",
              isCompleted
                ? "bg-[hsl(142_72%_38%)] text-white"
                : "bg-primary/10 text-primary"
            )}
          >
            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : order}
          </div>
          <div>
            <span
              className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium", colorClass)}
              data-testid={`lesson-category-${slug}`}
            >
              {category}
            </span>
          </div>
        </div>
        {isLocked && <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="font-semibold text-base text-foreground leading-snug mb-1" data-testid={`lesson-title-${slug}`}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{completedSteps} из {totalSteps} шагов</span>
          <span>{completionPercent}%</span>
        </div>
        <Progress
          value={completionPercent}
          className="h-1.5"
          data-testid={`lesson-progress-${slug}`}
        />
      </div>

      {/* Action */}
      {!isLocked && (
        <Link href={`/lesson/${slug}`}>
          <Button
            className="w-full gap-2"
            variant={isCompleted ? "secondary" : isStarted ? "outline" : "default"}
            size="sm"
            data-testid={`lesson-start-${slug}`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Повторить
              </>
            ) : isStarted ? (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                Продолжить
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                Начать
              </>
            )}
          </Button>
        </Link>
      )}
    </div>
  );
}
