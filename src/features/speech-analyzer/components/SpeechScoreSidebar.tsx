import { useState } from 'react';

const iconUrl = (id: string) =>
  `${import.meta.env.BASE_URL}icon/speech-analyzer/icon-${id}.svg`;

export const menuItems = [
  {
    id: 'pronunciation',
    icon: iconUrl('pronunciation'),
    title: 'Pronunciation',
    level: 'Beginner',
    score: '38%',
    scoreColor: 'text-[#eb5757]',
    activeGradient: 'from-[#6ee8ff] to-[#3a87ff]',
  },
  {
    id: 'intonation',
    icon: iconUrl('intonation'),
    title: 'Intonation',
    level: 'Elementary',
    score: '47%',
    scoreColor: 'text-[#eb5757]',
    activeGradient: 'from-[#ffb339] to-[#ff128e]',
  },
  {
    id: 'fluency',
    icon: iconUrl('fluency'),
    title: 'Fluency',
    level: 'Intermediate',
    score: '50%',
    scoreColor: 'text-[#fe9500]',
    activeGradient: 'from-[#fff35c] to-[#ef7b32]',
  },
  {
    id: 'grammar',
    icon: iconUrl('grammar'),
    title: 'Grammar',
    level: '',
    score: 'N/A',
    scoreColor: 'text-[#eb5757]',
    activeGradient: 'from-[#ff52e3] to-[#2980ff]',
  },
  {
    id: 'vocabulary',
    icon: iconUrl('vocabulary'),
    title: 'Vocabulary',
    level: '',
    score: 'N/A',
    scoreColor: 'text-[#27ae60]',
    activeGradient: 'from-[#fc2ac2] to-[#ffb84e]',
  },
] as const;

const SpeechScoreSidebar = () => {
  const [activeItem, setActiveItem] = useState('pronunciation');

  const handleItemClick = (id: string) => {
    setActiveItem(id);
  };

  return (
    <div className="sticky top-0 self-start flex flex-col w-[20rem] pr-[1.5625rem]">
      <span className="flex items-center cursor-pointer text-[#8181a5] pb-[0.5rem] border-b-2 border-[#f3f1ff]">
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
