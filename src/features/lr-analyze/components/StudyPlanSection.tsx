import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Video,
  FileText,
  Zap,
  Clock,
  Target,
  CheckCircle2,
  Play,
  ChevronDown,
  ChevronRight,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import type {
  StudyPlanItem,
  LearningResource,
  WeaknessDrill,
} from '../types/analysis';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ResourceContentModal } from './ResourceContentModal';
import { DrillContentModal } from './DrillContentModal';
import { toast } from '@/hooks/use-toast';

interface StudyPlanSectionProps {
  studyPlan: StudyPlanItem[];
}

export function StudyPlanSection({ studyPlan }: StudyPlanSectionProps) {
  const navigate = useNavigate();
  const { attemptId } = useParams<{ attemptId: string }>();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set([studyPlan[0]?._id || studyPlan[0]?.id || 'sp1'])
  );

  // Modal states
  const [selectedResource, setSelectedResource] =
    useState<LearningResource | null>(null);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState<WeaknessDrill | null>(
    null
  );
  const [drillModalOpen, setDrillModalOpen] = useState(false);

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Handle resource click
  const handleResourceClick = (resource: LearningResource) => {
    if (resource.type === 'article' && resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (resource.type === 'video' && resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (
      resource.type === 'vocabulary_set' ||
      resource.type === 'personalized_guide'
    ) {
      setSelectedResource(resource);
      setResourceModalOpen(true);
      return;
    }

    if (resource.generatedContent) {
      setSelectedResource(resource);
      setResourceModalOpen(true);
      return;
    }

    toast({
      title: 'Resource not available',
      description: 'This resource type is not yet supported.',
      variant: 'destructive',
    });
  };

  // Handle drill click
  const handleDrillClick = (drill: WeaknessDrill) => {
    setSelectedDrill(drill);
    setDrillModalOpen(true);
  };

  // Handle start drill
  const handleStartDrill = (drillId: string) => {
    toast({
      title: 'Starting drill...',
      description: `Drill ID: ${drillId}`,
    });
  };

  const getResourceIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      video: Video,
      article: FileText,
      flashcard: BookOpen,
      drill: Zap,
    };
    return icons[type] || BookOpen;
  };

  const getResourceColor = (type: string) => {
    const colors: Record<string, string> = {
      video: 'bg-[#ef4444]',
      article: 'bg-[#3b82f6]',
      flashcard: 'bg-[#8b5cf6]',
      drill: 'bg-[#10b981]',
    };
    return colors[type] || 'bg-[#64748b]';
  };

  const getPriorityConfig = (priority: number) => {
    const configs = {
      1: {
        bgColor: 'bg-gradient-to-br from-[#fef2f2] to-[#fee2e2]',
        borderColor: 'border-[#fecaca]',
        badgeBg: 'bg-[#dc2626]',
        label: 'Priority 1 - Critical',
        labelColor: 'text-[#dc2626]',
      },
      2: {
        bgColor: 'bg-gradient-to-br from-[#fef3c7] to-[#fde68a]',
        borderColor: 'border-[#fde68a]',
        badgeBg: 'bg-[#f59e0b]',
        label: 'Priority 2 - High',
        labelColor: 'text-[#f59e0b]',
      },
      3: {
        bgColor: 'bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe]',
        borderColor: 'border-[#bfdbfe]',
        badgeBg: 'bg-[#3b82f6]',
        label: 'Priority 3 - Medium',
        labelColor: 'text-[#3b82f6]',
      },
    };
    return configs[priority as keyof typeof configs] || configs[3];
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="p-5 bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border border-[#bbf7d0]">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-[#10b981] rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#0f172a] mb-2">
              Personalized Study Roadmap
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed mb-3">
              Based on your diagnosed weaknesses, we've created a prioritized
              learning path. Start with Priority 1 items for maximum score
              improvement. Each item includes carefully selected resources and
              targeted practice drills.
            </p>
          </div>
        </div>
      </Card>

      {/* Study Plan Items */}
      <div className="space-y-4">
        {studyPlan.map((item) => {
          const itemId = item._id || item.id || '';
          const isExpanded = expandedItems.has(itemId);
          const config = getPriorityConfig(item.priority);

          const targetWeaknessText =
            typeof item.targetWeakness === 'string'
              ? item.targetWeakness
              : `${item.targetWeakness.skillName} (${item.targetWeakness.severity})`;

          const drills = item.practiceDrills || item.drills || [];

          return (
            <Collapsible
              key={itemId}
              open={isExpanded}
              onOpenChange={() => toggleItem(itemId)}
            >
              <Card
                className={`${config.bgColor} border-2 ${config.borderColor}`}
              >
                <CollapsibleTrigger asChild>
                  <button className="w-full p-5 text-left hover:opacity-90 transition-opacity">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-3 ${config.badgeBg} rounded-lg flex-shrink-0`}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-6 h-6 text-white" />
                        ) : (
                          <ChevronRight className="w-6 h-6 text-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <Badge
                              className={`${config.badgeBg} text-white border-0 mb-2`}
                            >
                              {config.label}
                            </Badge>
                            <h3 className="text-lg font-bold text-[#0f172a] mb-2">
                              {item.title}
                            </h3>
                            <p className="text-sm text-[#475569]">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[#64748b]">
                              Progress
                            </span>
                            <span className="text-xs font-bold text-[#0f172a]">
                              {item.progress}%
                            </span>
                          </div>
                          <div className="h-2 bg-white/70 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${config.badgeBg} transition-all duration-500`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-6 pb-6 pt-2">
                    {/* Target Weakness */}
                    <div className="mb-6 p-4 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-[#dc2626]" />
                        <h4 className="text-sm font-bold text-[#0f172a]">
                          Target Weakness
                        </h4>
                      </div>
                      <p className="text-sm text-[#475569] mb-2">
                        {targetWeaknessText}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.skillsToImprove.map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs bg-white"
                          >
                            {skill.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Learning Resources */}
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-[#0f172a] mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Learning Resources
                      </h4>
                      <div className="space-y-3">
                        {item.resources.map((resource, idx) => {
                          const Icon = getResourceIcon(resource.type);
                          const bgColor = getResourceColor(resource.type);
                          const resourceId = resource._id || `resource-${idx}`;

                          return (
                            <div
                              key={resourceId}
                              className="flex items-start gap-3 p-4 bg-white rounded-lg border border-[#e5e7eb] hover:border-[#bfdbfe] transition-colors group"
                            >
                              <div
                                className={`p-2 ${bgColor} rounded-lg flex-shrink-0`}
                              >
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3 mb-1">
                                  <h5 className="text-sm font-semibold text-[#0f172a] group-hover:text-[#2563eb] transition-colors">
                                    {resource.title}
                                  </h5>
                                  <Badge
                                    variant="outline"
                                    className="text-xs flex-shrink-0"
                                  >
                                    {resource.type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-[#64748b] mb-2">
                                  {resource.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
                                    <Clock className="w-3 h-3" />
                                    <span>30 min</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResourceClick(resource);
                                    }}
                                  >
                                    {resource.type === 'article' ||
                                    resource.type === 'video' ? (
                                      <>
                                        View
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                      </>
                                    ) : (
                                      <>
                                        Start
                                        <Play className="w-3 h-3 ml-1" />
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Practice Drills */}
                    <div className="mb-3">
                      <h4 className="text-sm font-bold text-[#0f172a] mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Targeted Practice Drills
                      </h4>
                      <div className="space-y-3">
                        {drills.map((drill, idx) => {
                          const drillId =
                            drill._id || drill.id || `drill-${idx}`;
                          return (
                            <div
                              key={drillId}
                              className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#f0fdf4] to-[#dcfce7] rounded-lg border border-[#bbf7d0] hover:shadow-md transition-all group"
                            >
                              <div className="p-2 bg-[#10b981] rounded-lg flex-shrink-0">
                                <Zap className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex-1">
                                    <h5 className="text-sm font-bold text-[#0f172a] mb-1">
                                      {drill.title}
                                    </h5>
                                    <p className="text-xs text-[#475569] mb-2">
                                      {drill.description}
                                    </p>
                                  </div>
                                  <Badge className="bg-[#10b981] text-white border-0 flex-shrink-0">
                                    {drill.difficulty}
                                  </Badge>
                                  <Button
                                    className="bg-[#0f172a] hover:bg-[#1e293b] text-white h-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDrillClick(drill);
                                    }}
                                  >
                                    Start
                                    <Play className="w-4 h-4 ml-2" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons
                    <div className="flex gap-3 pt-4 border-t border-white/50">
                      <Button
                        className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Mark as in progress
                        }}
                      >
                        {item.progress === 0
                          ? 'Begin This Plan'
                          : 'Continue Learning'}
                      </Button>
                      {item.progress === 100 && (
                        <Button
                          variant="outline"
                          className="border-[#10b981] text-[#10b981] hover:bg-[#f0fdf4]"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Completed
                        </Button>
                      )}
                    </div> */}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="p-5 border border-[#e5e7eb] bg-white">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-[#eff6ff] rounded-lg">
            <Target className="w-6 h-6 text-[#2563eb]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">
              Next Steps
            </h3>
            <p className="text-sm text-[#475569] leading-relaxed mb-3">
              We recommend starting with{' '}
              <strong>Priority 1: {studyPlan[0]?.title}</strong>. This will have
              the most significant impact on your overall score. Complete the
              learning resources first, then practice with the targeted drills.
            </p>
            <Button
              className="bg-[#10b981] hover:bg-[#059669] text-white"
              onClick={() =>
                navigate(`/test-exam?mode=review&resultId=${attemptId}`)
              }
            >
              <Play className="w-4 h-4 mr-2" />
              View Detailed Analysis
            </Button>
          </div>
        </div>
      </Card>

      {/* Resource Content Modal */}
      <ResourceContentModal
        resource={selectedResource}
        open={resourceModalOpen}
        onOpenChange={setResourceModalOpen}
      />

      {/* Drill Content Modal */}
      <DrillContentModal
        drill={selectedDrill}
        open={drillModalOpen}
        onOpenChange={setDrillModalOpen}
        onStartDrill={handleStartDrill}
      />
    </div>
  );
}
