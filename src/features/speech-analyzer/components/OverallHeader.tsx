import { ChevronLeft, Pencil, Calendar, Clock } from 'lucide-react'; // prettier-ignore

interface RecordingTitleProps {
  title: string;
  date: string;
  duration: string;
  speakingTime: string;
}

const OverallHeader = () => {
  const ActionButtons = () => (
    <div className="flex items-center space-x-4">
      <button
        className="p-2 rounded-full hover:bg-gray-100"
        title="Share your performance"
      >
        Share
      </button>
      <button
        className="p-2 rounded-full hover:bg-gray-100"
        title="Delete recording"
      >
        Delete
      </button>
    </div>
  );

  const RecordingTitle = ({
    title,
    date,
    duration,
    speakingTime,
  }: RecordingTitleProps) => (
    <div>
      <div className="flex items-center space-x-2">
        <span className="text-xl font-semibold text-gray-800">{title}</span>
        <button>
          <Pencil className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span>{date}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Clock className="w-5 h-5 text-gray-500" />
          <span>Duration: {duration}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Clock className="w-5 h-5 text-gray-500" />
          <span>Speaking Time: {speakingTime}</span>
        </div>
      </div>
    </div>
  );

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        <a
          href="/recordings"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5 text-gray-500" />
          <span className="ml-1 font-medium text-base">Back</span>
        </a>
        <RecordingTitle
          title="My voice registration"
          date="Fri, Apr 5th, 2024 - 08:59 pm"
          duration="00:00:15"
          speakingTime="00:00:10"
        />
      </div>
      <ActionButtons />
    </header>
  );
};

export default OverallHeader;
