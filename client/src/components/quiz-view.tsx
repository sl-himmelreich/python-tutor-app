import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizContent {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizViewProps {
  content: QuizContent;
  isCompleted: boolean;
  onComplete: () => void;
}

export function QuizView({ content, isCompleted, onComplete }: QuizViewProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(isCompleted);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(isCompleted ? true : null);

  const handleSubmit = () => {
    if (selected === null) return;
    const correct = selected === content.correct;
    setWasCorrect(correct);
    setSubmitted(true);
    if (correct) {
      onComplete();
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setSubmitted(false);
    setWasCorrect(null);
  };

  return (
    <div className="flex flex-col gap-5" data-testid="quiz-view">
      {/* Question */}
      <div className="bg-muted/50 rounded-xl p-4">
        <p className="font-semibold text-sm text-foreground leading-relaxed whitespace-pre-line">
          {content.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2" data-testid="quiz-options">
        {content.options.map((option, idx) => {
          const isSelected = selected === idx;
          const isCorrectOption = idx === content.correct;
          const showResult = submitted;

          let optionStyle = "border-border bg-card hover:bg-muted/60";
          if (showResult) {
            if (isCorrectOption) {
              optionStyle = "border-[hsl(142_72%_38%)] bg-[hsl(142_72%_38%)]/10 text-[hsl(142_72%_30%)] dark:text-[hsl(142_72%_55%)]";
            } else if (isSelected && !isCorrectOption) {
              optionStyle = "border-destructive bg-destructive/10 text-destructive";
            }
          } else if (isSelected) {
            optionStyle = "border-primary bg-primary/10 text-primary";
          }

          return (
            <button
              key={idx}
              onClick={() => !submitted && setSelected(idx)}
              disabled={submitted}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-all",
                optionStyle,
                !submitted && "cursor-pointer"
              )}
              data-testid={`quiz-option-${idx}`}
            >
              {/* Option letter */}
              <span
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold",
                  isSelected && !submitted ? "border-primary bg-primary text-white" : "border-current"
                )}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">{option}</span>
              {showResult && isCorrectOption && (
                <CheckCircle2 className="w-4 h-4 text-[hsl(142_72%_38%)] flex-shrink-0" />
              )}
              {showResult && isSelected && !isCorrectOption && (
                <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {submitted && (
        <div
          className={cn(
            "rounded-xl p-4 text-sm",
            wasCorrect
              ? "bg-[hsl(142_72%_38%)]/10 border border-[hsl(142_72%_38%)]/30 text-[hsl(142_72%_30%)] dark:text-[hsl(142_72%_55%)]"
              : "bg-destructive/10 border border-destructive/30 text-destructive"
          )}
          data-testid="quiz-feedback"
        >
          <div className="flex items-start gap-2">
            {wasCorrect ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold mb-1">{wasCorrect ? "Правильно!" : "Не совсем..."}</p>
              <p className="text-xs opacity-90">{content.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={selected === null}
            size="sm"
            data-testid="quiz-submit-btn"
          >
            Проверить ответ
          </Button>
        ) : wasCorrect ? (
          <div className="flex items-center gap-2 text-sm text-[hsl(142_72%_38%)] font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Отлично! Можешь идти дальше.
          </div>
        ) : (
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            data-testid="quiz-retry-btn"
          >
            Попробовать снова
          </Button>
        )}
      </div>
    </div>
  );
}
