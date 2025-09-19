import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, Clock, Target, Loader2 } from 'lucide-react';
import { useGetTestHistoryQuery } from '../../services/testResultAPI';
import { useNavigate } from 'react-router-dom';
import CustomPagination from '@/components/ui/custom-pagination';

interface TestHistoryProps {
  testId?: string; // Nhận thêm prop testId (nếu cần)
}

export const TestHistory: React.FC<TestHistoryProps> = ({ testId }) => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const {
    data: historyData,
    isLoading: loading,
    error,
  } = useGetTestHistoryQuery({ page, limit: 5, testId }); // truyền testId vào đây

  const testResults = historyData?.data || [];
  const pagination = historyData?.pagination || {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  };

  const handleViewDetails = (resultId: string) => {
    // Navigate to test exam page with review mode
    navigate(`/test-exam?mode=review&resultId=${resultId}`);
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading test history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Your Test Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-center py-4 text-red-500">
            <p>Failed to load test history</p>
            <Button onClick={() => window.location.reload()} className="mt-2">
              Try Again
            </Button>
          </div>
        )}

        {!error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Date
                    </div>
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                    Result
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Duration
                    </div>
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result) => (
                  <tr
                    key={result.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-2">
                      <div>
                        <div className="font-medium">
                          {formatDate(result.completedAt)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.testTitle}
                          {result.partsKey !== 'full' ? (
                            <>
                              {' - '}
                              <span>
                                {/* Chuyển partKey thành dạng Part 2, 3, 5 */}
                                {result.partsKey
                                  .split('-')
                                  .map((p) => p.replace('part', 'Part '))
                                  .join(', ')}
                              </span>
                            </>
                          ) : (
                            '- Full'
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                            result.percentage >= 80
                              ? 'bg-green-100 text-green-800'
                              : result.percentage >= 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {/* Nếu là full test thì hiển thị điểm TOEIC, còn lại chỉ hiển thị số câu đúng */}
                          {result.partsKey === 'full'
                            ? result.score * 5
                            : result.score}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {result.score}/{result.totalQuestions} |{' '}
                          {result.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2 font-mono text-sm">
                      {formatDuration(result.duration)}
                    </td>
                    <td className="py-4 px-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleViewDetails(result.id)}
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <CustomPagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                className="mt-4"
              />
            )}
          </div>
        )}

        {testResults.length === 0 && !loading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No test results yet</p>
            <p className="text-sm">Start a test to see your results here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
