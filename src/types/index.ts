// Question Types as const object instead of enum to avoid TypeScript errors
export const QuestionType = {
  MCQ: "MCQ",
  MSQ: "MSQ",
  NUM: "NUM"
} as const;

// Type for QuestionType values
export type QuestionType = typeof QuestionType[keyof typeof QuestionType];

// Option Type
export interface Option {
  text: string;
  is_correct: boolean;
  image_url?: string;
}

// Section Creation Type
export interface SectionCreate {
  name: string;
  total_questions: number;
  questions_to_attempt: number;
  marks_per_question: number;
  negative_marking_allowed: boolean;
  negative_marks?: number;
  question_type: QuestionType;
}

// Section Response Type
export interface Section extends SectionCreate {
  id: number;
  exam_id: number;
}

// Exam Creation Type
export interface ExamCreate {
  name: string;
  time_minutes: number;
  sections: SectionCreate[];
}

// Exam Response Type
export interface Exam {
  id: number;
  name: string;
  total_marks: number;
  time_minutes: number;
  created_at: string;
  sections: Section[];
}

// Question Base Type
export interface QuestionBase {
  question_text: string;
  explanation?: string;
  image_url?: string;
}

// MCQ Question Type
export interface MCQQuestion extends QuestionBase {
  options: Option[];
}

// MSQ Question Type
export interface MSQQuestion extends QuestionBase {
  options: Option[];
}

// Numerical Question Type
export interface NumericalQuestion extends QuestionBase {
  answer: number;
}

// Union Type for different question types
export type QuestionUnion = MCQQuestion | MSQQuestion | NumericalQuestion;

// Question Response from API
export interface QuestionResponse {
  id: number;
  section_id: number;
  question_text: string;
  question_type: QuestionType;
  options?: string; // JSON string
  correct_answer?: string; // JSON string
  numerical_answer?: number;
  image_url?: string;
  last_modified?: string;
}

// Parsed Question with properly typed options
export interface ParsedQuestion extends Omit<QuestionResponse, 'options' | 'correct_answer'> {
  options?: Option[];
  correct_answers?: number[];
}

// Question Update Type
export interface QuestionUpdate {
  question_text?: string;
  options?: Option[];
  numerical_answer?: number;
}

// Image Upload Response
export interface ImageUploadResponse {
  image_url: string;
}