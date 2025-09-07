interface Mistake {
  description: string;
  words: string[];
}

interface ErrorCardProps {
  sound: string;
  mistakes: Mistake[];
  improvement: string;
}

const ErrorCard = ({ sound, mistakes, improvement }: ErrorCardProps) => (
  <div className="flex flex-col bg-white border border-gray-200 rounded-lg">
    <div className="p-3 font-bold text-gray-800 border-b border-gray-200">
      {sound}
    </div>
    <div className="p-4 border-b border-gray-200">
      <span className="font-semibold text-sm text-gray-700">
        Words with Mistakes
      </span>
      <div className="mt-2 text-sm text-gray-600 space-y-1">
        {mistakes.map((mistake, index) => (
          <div key={index}>
            <span>{mistake.description}</span>
            <div className="pl-4">
              {mistake.words.map((word, idx) => (
                <div key={idx} dangerouslySetInnerHTML={{ __html: word }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="p-4 bg-gray-50 rounded-b-lg">
      <span className="font-semibold text-sm text-gray-700">
        How to Improve
      </span>
      <p className="mt-1 text-sm text-gray-600">{improvement}</p>
    </div>
  </div>
);

export default ErrorCard;
