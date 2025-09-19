import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { RecordingOverallScores } from '../../types/pronunciation.types';

const iconUrl = (id: string) =>
  `${import.meta.env.BASE_URL}icon/speech-analyzer/icon-${id}.svg`;

export type MenuItem = {
  id: string;
  icon: string;
  title: string;
  level: string;
  score: string;
  scoreColor: string;
  activeGradient: string;
};

const baseMenuItems: Omit<MenuItem, 'level' | 'score' | 'scoreColor'>[] = [
  {
    id: 'pronunciation',
    icon: iconUrl('pronunciation'),
    title: 'Pronunciation',
    activeGradient: 'from-[#6ee8ff] to-[#3a87ff]',
  },
  {
    id: 'intonation',
    icon: iconUrl('intonation'),
    title: 'Intonation',
    activeGradient: 'from-[#ffb339] to-[#ff128e]',
  },
  {
    id: 'fluency',
    icon: iconUrl('fluency'),
    title: 'Fluency',
    activeGradient: 'from-[#fff35c] to-[#ef7b32]',
  },
  {
    id: 'grammar',
    icon: iconUrl('grammar'),
    title: 'Grammar',
    activeGradient: 'from-[#ff52e3] to-[#2980ff]',
  },
  {
    id: 'vocabulary',
    icon: iconUrl('vocabulary'),
    title: 'Vocabulary',
    activeGradient: 'from-[#fc2ac2] to-[#ffb84e]',
  },
];

export interface SpeechScoreSidebarProps {
  overall?: RecordingOverallScores;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

const SpeechScoreSidebar = ({
  overall,
  currentView = 'pronunciation',
  onViewChange,
}: SpeechScoreSidebarProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeItem, setActiveItem] = useState(currentView);

  // Update activeItem when currentView changes
  useEffect(() => {
    setActiveItem(currentView);
  }, [currentView]);

  const levelForScore = (score?: number) => {
    if (score == null) return 'N/A';
    if (score >= 85) return 'Advanced';
    if (score >= 70) return 'Intermediate';
    if (score >= 50) return 'Elementary';
    return 'Beginner';
  };

  const colorForScore = (score?: number) => {
    if (score == null) return 'text-[#8181a5]';
    if (score >= 85) return 'text-[#27ae60]';
    if (score >= 70) return 'text-[#2d9cdb]';
    if (score >= 50) return 'text-[#fe9500]';
    return 'text-[#eb5757]';
  };

  const menuItems: MenuItem[] = useMemo(() => {
    const scores = {
      pronunciation: overall?.PronScore,
      fluency: overall?.FluencyScore,
      intonation: overall?.ProsodyScore,
    } as Record<string, number | undefined>;

    return baseMenuItems.map((item) => {
      const sc = scores[item.id];
      return {
        ...item,
        level: levelForScore(sc),
        score: sc != null ? `${Math.round(sc)}%` : 'N/A',
        scoreColor: colorForScore(sc),
      };
    });
  }, [overall]);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    if (onViewChange) {
      // Use internal view change callback
      onViewChange(itemId);
    } else if (id) {
      // Fallback to URL navigation if no callback provided
      navigate(`/speech-analyze/${id}/${itemId}`);
    }
  };

  const handleBackClick = () => {
    // Navigate back to recordings page
    navigate(-1);
  };

  return (
    <div className="sticky top-0 self-start flex flex-col w-[20rem] pr-[1.5625rem]">
      <span
        onClick={handleBackClick}
        className="flex items-center cursor-pointer text-[#8181a5] pb-[0.5rem] border-b-2 border-[#f3f1ff] hover:text-[#6666cc] transition-colors"
      >
        <span>&larr;</span>
        <span className="text-base font-medium ml-4">
          Back to Overall Score
        </span>
      </span>

      <p className="font-bold text-base text-[#121131] mt-3 mb-0">
        ELSA Score Details
      </p>

      <div className="mt-[0.625rem]">
        <dl role="presentation">
          {menuItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <div key={item.id} id={item.id} className="w-full mb-4">
                <div
                  className={`p-[2px] rounded-xl ${isActive ? `bg-gradient-to-b ${item.activeGradient}` : 'border-2 border-[#f3f1ff] bg-[#fbfbfd]'}`}
                >
                  <dt
                    className={`flex items-center bg-[#fbfbfd] cursor-pointer rounded-lg ${isActive ? 'p-4' : 'p-3.5'}`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <img
                      className="w-10 h-10"
                      src={item.icon}
                      alt={`${item.title} icon`}
                    />

                    <div className="flex flex-col ml-4">
                      <span className="font-bold text-base">{item.title}</span>
                      {item.level && (
                        <span className="text-xs text-[#8181a5]">
                          {item.level}
                        </span>
                      )}
                    </div>

                    <div className="ml-auto font-bold flex items-center">
                      <span className={`mr-[0.9375rem] ${item.scoreColor}`}>
                        {item.score}
                      </span>
                    </div>
                  </dt>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
};

export default SpeechScoreSidebar;
