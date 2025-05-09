import type { ParsedQuestion, Option, QuestionResponse } from '../types';
import { QuestionType } from '../types';

// Parse question data from API response
export const parseQuestion = (question: QuestionResponse): ParsedQuestion => {
  let parsedOptions: Option[] | undefined = undefined;
  let correctAnswers: number[] | undefined = undefined;
  
  if (question.options) {
    try {
      parsedOptions = JSON.parse(question.options);
    } catch (error) {
      console.error('Error parsing options:', error);
    }
  }
  
  if (question.correct_answer) {
    try {
      correctAnswers = JSON.parse(question.correct_answer);
    } catch (error) {
      console.error('Error parsing correct answers:', error);
    }
  }
  
  return {
    ...question,
    options: parsedOptions,
    correct_answers: correctAnswers,
  };
};

// Create empty option object with default values
export const createEmptyOption = (isCorrect: boolean = false): Option => {
  return {
    text: '',
    is_correct: isCorrect,
    image_url: undefined,
  };
};

// Get display text for question type
export const getQuestionTypeDisplay = (type: string): string => {
  switch (type) {
    case QuestionType.MCQ:
      return 'Multiple Choice Question';
    case QuestionType.MSQ:
      return 'Multiple Select Question';
    case QuestionType.NUM:
      return 'Numerical Question';
    default:
      return 'Unknown';
  }
};

// Create default options based on question type
export const getDefaultOptionsForType = (type: string): Option[] => {
  switch (type) {
    case QuestionType.MCQ:
      return [
        createEmptyOption(true), // One correct option
        createEmptyOption(),
        createEmptyOption(),
        createEmptyOption(),
      ];
    case QuestionType.MSQ:
      return [
        createEmptyOption(true), // First option is correct by default
        createEmptyOption(),
        createEmptyOption(),
        createEmptyOption(),
      ];
    default:
      return [];
  }
};