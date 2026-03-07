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

export async function generateQuizFromUpload(
  file: File,
  questionCount: number,
): Promise<GenerateQuizResponse> {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("question_count", String(questionCount));

  const { data } = await apiClient.post<GenerateQuizResponse>(
    "/quizzes/generate/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    },
  );
  return data;
}
