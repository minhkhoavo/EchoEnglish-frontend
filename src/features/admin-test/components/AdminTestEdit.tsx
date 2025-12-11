import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  useGetAdminTestByIdQuery,
  useUpdateTestMutation,
} from '../services/adminTestApi';
import type {
  AdminTest,
  TestPart,
  TestQuestion,
  TestQuestionGroup,
} from '../types/admin-test.types';
import { RichTextEditor } from './RichTextEditor';
import { AudioPreview, ImagePreview } from './MediaPreview';
import { QuestionPreviewDialog, GroupPreviewDialog } from './PreviewDialogs';

const QuestionEditor = ({
  question,
  partNumber,
  onChange,
  onRemove,
}: {
  question: TestQuestion;
  partNumber: number;
  onChange: (updated: TestQuestion) => void;
  onRemove: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasOptions4 = ![2].includes(partNumber); // Part 2 only has 3 options

  const updateOption = (label: string, text: string) => {
    const newOptions = question.options.map((opt) =>
      opt.label === label ? { ...opt, text } : opt
    );
    onChange({ ...question, options: newOptions });
  };

  return (
    <Card className="border border-slate-200">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-4 cursor-pointer hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-slate-400" />
                <Badge className="bg-blue-600 text-white">
                  Question {question.questionNumber}
                </Badge>
                <span className="text-sm text-slate-500 truncate max-w-md">
                  {question.questionText || 'No content yet'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <QuestionPreviewDialog
                  question={question}
                  partNumber={partNumber}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 pt-0 space-y-4">
            {/* Question Text */}
            <div>
              <Label>Question Content</Label>
              <Input
                value={question.questionText || ''}
                onChange={(e) =>
                  onChange({ ...question, questionText: e.target.value })
                }
                placeholder="Enter question content..."
                className="mt-1"
              />
            </div>

            {/* Media URLs with Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AudioPreview
                url={question.media?.audioUrl || ''}
                onChange={(url) =>
                  onChange({
                    ...question,
                    media: { ...question.media, audioUrl: url || null },
                  })
                }
              />
              <ImagePreview
                urls={question.media?.imageUrls || []}
                onChange={(urls) =>
                  onChange({
                    ...question,
                    media: {
                      ...question.media,
                      imageUrls: urls.length > 0 ? urls : null,
                    },
                  })
                }
              />
            </div>

            {/* Transcript with Editor */}
            <RichTextEditor
              label="Transcript"
              value={question.media?.transcript || ''}
              onChange={(value) =>
                onChange({
                  ...question,
                  media: { ...question.media, transcript: value || null },
                })
              }
              placeholder="Enter transcript..."
              minHeight="80px"
            />

            {/* Options */}
            <div>
              <Label>Answers</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {question.options
                  .slice(0, hasOptions4 ? 4 : 3)
                  .map((option) => (
                    <div key={option.label} className="flex items-center gap-2">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          option.label === question.correctAnswer
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {option.label}
                      </div>
                      <Input
                        value={option.text}
                        onChange={(e) =>
                          updateOption(option.label, e.target.value)
                        }
                        placeholder={`Answer ${option.label}`}
                        className="flex-1"
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Correct Answer */}
            <div className="flex items-center gap-4">
              <Label>Correct Answer:</Label>
              <Select
                value={question.correctAnswer}
                onValueChange={(value) =>
                  onChange({ ...question, correctAnswer: value })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  {hasOptions4 && <SelectItem value="D">D</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* Explanation with Editor */}
            <RichTextEditor
              label="Explanation"
              value={question.explanation || ''}
              onChange={(value) =>
                onChange({ ...question, explanation: value })
              }
              placeholder="Enter answer explanation..."
              minHeight="100px"
            />

            {/* Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Độ khó</Label>
                <Select
                  value={question.contentTags?.difficulty || 'B1'}
                  onValueChange={(value) =>
                    onChange({
                      ...question,
                      contentTags: {
                        ...question.contentTags,
                        difficulty: value,
                      },
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1">A1 - Beginner</SelectItem>
                    <SelectItem value="A2">A2 - Elementary</SelectItem>
                    <SelectItem value="B1">B1 - Intermediate</SelectItem>
                    <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                    <SelectItem value="C1">C1 - Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Topics (comma-separated)</Label>
                <Input
                  value={question.contentTags?.domain?.join(', ') || ''}
                  onChange={(e) =>
                    onChange({
                      ...question,
                      contentTags: {
                        ...question.contentTags,
                        domain: e.target.value
                          ? e.target.value.split(',').map((s) => s.trim())
                          : [],
                      },
                    })
                  }
                  placeholder="business, office, travel"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const GroupEditor = ({
  group,
  partNumber,
  groupIndex,
  onGroupChange,
  onRemoveGroup,
}: {
  group: TestQuestionGroup;
  partNumber: number;
  groupIndex: number;
  onGroupChange: (updated: TestQuestionGroup) => void;
  onRemoveGroup: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const addQuestion = () => {
    const maxNum = Math.max(0, ...group.questions.map((q) => q.questionNumber));
    const newQuestion: TestQuestion = {
      questionNumber: maxNum + 1,
      questionText: '',
      options: [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' },
      ],
      correctAnswer: 'A',
      explanation: '',
      media: {},
      contentTags: { difficulty: 'B1', domain: [] },
      skillTags: { part: String(partNumber) },
    };
    onGroupChange({ ...group, questions: [...group.questions, newQuestion] });
  };

  const updateQuestion = (index: number, updated: TestQuestion) => {
    const newQuestions = [...group.questions];
    newQuestions[index] = updated;
    onGroupChange({ ...group, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = group.questions.filter((_, i) => i !== index);
    onGroupChange({ ...group, questions: newQuestions });
  };

  return (
    <Card className="border-2 border-purple-200 bg-purple-50/30">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="p-4 cursor-pointer hover:bg-purple-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-slate-400" />
                <Badge className="bg-purple-600 text-white">
                  Group {groupIndex + 1} ({group.questions.length} questions)
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <GroupPreviewDialog
                  group={group}
                  partNumber={partNumber}
                  groupIndex={groupIndex}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveGroup();
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 pt-0 space-y-4">
            {/* Group Context */}
            <div className="p-4 bg-white rounded-lg border border-purple-200 space-y-4">
              <h4 className="font-semibold text-purple-700">Shared Context</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AudioPreview
                  url={group.groupContext?.audioUrl || ''}
                  onChange={(url) =>
                    onGroupChange({
                      ...group,
                      groupContext: {
                        ...group.groupContext,
                        audioUrl: url || null,
                      },
                    })
                  }
                />
                <ImagePreview
                  urls={group.groupContext?.imageUrls || []}
                  onChange={(urls) =>
                    onGroupChange({
                      ...group,
                      groupContext: {
                        ...group.groupContext,
                        imageUrls: urls.length > 0 ? urls : null,
                      },
                    })
                  }
                />
              </div>

              <RichTextEditor
                label="Passage"
                value={group.groupContext?.passageHtml || ''}
                onChange={(value) =>
                  onGroupChange({
                    ...group,
                    groupContext: {
                      ...group.groupContext,
                      passageHtml: value || null,
                    },
                  })
                }
                placeholder="Enter passage content..."
                minHeight="120px"
              />

              <RichTextEditor
                label="Transcript"
                value={group.groupContext?.transcript || ''}
                onChange={(value) =>
                  onGroupChange({
                    ...group,
                    groupContext: {
                      ...group.groupContext,
                      transcript: value || null,
                    },
                  })
                }
                placeholder="Enter transcript..."
                minHeight="100px"
              />

              <RichTextEditor
                label="Translation"
                value={group.groupContext?.translation || ''}
                onChange={(value) =>
                  onGroupChange({
                    ...group,
                    groupContext: {
                      ...group.groupContext,
                      translation: value || null,
                    },
                  })
                }
                placeholder="Enter translation..."
                minHeight="100px"
              />
            </div>

            {/* Questions in Group */}
            <div className="space-y-3">
              {group.questions.map((question, idx) => (
                <QuestionEditor
                  key={idx}
                  question={question}
                  partNumber={partNumber}
                  onChange={(updated) => updateQuestion(idx, updated)}
                  onRemove={() => removeQuestion(idx)}
                />
              ))}

              <Button
                variant="outline"
                onClick={addQuestion}
                className="w-full border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const PartEditor = ({
  part,
  onChange,
}: {
  part: TestPart;
  onChange: (updated: TestPart) => void;
}) => {
  const partNumber = parseInt(part.partName.replace('Part ', ''));
  const isGroupPart = [3, 4, 6, 7].includes(partNumber);

  const addQuestion = () => {
    const questions = part.questions || [];
    const maxNum = Math.max(0, ...questions.map((q) => q.questionNumber));
    const newQuestion: TestQuestion = {
      questionNumber: maxNum + 1,
      questionText: '',
      options:
        partNumber === 2
          ? [
              { label: 'A', text: '' },
              { label: 'B', text: '' },
              { label: 'C', text: '' },
            ]
          : [
              { label: 'A', text: '' },
              { label: 'B', text: '' },
              { label: 'C', text: '' },
              { label: 'D', text: '' },
            ],
      correctAnswer: 'A',
      explanation: '',
      media: {},
      contentTags: { difficulty: 'B1', domain: [] },
      skillTags: { part: String(partNumber) },
    };
    onChange({ ...part, questions: [...questions, newQuestion] });
  };

  const addGroup = () => {
    const groups = part.questionGroups || [];
    const allQuestions = groups.flatMap((g) => g.questions);
    const maxNum = Math.max(0, ...allQuestions.map((q) => q.questionNumber));

    const newGroup: TestQuestionGroup = {
      groupContext: {},
      questions: [
        {
          questionNumber: maxNum + 1,
          questionText: '',
          options: [
            { label: 'A', text: '' },
            { label: 'B', text: '' },
            { label: 'C', text: '' },
            { label: 'D', text: '' },
          ],
          correctAnswer: 'A',
          explanation: '',
          contentTags: { difficulty: 'B1', domain: [] },
          skillTags: { part: String(partNumber) },
        },
      ],
    };
    onChange({ ...part, questionGroups: [...groups, newGroup] });
  };

  const updateQuestion = (index: number, updated: TestQuestion) => {
    const questions = [...(part.questions || [])];
    questions[index] = updated;
    onChange({ ...part, questions });
  };

  const removeQuestion = (index: number) => {
    const questions = (part.questions || []).filter((_, i) => i !== index);
    onChange({ ...part, questions });
  };

  const updateGroup = (index: number, updated: TestQuestionGroup) => {
    const groups = [...(part.questionGroups || [])];
    groups[index] = updated;
    onChange({ ...part, questionGroups: groups });
  };

  const removeGroup = (index: number) => {
    const groups = (part.questionGroups || []).filter((_, i) => i !== index);
    onChange({ ...part, questionGroups: groups });
  };

  return (
    <div className="space-y-4">
      {!isGroupPart && (
        <>
          {(part.questions || []).map((question, idx) => (
            <QuestionEditor
              key={idx}
              question={question}
              partNumber={partNumber}
              onChange={(updated) => updateQuestion(idx, updated)}
              onRemove={() => removeQuestion(idx)}
            />
          ))}
          <Button
            variant="outline"
            onClick={addQuestion}
            className="w-full border-dashed border-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Question
          </Button>
        </>
      )}

      {isGroupPart && (
        <>
          {(part.questionGroups || []).map((group, idx) => (
            <GroupEditor
              key={idx}
              group={group}
              partNumber={partNumber}
              groupIndex={idx}
              onGroupChange={(updated) => updateGroup(idx, updated)}
              onRemoveGroup={() => removeGroup(idx)}
            />
          ))}
          <Button
            variant="outline"
            onClick={addGroup}
            className="w-full border-dashed border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Question Group
          </Button>
        </>
      )}
    </div>
  );
};

export const AdminTestEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [hasChanges, setHasChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const {
    data: originalTest,
    isLoading,
    error,
  } = useGetAdminTestByIdQuery(id || '');
  const [updateTest, { isLoading: isSaving }] = useUpdateTestMutation();

  const [test, setTest] = useState<AdminTest | null>(null);

  useEffect(() => {
    if (originalTest) {
      setTest({ ...originalTest });
    }
  }, [originalTest]);

  const handleSave = async () => {
    if (!test) return;

    // Calculate total number of questions
    const totalQuestions = test.parts.reduce((acc, part) => {
      if (part.questions) return acc + part.questions.length;
      if (part.questionGroups) {
        return (
          acc + part.questionGroups.reduce((a, g) => a + g.questions.length, 0)
        );
      }
      return acc;
    }, 0);

    try {
      await updateTest({
        id: test._id,
        data: {
          testTitle: test.testTitle,
          duration: test.duration,
          number_of_questions: totalQuestions,
          number_of_parts: test.number_of_parts,
          parts: test.parts,
        },
      }).unwrap();

      toast.success('Test saved successfully');

      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save test');
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowUnsavedDialog(true);
    } else {
      navigate('/admin/tests');
    }
  };

  const updateTestField = <K extends keyof AdminTest>(
    field: K,
    value: AdminTest[K]
  ) => {
    if (!test) return;
    setTest({ ...test, [field]: value });
    setHasChanges(true);
  };

  const updatePart = (partName: string, updated: TestPart) => {
    if (!test) return;
    const newParts = test.parts.map((p) =>
      p.partName === partName ? updated : p
    );
    setTest({ ...test, parts: newParts });
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <HelpCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Test Not Found
          </h2>
          <Button onClick={() => navigate('/admin/tests')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Edit Test</h1>
              <p className="text-sm text-slate-500">{test.testTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700"
              >
                Unsaved Changes
              </Badge>
            )}
            <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white shadow-md p-1 mb-6">
            <TabsTrigger value="info">General Information</TabsTrigger>
            {test.parts.map((part) => (
              <TabsTrigger key={part.partName} value={part.partName}>
                {part.partName}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* General Info Tab */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đề thi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tên đề thi *</Label>
                  <Input
                    value={test.testTitle}
                    onChange={(e) =>
                      updateTestField('testTitle', e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Thời gian (phút)</Label>
                    <Input
                      type="number"
                      value={test.duration}
                      onChange={(e) =>
                        updateTestField(
                          'duration',
                          parseInt(e.target.value) || 120
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Number of Questions</Label>
                    <Input
                      type="number"
                      value={test.number_of_questions}
                      onChange={(e) =>
                        updateTestField(
                          'number_of_questions',
                          parseInt(e.target.value) || 200
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Number of Parts</Label>
                    <Input
                      type="number"
                      value={test.number_of_parts}
                      disabled
                      className="mt-1 bg-slate-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Part Tabs */}
          {test.parts.map((part) => (
            <TabsContent key={part.partName} value={part.partName}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{part.partName}</span>
                    <Badge variant="secondary">
                      {part.questions?.length ||
                        part.questionGroups?.reduce(
                          (a, g) => a + g.questions.length,
                          0
                        ) ||
                        0}{' '}
                      questions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PartEditor
                    part={part}
                    onChange={(updated) => updatePart(part.partName, updated)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Unsaved Changes Dialog */}
        <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unsaved Changes</DialogTitle>
              <DialogDescription>
                You have unsaved changes. Do you want to save before leaving?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUnsavedDialog(false);
                  navigate('/admin/tests');
                }}
              >
                Discard
              </Button>
              <Button
                onClick={async () => {
                  await handleSave();
                  setShowUnsavedDialog(false);
                  navigate('/admin/tests');
                }}
              >
                Save and Exit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminTestEdit;
