import { SimplePracticeDrillViewer } from './SimplePracticeDrillViewer';

// Sample question IDs
const sampleQuestionIds = [
  '68de5af095a2c8eceae85e65', // Part 1 - Câu đơn lẻ
  '68de5af095a2c8eceae85e6d', // Part 2 - Câu đơn lẻ
  '68de5af095a2c8eceae85e88', // Part 3 - Thuộc nhóm câu 32-34
  '68de5af095a2c8eceae85e8b', // Part 3 - Thuộc nhóm câu 35-37
  '68de5af095a2c8eceae85ebc', // Part 4 - Thuộc nhóm câu 71-73
  '68de5af095a2c8eceae85ee4', // Part 5 - Câu đơn lẻ
  '68de5af095a2c8eceae85ee5', // Part 5 - Câu đơn lẻ
  '68de5af095a2c8eceae85f04', // Part 6 - Thuộc nhóm câu 131-134
  '68de5af095a2c8eceae85f19', // Part 7 - Thuộc nhóm câu 147-148
  '68de5af095a2c8eceae85f20', // Part 7 - Thuộc cùng nhóm câu 147-148
];

export const SimplePracticeDrillDemo = () => {
  const handleSubmit = (answers: Record<number, string>) => {
    console.log('=== Parent Component Received Answers ===');
    console.log('Answers:', answers);
  };

  return (
    <SimplePracticeDrillViewer
      questionIds={sampleQuestionIds}
      onSubmit={handleSubmit}
    />
  );
};
