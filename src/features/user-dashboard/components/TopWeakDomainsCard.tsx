import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { DomainProficiencyItem } from '../types/dashboard.types';

interface TopWeakDomainsCardProps {
  domainProficiency: DomainProficiencyItem[];
}

const TOP_COUNT = 5;

const toTitleCase = (snakeCaseDomain: string): string =>
  snakeCaseDomain
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const TopWeakDomainsCard = ({
  domainProficiency,
}: TopWeakDomainsCardProps) => {
  const [showAll, setShowAll] = useState(false);

  const rankedDomains = domainProficiency
    .filter((item) => item.accuracy > 0 || item.totalQuestions > 0)
    .sort((a, b) => a.accuracy - b.accuracy);

  const visibleDomains = showAll
    ? rankedDomains
    : rankedDomains.slice(0, TOP_COUNT);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
            style={{ backgroundColor: '#FEF3C7' }}
          >
            <AlertTriangle className="h-4 w-4" style={{ color: '#F59E0B' }} />
          </div>
          Top Weak Content Areas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rankedDomains.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Not enough data yet. Complete a practice test to see your weakest
            content areas.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {visibleDomains.map((item) => (
                <div key={item.domain}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: '#1F2937' }}>
                      {toTitleCase(item.domain)}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: '#1F2937' }}
                    >
                      {item.accuracy.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={item.accuracy} className="h-2" />
                </div>
              ))}
            </div>
            {rankedDomains.length > TOP_COUNT && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? 'Show top 5' : `Show all ${rankedDomains.length}`}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
