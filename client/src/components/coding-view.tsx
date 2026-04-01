import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "./code-editor";
import { ConsoleOutput } from "./console-output";
import { Play, Lightbulb, CheckCircle2, RotateCcw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";

interface CodingContent {
  description: string;
  starterCode: string;
  checkType: "output_contains" | "runs_successfully";
  expectedOutput?: string;
}

interface CodingViewProps {
  content: CodingContent;
  hint: string | null;
  solution: string | null;
  savedCode: string | null;
  isCompleted: boolean;
  onComplete: (code: string) => void;
}

export function CodingView({
  content,
  hint,
  solution,
  savedCode,
  isCompleted,
  onComplete,
}: CodingViewProps) {
  const [code, setCode] = useState(savedCode || content.starterCode || "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [succeeded, setSucceeded] = useState(isCompleted);

  // Reset code when content changes (new step)
  useEffect(() => {
    setCode(savedCode || content.starterCode || "");
    setOutput("");
    setError("");
    setExitCode(null);
    setShowHint(false);
    setShowSolution(false);
    setSucceeded(isCompleted);
  }, [content.starterCode, savedCode, isCompleted]);

  const runCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput("");
    setError("");
    setExitCode(null);

    try {
      const res = await apiRequest("POST", "/api/run-code", { code });
      const result = await res.json() as { output: string; error: string; exitCode: number };
      setOutput(result.output);
      setError(result.error);
      setExitCode(result.exitCode);

      // Check success
      let success = false;
      if (content.checkType === "runs_successfully") {
        success = result.exitCode === 0 && !result.error;
      } else if (content.checkType === "output_contains" && content.expectedOutput) {
        success = result.exitCode === 0 && !result.error &&
          result.output.toLowerCase().includes(content.expectedOutput.toLowerCase());
      }

      if (success && !succeeded) {
        setSucceeded(true);
        onComplete(code);
      }
    } catch (err) {
      setError("Ошибка соединения с сервером");
      setExitCode(1);
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(content.starterCode || "");
    setOutput("");
    setError("");
    setExitCode(null);
    setSucceeded(isCompleted);
  };

  const loadSolution = () => {
    if (solution) {
      setCode(solution);
      setShowSolution(false);
    }
  };

  return (
    <div className="flex flex-col gap-4" data-testid="coding-view">
      {/* Task description */}
      <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
        <div className="prose-sm max-w-none text-sm text-foreground/90 leading-relaxed coding-description">
          <ReactMarkdown
            components={{
              code: ({ children }) => (
                <code className="bg-muted/70 rounded px-1.5 py-0.5 text-xs font-mono">{children}</code>
              ),
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-2">{children}</ol>,
              ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-2">{children}</ul>,
            }}
          >
            {content.description}
          </ReactMarkdown>
        </div>

        {/* Expected output badge */}
        {content.checkType === "output_contains" && content.expectedOutput && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Ожидаемый вывод содержит:</span>
            <code className="bg-primary/10 text-primary rounded px-2 py-0.5 font-mono">
              {content.expectedOutput}
            </code>
          </div>
        )}
      </div>

      {/* Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Редактор кода</span>
          <button
            onClick={resetCode}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-testid="reset-code-btn"
          >
            <RotateCcw className="w-3 h-3" />
            Сбросить
          </button>
        </div>
        <CodeEditor
          value={code}
          onChange={setCode}
          minHeight="220px"
        />
      </div>

      {/* Run controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={runCode}
          disabled={isRunning}
          className="gap-2"
          size="sm"
          data-testid="run-code-btn"
        >
          <Play className="w-3.5 h-3.5" />
          {isRunning ? "Выполняется..." : "Запустить"}
        </Button>

        {hint && (
          <Button
            onClick={() => setShowHint(!showHint)}
            variant="outline"
            size="sm"
            className="gap-2"
            data-testid="hint-btn"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            {showHint ? "Скрыть подсказку" : "Подсказка"}
          </Button>
        )}

        {solution && (
          <Button
            onClick={() => setShowSolution(!showSolution)}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground text-xs ml-auto"
            data-testid="solution-btn"
          >
            Показать решение
          </Button>
        )}
      </div>

      {/* Hint */}
      {showHint && hint && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 flex gap-2.5 text-sm">
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 dark:text-amber-300 font-mono text-xs leading-relaxed">{hint}</p>
        </div>
      )}

      {/* Solution reveal */}
      {showSolution && solution && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Возможное решение</span>
            <Button onClick={loadSolution} size="sm" variant="outline" className="text-xs h-7">
              Загрузить в редактор
            </Button>
          </div>
          <CodeEditor value={solution} onChange={() => {}} readOnly minHeight="100px" />
        </div>
      )}

      {/* Console output */}
      <ConsoleOutput
        output={output}
        error={error}
        exitCode={exitCode}
        isRunning={isRunning}
      />

      {/* Success state */}
      {succeeded && (
        <div
          className="bg-[hsl(142_72%_38%)]/10 border border-[hsl(142_72%_38%)]/30 rounded-xl p-4 flex items-center gap-3"
          data-testid="coding-success"
        >
          <CheckCircle2 className="w-5 h-5 text-[hsl(142_72%_38%)] flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[hsl(142_72%_30%)] dark:text-[hsl(142_72%_55%)]">
              Отлично! Задание выполнено!
            </p>
            <p className="text-xs text-[hsl(142_72%_35%)] dark:text-[hsl(142_72%_50%)] mt-0.5">
              Переходи к следующему шагу
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
