import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  RefreshCw,
  Download,
  Share2,
  BookOpen,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

interface ActionButtonsProps {
  onTakeAnotherTest?: () => void;
  onDownloadReport?: () => void;
  onShareResult?: () => void;
  onViewDetailedAnalysis?: () => void;
  onViewRecommendations?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onTakeAnotherTest,
  onDownloadReport,
  onShareResult,
  onViewDetailedAnalysis,
  onViewRecommendations,
}) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>

        <div className="space-y-3">
          <Button
            onClick={onTakeAnotherTest}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            size="lg"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Take Another Test
          </Button>

          <Button
            onClick={onViewDetailedAnalysis}
            variant="outline"
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
            size="lg"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Detailed Analysis
          </Button>

          <Button
            onClick={onViewRecommendations}
            variant="outline"
            className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            size="lg"
          >
            <Target className="h-4 w-4 mr-2" />
            Study Recommend
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onDownloadReport}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              <Download className="h-4 w-4 mr-1" />
              Report
            </Button>

            <Button
              onClick={onShareResult}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Quick Tips to Improve
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span>Practice writing essays with varied vocabulary</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-3 w-3 text-blue-600" />
              <span>Join writing workshops to improve structure</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="h-3 w-3 text-purple-600" />
              <span>Review grammar rules for weak areas</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
