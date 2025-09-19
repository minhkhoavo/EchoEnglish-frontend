import { Card, CardContent } from '@/components/ui/card';

export const Instructions = ({ children }: { children: React.ReactNode }) => (
  <Card className="bg-blue-50 dark:bg-blue-950">
    <CardContent className="p-4">
      <p className="text-sm text-blue-800 dark:text-blue-200">{children}</p>
    </CardContent>
  </Card>
);
