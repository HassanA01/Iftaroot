import { apiClient } from "./client";
import type { QuestionInput } from "./quizzes";

export interface GenerateQuizInput {
  topic: string;
  question_count: number;
  context: string;
}

export interface GenerateQuizResponse {
  title: string;
  questions: QuestionInput[];
}

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizResponse> {
  const { data } = await apiClient.post<GenerateQuizResponse>("/quizzes/generate", input);
  return data;
}
