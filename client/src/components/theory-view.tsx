import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle2 } from "lucide-react";

interface TheoryContent {
  html: string;
}

interface TheoryViewProps {
  content: TheoryContent;
  isCompleted: boolean;
  onComplete: () => void;
}

export function TheoryView({ content, isCompleted, onComplete }: TheoryViewProps) {
  return (
    <div className="flex flex-col gap-6" data-testid="theory-view">
      {/* Theory HTML content */}
      <div
        className="theory-content prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: content.html }}
      />

      {/* Complete button */}
      <div className="flex justify-end pt-2 border-t border-border">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-sm text-[hsl(142_72%_38%)] font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Прочитано!
          </div>
        ) : (
          <Button
            onClick={onComplete}
            className="gap-2"
            size="sm"
            data-testid="theory-complete-btn"
          >
            Понятно, дальше!
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
