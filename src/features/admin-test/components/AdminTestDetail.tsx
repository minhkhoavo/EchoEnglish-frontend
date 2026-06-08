import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  Layers,
  Edit,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Image,
  FileText,
  CheckCircle2,
  XCircle,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetAdminTestByIdQuery } from '../services/adminTestApi';
import type {
  TestQuestion,
  TestQuestionGroup,
  TestPart,
} from '../types/admin-test.types';

const QuestionCard = ({
  question,
  index,
}: {
  question: TestQuestion;
  index: number;
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        {/* Question Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
            {question.questionNumber}
          </div>
          <div className="flex-1">
            {question.questionText && (
              <p className="text-slate-800 font-medium leading-relaxed">
                {question.questionText}
              </p>
            )}
          </div>
        </div>

        {/* Media Section */}
        {question.media && (
          <div className="mb-4 space-y-3">
            {question.media.audioUrl && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Volume2 className="h-5 w-5 text-blue-600" />
                <audio controls className="flex-1 h-8">
                  <source src={question.media.audioUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}

            {question.media.imageUrls &&
              question.media.imageUrls.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {question.media.imageUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Question ${question.questionNumber} image ${idx + 1}`}
                      className="max-h-48 rounded-lg border border-slate-200 object-contain"
                    />
                  ))}
                </div>
              )}

            {question.media.transcript && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p
                  className="text-sm text-slate-600 italic"
                  dangerouslySetInnerHTML={{
                    __html: question.media.transcript,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Options */}
        <div className="space-y-2 mb-4">
          {question.options.map((option) => (
            <div
              key={option.label}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                option.label === question.correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  option.label === question.correctAnswer
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {option.label}
              </span>
              <span className="flex-1 text-slate-700">
                {option.text || (
                  <span className="text-slate-400 italic">(No content)</span>
                )}
              </span>
              {option.label === question.correctAnswer && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
          ))}
        </div>

        {/* Tags & Explanation Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {question.contentTags?.difficulty && (
              <Badge variant="secondary" className="text-xs">
                {question.contentTags.difficulty}
              </Badge>
            )}
            {question.contentTags?.domain?.map((d) => (
              <Badge key={d} variant="outline" className="text-xs">
                {d}
              </Badge>
            ))}
          </div>

          {question.explanation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-blue-600"
            >
              {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
              {showExplanation ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </Button>
          )}
        </div>

        {/* Explanation */}
        {showExplanation && question.explanation && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Explanation
            </h4>
            <div
              className="text-sm text-amber-900 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: question.explanation }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const QuestionGroupCard = ({
  group,
  partNumber,
}: {
  group: TestQuestionGroup;
  partNumber: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="border-2 border-slate-200 shadow-md overflow-hidden">
      {/* Group Context */}
      <div className="bg-slate-50 p-5 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-blue-600 text-white">
            Questions {group.questions[0]?.questionNumber} -{' '}
            {group.questions[group.questions.length - 1]?.questionNumber}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Group Media */}
        {group.groupContext.audioUrl && (
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg mb-3 border border-slate-200">
            <Volume2 className="h-5 w-5 text-blue-600" />
            <audio controls className="flex-1 h-8">
              <source src={group.groupContext.audioUrl} type="audio/mpeg" />
            </audio>
          </div>
        )}

        {group.groupContext.imageUrls &&
          group.groupContext.imageUrls.length > 0 && (
            <div className="flex gap-3 flex-wrap mb-3">
              {group.groupContext.imageUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Group image ${idx + 1}`}
                  className="max-h-64 rounded-lg border border-slate-200 object-contain bg-white"
                />
              ))}
            </div>
          )}

        {group.groupContext.passageHtml && (
          <div
            className="prose prose-sm max-w-none bg-white p-4 rounded-lg border border-slate-200"
            dangerouslySetInnerHTML={{ __html: group.groupContext.passageHtml }}
          />
        )}

        {group.groupContext.transcript && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2">
                <FileText className="h-4 w-4 mr-2" />
                View Transcript
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div
                className="mt-2 p-4 bg-white rounded-lg border border-slate-200 text-sm"
                dangerouslySetInnerHTML={{
                  __html: group.groupContext.transcript,
                }}
              />
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Questions */}
      {isExpanded && (
        <CardContent className="p-5 space-y-4">
          {group.questions.map((question, idx) => (
            <QuestionCard
              key={question._id || idx}
              question={question}
              index={idx}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
};

const PartSection = ({ part }: { part: TestPart }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const partNumber = parseInt(part.partName.replace('Part ', ''));

  const questionCount = useMemo(() => {
    if (part.questions) return part.questions.length;
    if (part.questionGroups) {
      return part.questionGroups.reduce(
        (acc, g) => acc + g.questions.length,
        0
      );
    }
    return 0;
  }, [part]);

  const getPartDescription = (num: number) => {
    const descriptions: Record<number, string> = {
      1: 'Picture Description',
      2: 'Question-Response',
      3: 'Conversation',
      4: 'Short Talk',
      5: 'Incomplete Sentence',
      6: 'Error Identification',
      7: 'Reading Comprehension',
    };
    return descriptions[num] || '';
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="mb-6">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                {partNumber}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">
                  {part.partName}
                </h3>
                <p className="text-sm text-slate-500">
                  {getPartDescription(partNumber)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                {questionCount} questions
              </Badge>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-4 space-y-4 pl-4">
            {/* Individual Questions (Parts 1, 2, 5) */}
            {part.questions && part.questions.length > 0 && (
              <div className="space-y-4">
                {part.questions.map((question, idx) => (
                  <QuestionCard
                    key={question._id || idx}
                    question={question}
                    index={idx}
                  />
                ))}
              </div>
            )}

            {/* Question Groups (Parts 3, 4, 6, 7) */}
            {part.questionGroups && part.questionGroups.length > 0 && (
              <div className="space-y-6">
                {part.questionGroups.map((group, idx) => (
                  <QuestionGroupCard
                    key={group._id || idx}
                    group={group}
                    partNumber={partNumber}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {(!part.questions || part.questions.length === 0) &&
              (!part.questionGroups || part.questionGroups.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  <HelpCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No questions in this part yet</p>
                </div>
              )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const AdminTestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const { data: test, isLoading, error } = useGetAdminTestByIdQuery(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading test information...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Test Not Found
          </h2>
          <p className="text-slate-500 mb-4">
            The test does not exist or has been deleted
          </p>
          <Button onClick={() => navigate('/admin/tests')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  const totalQuestions = test.parts.reduce((acc, part) => {
    if (part.questions) return acc + part.questions.length;
    if (part.questionGroups) {
      return (
        acc + part.questionGroups.reduce((a, g) => a + g.questions.length, 0)
      );
    }
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/tests')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                {test.testTitle}
              </h1>
              <Badge className="bg-blue-100 text-blue-700 border-0">
                <FileText className="w-3 h-3 mr-1" />
                Listening & Reading
              </Badge>
            </div>

            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
              <Button
                onClick={() => navigate(`/admin/tests/${id}/edit`)}
                className="bg-blue-600 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-blue-600 text-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Duration</p>
                <p className="text-2xl font-bold">{test.duration} min</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-purple-600 text-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-purple-100 text-sm">Total Questions</p>
                <p className="text-2xl font-bold">{totalQuestions}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-green-600 text-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-green-100 text-sm">Parts</p>
                <p className="text-2xl font-bold">{test.parts.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parts Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-white shadow-md p-1 h-auto flex-wrap">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              All
            </TabsTrigger>
            {test.parts.map((part) => (
              <TabsTrigger
                key={part.partName}
                value={part.partName}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                {part.partName}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-6">
              {test.parts.map((part) => (
                <PartSection key={part.partName} part={part} />
              ))}
            </div>
          </TabsContent>

          {test.parts.map((part) => (
            <TabsContent
              key={part.partName}
              value={part.partName}
              className="mt-6"
            >
              <PartSection part={part} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminTestDetail;
