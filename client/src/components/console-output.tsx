import { Terminal, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsoleOutputProps {
  output: string;
  error: string;
  exitCode: number | null;
  isRunning?: boolean;
}

export function ConsoleOutput({ output, error, exitCode, isRunning = false }: ConsoleOutputProps) {
  const hasOutput = output || error;
  const isSuccess = exitCode === 0 && !error;
  const hasError = !!error || (exitCode !== null && exitCode !== 0);

  return (
    <div
      className="rounded-lg border border-border bg-[hsl(240_12%_9%)] overflow-hidden"
      data-testid="console-output"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30 bg-[hsl(240_10%_12%)]">
        <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground font-mono">Консоль</span>
        {isRunning && (
          <span className="ml-auto text-xs text-primary animate-pulse">● Выполнение...</span>
        )}
        {!isRunning && exitCode !== null && (
          <span className="ml-auto flex items-center gap-1 text-xs">
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-[hsl(142_72%_45%)]" />
                <span className="text-[hsl(142_72%_45%)]">Успешно</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-destructive" />
                <span className="text-destructive">Ошибка</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 min-h-[80px] max-h-[200px] overflow-y-auto">
        {isRunning ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="font-mono animate-pulse">▶ Запуск кода...</span>
          </div>
        ) : !hasOutput ? (
          <p className="text-muted-foreground text-xs font-mono italic">
            Вывод появится здесь после запуска кода
          </p>
        ) : (
          <div className="font-mono text-sm space-y-1">
            {output && (
              <pre
                className="text-[hsl(142_72%_55%)] whitespace-pre-wrap break-words text-xs leading-relaxed"
                data-testid="console-stdout"
              >
                {output}
              </pre>
            )}
            {error && (
              <pre
                className="text-[hsl(0_72%_65%)] whitespace-pre-wrap break-words text-xs leading-relaxed"
                data-testid="console-stderr"
              >
                {error}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
