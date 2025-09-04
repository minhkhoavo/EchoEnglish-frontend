import { Plus, Brain, Target, Clock, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  addBuilderQuestion,
  updateCurrentBuilderQuestion,
  updateBuilderOption,
  type QuizQuestionBuilder,
} from './slices/quizSlice';
import { useCreateQuizMutation } from './services/quizApi';

export const QuizBuilder = () => {
  const dispatch = useAppDispatch();
  const { builderQuestions, currentBuilderQuestion } = useAppSelector((state) => state.quiz);
  const [createQuiz, { isLoading }] = useCreateQuizMutation();

  const handleAddQuestion = async () => {
    if (currentBuilderQuestion.question && currentBuilderQuestion.options?.every(opt => opt.trim())) {
      const newQuestion: QuizQuestionBuilder = {
        id: Date.now().toString(),
        question: currentBuilderQuestion.question,
        options: currentBuilderQuestion.options,
        correctAnswer: currentBuilderQuestion.correctAnswer || 0,
        explanation: currentBuilderQuestion.explanation,
      };
      dispatch(addBuilderQuestion(newQuestion));
      // Optionally, send to API
      // await createQuiz([...builderQuestions, newQuestion]);
    }
  };

  const handleUpdateOption = (index: number, value: string) => {
    dispatch(updateBuilderOption({ index, value }));
  };

  const handleUpdateCurrentQuestion = <K extends keyof QuizQuestionBuilder>(field: K, value: QuizQuestionBuilder[K]) => {
    dispatch(updateCurrentBuilderQuestion({ [field]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-full shadow-glow">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Quiz Builder
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create engaging TOEIC quizzes from your uploaded content. AI will help generate questions automatically.
        </p>
      </div>

      {/* Quiz Settings */}
      <Card className="bg-gradient-card shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Quiz Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quiz Type</label>
              <Select defaultValue="multiple-choice">
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="reading">Reading Comprehension</SelectItem>
                  <SelectItem value="listening">Listening Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select defaultValue="intermediate">
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Limit</label>
              <Select defaultValue="30">
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button className="bg-gradient-success hover:scale-105 transition-all duration-300 shadow-soft">
              <Shuffle className="h-4 w-4 mr-2" />
              Auto-Generate from Content
            </Button>
            <Button variant="outline" className="border-primary/20 hover:bg-gradient-hero">
              <Clock className="h-4 w-4 mr-2" />
              Preview Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Builder */}
      <Card className="bg-gradient-card shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-secondary" />
            <span>Add New Question</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Question</label>
            <Textarea
              value={currentBuilderQuestion.question}
              onChange={(e) => handleUpdateCurrentQuestion('question', e.target.value)}
              placeholder="Enter your TOEIC question here..."
              className="bg-background/50 border-border/50 focus:border-primary transition-all duration-300 min-h-[100px]"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Answer Options</label>
            {currentBuilderQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-hero rounded-full text-sm font-medium text-primary">
                  {String.fromCharCode(65 + index)}
                </div>
                <Input
                  value={option}
                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="flex-1 bg-background/50 border-border/50 focus:border-primary transition-all duration-300"
                />
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={currentBuilderQuestion.correctAnswer === index}
                    onChange={() => handleUpdateCurrentQuestion('correctAnswer', index)}
                    className="w-4 h-4 text-primary accent-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Explanation (Optional)</label>
            <Textarea
              value={currentBuilderQuestion.explanation || ''}
              onChange={(e) => handleUpdateCurrentQuestion('explanation', e.target.value)}
              placeholder="Explain why this answer is correct..."
              className="bg-background/50 border-border/50 focus:border-primary transition-all duration-300"
            />
          </div>

          <Button 
            onClick={handleAddQuestion}
            className="w-full bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-soft hover:shadow-glow"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isLoading ? 'Adding...' : 'Add Question'}
          </Button>
        </CardContent>
      </Card>

      {/* Questions List */}
      {builderQuestions.length > 0 && (
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quiz Questions ({builderQuestions.length})</span>
              <Badge className="bg-gradient-success text-success-foreground">
                Ready to Use
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {builderQuestions.map((question, index) => (
              <div key={question.id} className="p-4 bg-background/30 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-foreground">
                    Question {index + 1}
                  </h4>
                  <Badge variant="outline" className="border-primary/20 text-primary">
                    {String.fromCharCode(65 + question.correctAnswer)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{question.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`text-xs p-2 rounded border ${
                        optIndex === question.correctAnswer
                          ? 'bg-success/10 border-success/30 text-success'
                          : 'bg-background/50 border-border/30'
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
