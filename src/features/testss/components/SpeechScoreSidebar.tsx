import { useState } from 'react';

// --- Component SVG cho các biểu tượng ---
// (Không thay đổi)
const LongArrowLeftIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 6H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 11L1 6L6 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
    <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.5 13L7.5 7L1.5 1" stroke="#8181A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


// --- Dữ liệu cho Sidebar ---
// (Không thay đổi)
const menuItems = [
  {
    id: 'pronunciation',
    icon: "/img/icon-pronunciation.27afc680.svg",
    title: "Pronunciation",
    level: "Beginner",
    score: "38%",
    scoreColor: 'text-[#eb5757]',
    activeGradient: 'from-[#6ee8ff] to-[#3a87ff]',
  },
  {
    id: 'intonation',
    icon: "/img/icon-intonation.e5416393.svg",
    title: "Intonation",
    level: "Elementary",
    score: "47%",
    scoreColor: 'text-[#eb5757]',
    activeGradient: 'from-[#ffb339] to-[#ff128e]',
  },
  {
    id: 'fluency',
    icon: "/img/icon-fluency.0d434c24.svg",
    title: "Fluency",
    level: "Intermediate",
    score: "50%",
    scoreColor: 'text-[#fe9500]',
    activeGradient: 'from-[#fff35c] to-[#ef7b32]',
  },
  {
    id: 'grammar',
    icon: "/img/icon-grammar.1904ae7e.svg",
    title: "Grammar",
    level: "",
    score: "N/A",
    scoreColor: 'text-[#eb5757]',
    activeGradient: 'from-[#ff52e3] to-[#2980ff]',
  },
  {
    id: 'vocabulary',
    icon: "/img/icon-vocabulary.c26056fc.svg",
    title: "Vocabulary",
    level: "",
    score: "N/A",
    scoreColor: 'text-[#27ae60]',
    activeGradient: 'from-[#fc2ac2] to-[#ffb84e]',
  },
];


// --- Component Chính (Đã cập nhật các giá trị) ---

const SpeechScoreSidebar = () => {
  const [activeItem, setActiveItem] = useState('pronunciation');

  const handleItemClick = (id: string) => {
    setActiveItem(id);
  };

  return (
    // Trước: w-[32rem] pr-[2.5rem] -> Sau: w-[20rem] (320px) pr-[1.5625rem] (25px)
    <div className="sticky top-0 self-start flex flex-col w-[20rem] pr-[1.5625rem]">
      {/* Trước: pb-[0.8rem] -> Sau: pb-[0.5rem] (8px) */}
      <span className="flex items-center cursor-pointer text-[#8181a5] pb-[0.5rem] border-b-2 border-[#f3f1ff]">
        <LongArrowLeftIcon />
        {/* Trước: text-[1.6rem] ml-[1.6rem] -> Sau: text-base (16px) ml-4 (16px) */}
        <span className="text-base font-medium ml-4">Back to Overall Score</span>
      </span>

      {/* Trước: text-[1.6rem] mt-[1.2rem] -> Sau: text-base (16px) mt-3 (12px) */}
      <p className="font-bold text-base text-[#121131] mt-3 mb-0">ELSA Score Details</p>

      {/* Trước: mt-[1rem] -> Sau: mt-[0.625rem] (10px) */}
      <div className="mt-[0.625rem]">
        <dl role="presentation">
          {menuItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              // Trước: mb-[1.6rem] -> Sau: mb-4 (16px)
              <div key={item.id} id={item.id} className="w-full mb-4">
                {/* Trước: rounded-[1.2rem] -> Sau: rounded-xl (12px) */}
                <div 
                  className={`p-[2px] rounded-xl ${isActive ? `bg-gradient-to-b ${item.activeGradient}` : 'border-2 border-[#f3f1ff] bg-[#fbfbfd]'}`}
                >
                  <dt
                    // Trước: rounded-[12px] p-[1.6rem]/p-[1.4rem] -> Sau: rounded-lg p-4/p-3.5
                    className={`flex items-center bg-[#fbfbfd] cursor-pointer rounded-lg ${isActive ? 'p-4' : 'p-3.5'}`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    {/* Trước: w-[4rem] h-[4rem] -> Sau: w-10 (40px) h-10 (40px) */}
                    <img className="w-10 h-10" src={item.icon} alt={`${item.title} icon`} />
                    
                    {/* Trước: ml-[1.6rem] -> Sau: ml-4 (16px) */}
                    <div className="flex flex-col ml-4">
                      {/* Trước: text-[1.6rem] -> Sau: text-base (16px) */}
                      <span className="font-bold text-base">{item.title}</span>
                      {/* Trước: text-[1.2rem] -> Sau: text-xs (12px) */}
                      {item.level && <span className="text-xs text-[#8181a5]">{item.level}</span>}
                    </div>

                    <div className="ml-auto font-bold flex items-center">
                      {/* Trước: mr-[1.5rem] -> Sau: mr-[0.9375rem] (15px) */}
                      <span className={`mr-[0.9375rem] ${item.scoreColor}`}>{item.score}</span>
                      <ChevronRightIcon />
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