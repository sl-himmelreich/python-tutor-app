import { useQuery } from "@tanstack/react-query";
import { LessonCard } from "@/components/lesson-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { Code2, Trophy, Target, Flame } from "lucide-react";

interface LessonWithProgress {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  totalSteps: number;
  completedSteps: number;
  completionPercent: number;
}

interface Stats {
  totalLessons: number;
  completedLessons: number;
  totalSteps: number;
  completedSteps: number;
  overallPercent: number;
}

export default function Dashboard() {
  const {
    data: lessons,
    isLoading: lessonsLoading,
  } = useQuery<LessonWithProgress[]>({
    queryKey: ["/api/lessons"],
  });

  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const isLoading = lessonsLoading || statsLoading;

  const motivationalMessages = [
    "Каждая строка кода — это шаг к новым возможностям! 🚀",
    "Ты уже знаешь Scratch — Python будет совсем простым! 💪",
    "Программирование — это суперсила. Учись её использовать! ⚡",
    "Каждый профессионал был когда-то новичком. Начни сегодня! 🌟",
  ];
  const message = motivationalMessages[new Date().getDate() % motivationalMessages.length];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-label="Python Tutor">
                <path d="M8 1C4 1 3 3 3 5v1h5v1H2.5C1 7 0 8.5 0 10.5S1 14 2.5 14H4v-2c0-1 .5-1.5 1.5-1.5H10c1 0 1.5-.5 1.5-1.5V5c0-1-.5-4-3.5-4zm-1 3a.75.75 0 11-1.5 0A.75.75 0 017 4z" fill="white" />
                <path d="M8 15c4 0 5-2 5-4v-1H8v-1h5.5C15 9 16 7.5 16 5.5S15 2 13.5 2H12v2c0 1-.5 1.5-1.5 1.5H6C5 5.5 4.5 6 4.5 7v4c0 1 .5 4 3.5 4zm1-3a.75.75 0 111.5 0A.75.75 0 019 12z" fill="hsl(280 60% 80%)" />
              </svg>
            </div>
            <span className="font-bold text-base text-foreground">Python Tutor</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome card */}
        <div className="bg-gradient-to-br from-primary to-[hsl(280_60%_55%)] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
              <path d="M0 100 Q100 50 200 100 Q300 150 400 100 L400 200 L0 200Z" fill="white" />
            </svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-xl font-bold mb-1">Добро пожаловать!</h1>
            <p className="text-sm text-white/80 mb-4">{message}</p>
            {stats && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span>Общий прогресс</span>
                  <span className="font-semibold text-white">{stats.overallPercent}%</span>
                </div>
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.overallPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        {statsLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-3 gap-3" data-testid="stats-grid">
            <div className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground leading-none">{stats.completedLessons}</p>
                <p className="text-xs text-muted-foreground mt-0.5">уроков пройдено</p>
              </div>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-[hsl(142_72%_38%)]/10 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-[hsl(142_72%_38%)]" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground leading-none">{stats.completedSteps}</p>
                <p className="text-xs text-muted-foreground mt-0.5">заданий выполнено</p>
              </div>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-[hsl(280_60%_55%)]/10 rounded-lg flex items-center justify-center">
                <Code2 className="w-4 h-4 text-[hsl(280_60%_55%)]" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground leading-none">{stats.totalLessons}</p>
                <p className="text-xs text-muted-foreground mt-0.5">уроков всего</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Lessons grid */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Уроки</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="lessons-grid">
              {lessons?.map((lesson) => (
                <LessonCard key={lesson.id} {...lesson} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
