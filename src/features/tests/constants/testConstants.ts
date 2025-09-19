export interface TestPart {
  id: string;
  name: string;
  questions: number;
  type: 'listening' | 'reading';
}

export const testParts: TestPart[] = [
  { id: 'part1', name: 'PART 1', questions: 6, type: 'listening' },
  { id: 'part2', name: 'PART 2', questions: 25, type: 'listening' },
  { id: 'part3', name: 'PART 3', questions: 39, type: 'listening' },
  { id: 'part4', name: 'PART 4', questions: 30, type: 'listening' },
  { id: 'part5', name: 'PART 5', questions: 30, type: 'reading' },
  { id: 'part6', name: 'PART 6', questions: 16, type: 'reading' },
  { id: 'part7', name: 'PART 7', questions: 54, type: 'reading' },
];

export const timeOptions = [
  { value: '5', label: '5 phút' },
  { value: '10', label: '10 phút' },
  { value: '15', label: '15 phút' },
  { value: '30', label: '30 phút' },
  { value: '45', label: '45 phút' },
  { value: '60', label: '60 phút' },
  { value: '90', label: '90 phút' },
  { value: '120', label: '120 phút' },
];

export const getPartsByType = (type: 'listening' | 'reading') =>
  testParts.filter((part) => part.type === type);

export const getSelectedPartsData = (selectedParts: string[]) =>
  testParts.filter((part) => selectedParts.includes(part.id));

export const getTotalQuestions = (selectedParts: string[]) =>
  getSelectedPartsData(selectedParts).reduce(
    (sum, part) => sum + part.questions,
    0
  );
