// components/TopErrors.tsx
import ErrorCard from './ErrorCard';
import TopErrorsChart from './TopErrorsChart';

const errorData = [
  {
    sound: 'Sound /n/',
    mistakes: [
      {
        description: 'You forgot to pronounce /n/',
        words: [
          "need /<strong class='text-red-500'>n</strong>id/",
          "continue /kənˈtɪ<strong class='text-red-500'>n</strong>ˌju/",
          "in /ɪ<strong class='text-red-500'>n</strong>/",
        ],
      },
    ],
    improvement:
      'This is a /n/ sound. Press your tongue against you upper gums and teeth and vibrate your vocal cords.',
  },
  {
    sound: 'Sound /ŋ/',
    mistakes: [
      {
        description: 'You forgot to pronounce /ŋ/',
        words: ["English /ˈɪ<strong class='text-red-500'>ŋ</strong>.lɪʃ/"],
      },
    ],
    improvement:
      "This is a /ŋ/ (ng) sound, like the last sound in 'thing.' Raise the back of your tongue against the roof of your mouth.",
  },
  {
    sound: 'Sound /u/',
    mistakes: [
      {
        description: 'You said /l/ instead of /u/',
        words: ["continue /kənˈtɪnˌj<strong class='text-red-500'>u</strong>/"],
      },
    ],
    improvement:
      "The 'ue' here has two sounds: the consonant /j/ (y) and the vowel /u/ (oo), like the word 'you'.",
  },
];

const TopErrors = () => (
  <div className="mt-8 space-y-6">
    <TopErrorsChart />
    <div>
      <h3 className="text-lg font-bold text-gray-800">
        Your Top Errors and Suggestions for Improvement
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {errorData.map((error, index) => (
          <ErrorCard key={index} {...error} />
        ))}
      </div>
    </div>
  </div>
);

export default TopErrors;
