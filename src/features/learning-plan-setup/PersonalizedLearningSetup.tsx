import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Calendar } from '../../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  CalendarIcon,
  Loader2,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
  useGenerateLearningPlanMutation,
} from './services/learningPlanApi';
import type {
  UserPreferencesPartial,
  PrimaryGoal,
  StudyTimePerDay,
  PreferredStudyTime,
  CurrentLevel,
  Domain,
  WeekDay,
} from './types';
import {
  PRIMARY_GOAL_LABELS,
  STUDY_TIME_OPTIONS,
  PREFERRED_STUDY_TIME_LABELS,
  CURRENT_LEVEL_LABELS,
  WEEKDAY_LABELS,
  DOMAIN_LABELS,
} from './types';

const TOTAL_STEPS = 4;

export function PersonalizedLearningSetup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferencesPartial>({
    studyDaysOfWeek: [],
    contentInterests: [],
  });
  const [userPrompt, setUserPrompt] = useState('');

  const { data: existingPreferences, isLoading: isLoadingPreferences } =
    useGetUserPreferencesQuery();

  const [updatePreferences, { isLoading: isUpdating }] =
    useUpdateUserPreferencesMutation();
  const [generatePlan, { isLoading: isGenerating, isSuccess: isGenerated }] =
    useGenerateLearningPlanMutation();

  // Load existing preferences
  useState(() => {
    if (existingPreferences) {
      setPreferences({
        ...existingPreferences,
        studyDaysOfWeek: existingPreferences.studyDaysOfWeek || [],
        contentInterests: existingPreferences.contentInterests || [],
      });
    }
  });

  const validateStep = (step: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!preferences.primaryGoal)
          errors.push('Please select your primary goal');
        if (
          !preferences.targetScore ||
          preferences.targetScore < 300 ||
          preferences.targetScore > 990
        )
          errors.push('Target score must be between 300-990');
        if (!preferences.currentLevel)
          errors.push('Please select your current level');
        break;
      case 2:
        if (!preferences.studyTimePerDay)
          errors.push('Please select study time per day');
        if (!preferences.weeklyStudyDays)
          errors.push('Please select weekly study days');
        if (!preferences.preferredStudyTime)
          errors.push('Please select preferred study time');
        if (!preferences.studyDaysOfWeek?.length)
          errors.push('Please select at least one study day');
        break;
      case 3:
        if (
          !preferences.contentInterests?.length ||
          preferences.contentInterests.length < 3
        ) {
          errors.push('Please select at least 3 content interests');
        }
        break;
    }

    return { valid: errors.length === 0, errors };
  };

  const handleNext = async () => {
    const { valid, errors } = validateStep(currentStep);

    if (!valid) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save preferences and generate plan
      await handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    // First save preferences
    try {
      await updatePreferences(preferences).unwrap();

      // Then generate plan
      if (
        preferences.targetScore &&
        preferences.studyTimePerDay &&
        preferences.weeklyStudyDays
      ) {
        await generatePlan({
          targetScore: preferences.targetScore,
          studyTimePerDay: preferences.studyTimePerDay,
          weeklyStudyDays: preferences.weeklyStudyDays,
          userPrompt: userPrompt.trim() || undefined,
        }).unwrap();

        toast.success('Learning plan generated successfully!');
      }
    } catch (error) {
      toast.error('Failed to generate plan. Please try again.');
    }
  };

  const toggleDomain = (domain: Domain) => {
    const interests = preferences.contentInterests || [];
    if (interests.includes(domain)) {
      setPreferences({
        ...preferences,
        contentInterests: interests.filter((d: Domain) => d !== domain),
      });
    } else {
      setPreferences({
        ...preferences,
        contentInterests: [...interests, domain],
      });
    }
  };

  const toggleWeekday = (day: WeekDay) => {
    const days = preferences.studyDaysOfWeek || [];
    if (days.includes(day)) {
      setPreferences({
        ...preferences,
        studyDaysOfWeek: days.filter((d: WeekDay) => d !== day),
      });
    } else {
      setPreferences({
        ...preferences,
        studyDaysOfWeek: [...days, day].sort(),
      });
    }
  };

  if (isLoadingPreferences) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-2xl">
                  Personalized Learning Setup
                </CardTitle>
              </div>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Goal & Target */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center space-y-2 py-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-2">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h2 className="text-2xl font-bold">What's Your Goal?</h2>
                  <p className="text-muted-foreground">
                    Let's understand what drives your learning journey
                  </p>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Primary Goal
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(PRIMARY_GOAL_LABELS).map(
                      ([value, label]) => {
                        const icons: Record<string, string> = {
                          toeic_preparation: '📝',
                          business_english: '💼',
                          academic_excellence: '🎓',
                          career_advancement: '📈',
                        };
                        const isSelected = preferences.primaryGoal === value;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setPreferences({
                                ...preferences,
                                primaryGoal: value as PrimaryGoal,
                              })
                            }
                            className={cn(
                              'p-4 rounded-lg border-2 transition-all text-left hover:shadow-md',
                              isSelected
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            )}
                          >
                            <div className="text-2xl mb-2">
                              {icons[value as keyof typeof icons]}
                            </div>
                            <div className="font-semibold text-sm">{label}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {value === 'toeic_preparation' &&
                                'Master TOEIC test strategies'}
                              {value === 'business_english' &&
                                'Professional communication skills'}
                              {value === 'academic_excellence' &&
                                'University & study abroad prep'}
                              {value === 'career_advancement' &&
                                'Grow in your profession'}
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="targetScore"
                      className="text-base font-semibold"
                    >
                      Target Score
                    </Label>
                    <Input
                      id="targetScore"
                      type="number"
                      min={300}
                      max={990}
                      step={10}
                      value={preferences.targetScore || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPreferences({
                          ...preferences,
                          targetScore: Number(e.target.value),
                        })
                      }
                      placeholder="e.g., 600"
                      className="mt-2 text-lg"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Score between 300-990
                    </p>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">
                      Target Deadline (Optional)
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal mt-2',
                            !preferences.targetDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {preferences.targetDate
                            ? format(new Date(preferences.targetDate), 'PPP')
                            : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            preferences.targetDate
                              ? new Date(preferences.targetDate)
                              : undefined
                          }
                          onSelect={(date: Date | undefined) =>
                            date &&
                            setPreferences({
                              ...preferences,
                              targetDate: date.toISOString(),
                            })
                          }
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">
                    Current Level
                  </Label>
                  <Select
                    value={preferences.currentLevel}
                    onValueChange={(val) =>
                      setPreferences({
                        ...preferences,
                        currentLevel: val as CurrentLevel,
                      })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your current level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CURRENT_LEVEL_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Study Schedule */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center space-y-2 py-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <span className="text-3xl">📅</span>
                  </div>
                  <h2 className="text-2xl font-bold">Study Schedule</h2>
                  <p className="text-muted-foreground">
                    Help us create your perfect study routine
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-semibold">
                      Study Time Per Day
                    </Label>
                    <Select
                      value={preferences.studyTimePerDay?.toString()}
                      onValueChange={(val) =>
                        setPreferences({
                          ...preferences,
                          studyTimePerDay: Number(val) as StudyTimePerDay,
                        })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select study time" />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDY_TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time.toString()}>
                            {time} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">
                      Days Per Week
                    </Label>
                    <Select
                      value={preferences.weeklyStudyDays?.toString()}
                      onValueChange={(val) =>
                        setPreferences({
                          ...preferences,
                          weeklyStudyDays: Number(val),
                        })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select days" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                          <SelectItem key={days} value={days.toString()}>
                            {days} {days === 1 ? 'day' : 'days'} per week
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Which days work best for you?
                  </Label>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.entries(WEEKDAY_LABELS).map(([day, label]) => {
                      const dayNum = Number(day) as WeekDay;
                      const isSelected =
                        preferences.studyDaysOfWeek?.includes(dayNum);

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleWeekday(dayNum)}
                          className={cn(
                            'p-3 rounded-lg text-center transition-all border-2',
                            isSelected
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          )}
                        >
                          <div className="font-semibold text-sm">
                            {label.slice(0, 3)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">
                    Preferred Study Time
                  </Label>
                  <Select
                    value={preferences.preferredStudyTime}
                    onValueChange={(val) =>
                      setPreferences({
                        ...preferences,
                        preferredStudyTime: val as PreferredStudyTime,
                      })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="When do you study best?" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PREFERRED_STUDY_TIME_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Content Interests */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center space-y-2 py-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <span className="text-3xl">📚</span>
                  </div>
                  <h2 className="text-2xl font-bold">Content Interests</h2>
                  <p className="text-muted-foreground">
                    Choose topics you're interested in (select at least 3)
                  </p>
                </div>

                {preferences.contentInterests &&
                  preferences.contentInterests.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-4 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">Selected:</span>
                      {preferences.contentInterests.map((interest) => (
                        <Badge key={interest} variant="secondary">
                          {DOMAIN_LABELS[interest]}
                        </Badge>
                      ))}
                    </div>
                  )}

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries({
                    'Business & Professional': [
                      'business',
                      'office',
                      'finance',
                      'marketing',
                      'human_resources',
                    ],
                    'Technology & Science': [
                      'technology',
                      'science',
                      'technical',
                    ],
                    'Education & Health': ['education', 'healthcare', 'health'],
                    'Travel & Lifestyle': [
                      'travel',
                      'hospitality',
                      'cooking',
                      'daily_life',
                    ],
                    'Media & Culture': [
                      'news',
                      'entertainment',
                      'sports',
                      'media',
                    ],
                    General: ['general'],
                  }).map(([category, domains]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                        {category}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {domains.map((domain) => {
                          const typedDomain = domain as Domain;
                          const isSelected =
                            preferences.contentInterests?.includes(typedDomain);

                          return (
                            <button
                              key={domain}
                              type="button"
                              onClick={() => toggleDomain(typedDomain)}
                              className={cn(
                                'p-3 rounded-lg text-sm font-medium transition-all border-2 text-left',
                                isSelected
                                  ? 'border-green-600 bg-green-50'
                                  : 'border-gray-200 hover:border-green-300'
                              )}
                            >
                              {DOMAIN_LABELS[typedDomain]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Generate */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center space-y-2 py-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-2">
                    <Sparkles className="h-8 w-8 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Generate Your Plan</h2>
                  <p className="text-muted-foreground">
                    Add any specific focus areas or let AI create the perfect
                    plan for you
                  </p>
                </div>

                {isGenerated && (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Your personalized learning plan has been generated
                      successfully! 🎉
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label className="text-base font-semibold">
                    Additional Focus Areas (Optional)
                  </Label>
                  <Textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="e.g., I need to improve my listening skills, focus on business vocabulary, prepare for Part 7 reading comprehension..."
                    rows={5}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Tell us what you want to focus on, and AI will tailor your
                    plan accordingly
                  </p>
                </div>

                {/* Summary */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <h3 className="font-semibold">Your Preferences Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Goal:</span>{' '}
                      <span className="font-medium">
                        {preferences.primaryGoal &&
                          PRIMARY_GOAL_LABELS[preferences.primaryGoal]}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span>{' '}
                      <span className="font-medium">
                        {preferences.targetScore}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Study Time:</span>{' '}
                      <span className="font-medium">
                        {preferences.studyTimePerDay} min/day
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Days/Week:</span>{' '}
                      <span className="font-medium">
                        {preferences.weeklyStudyDays}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Interests:</span>{' '}
                      <span className="font-medium">
                        {preferences.contentInterests?.length || 0} topics
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isUpdating || isGenerating}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={isUpdating || isGenerating}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isUpdating || isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isGenerating ? 'Generating...' : 'Saving...'}
                  </>
                ) : currentStep === TOTAL_STEPS ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate My Plan
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
