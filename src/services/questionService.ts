import api from './api';
import type { QuestionResponse, QuestionUpdate } from '../types';

const questionService = {
  // Get a specific question by ID
  getQuestion: async (questionId: number): Promise<QuestionResponse> => {
    const response = await api.get(`/api/exams/questions/${questionId}`);
    return response.data;
  },
  
  // Update a question
  updateQuestion: async (questionId: number, updateData: QuestionUpdate): Promise<QuestionResponse> => {
    const response = await api.put(`/api/exams/questions/${questionId}`, updateData);
    return response.data;
  },
  
  // Upload image for a question
  uploadQuestionImage: async (questionId: number, imageFile: File): Promise<{ image_url: string }> => {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    // When sending files, we need to set the appropriate content type
    const response = await api.post(`/api/exams/questions/${questionId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  // Upload image for an option
  uploadOptionImage: async (sectionId: number, imageFile: File): Promise<{ image_url: string }> => {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await api.post(`/api/exams/sections/${sectionId}/upload-option-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
};

export default questionService;