// components/AudioPlayer.tsx

// Giả lập các icon cho player
const RewindIcon = () => <img alt="rewind" src="/img/icon-rewind.9e763d84.svg" />;
const ForwardIcon = () => <img alt="forward" src="/img/icon-forward.677f889a.svg" />;
const PlayPauseIcon = () => (
    <div className="relative w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer">
        <div className="flex space-x-1">
            <div className="w-1 h-4 bg-white rounded-sm"></div>
            <div className="w-1 h-4 bg-white rounded-sm"></div>
        </div>
    </div>
);

const AudioPlayer = () => (
    <div className="bg-gray-50 p-3 flex items-center space-x-4">
        <div className="flex items-center space-x-3">
            <button><RewindIcon /></button>
            <PlayPauseIcon />
            <button><ForwardIcon /></button>
        </div>
        <div className="flex-grow flex items-center space-x-3">
            <span className="text-sm text-gray-600 font-mono">00:00:03 / 00:00:15</span>
            <div className="w-full bg-gray-300 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '20%' }}></div>
            </div>
        </div>
    </div>
);

export default AudioPlayer;
