import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ExplanationSectionProps {
  expanded: boolean;
  onToggle: () => void;
  explanation: string;
}

export const ExplanationSection: React.FC<ExplanationSectionProps> = ({
  expanded,
  onToggle,
  explanation,
}) => (
  <Collapsible open={expanded} onOpenChange={onToggle}>
    <CollapsibleTrigger asChild>
      <Button variant="outline" className="w-full justify-between">
        Show explanation
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <Card className="mt-2">
        <CardContent className="p-4">
          <div
            dangerouslySetInnerHTML={{ __html: explanation }}
            className="prose prose-sm max-w-none dark:prose-invert"
          />
        </CardContent>
      </Card>
    </CollapsibleContent>
  </Collapsible>
);
