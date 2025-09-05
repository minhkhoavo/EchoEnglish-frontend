export interface TOEICTest {
  testId: string;
  testTitle: string;
}

export interface TestCardProps {
  test: TOEICTest;
}

export interface TOEICTestsResponse {
  tests: TOEICTest[];
  total?: number;
  page?: number;
  limit?: number;
}
