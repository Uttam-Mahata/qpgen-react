import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import ImageUploader from '../components/ImageUploader';
import examService from '../services/examService';
import questionService from '../services/questionService';
import { QuestionType } from '../types';
import type { ParsedQuestion, QuestionUpdate } from '../types';
import { parseQuestion } from '../utils/questionUtils';

const SectionQuestionsPage: React.FC = () => {
  const { examId, sectionId } = useParams<{ examId: string; sectionId: string }>();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<ParsedQuestion | null>(null);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!sectionId) return;
      
      try {
        setLoading(true);
        const data = await examService.getSectionQuestions(parseInt(sectionId));
        // Parse questions from API response
        const parsedQuestions = data.map(parseQuestion);
        setQuestions(parsedQuestions);
      } catch (err) {
        setError('Failed to load questions. Please try again.');
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [sectionId]);
  
  const handleEditQuestion = (question: ParsedQuestion) => {
    setEditingQuestion(question);
  };
  
  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };
  
  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const updateData: QuestionUpdate = {};
      
      // Include question text if it exists
      if (editingQuestion.question_text) {
        updateData.question_text = editingQuestion.question_text;
      }
      
      // Include options for MCQ/MSQ questions
      if ((editingQuestion.question_type === QuestionType.MCQ || 
           editingQuestion.question_type === QuestionType.MSQ) && 
           editingQuestion.options) {
        updateData.options = editingQuestion.options;
      }
      
      // Include numerical answer for NUM questions
      if (editingQuestion.question_type === QuestionType.NUM && 
          editingQuestion.numerical_answer !== undefined) {
        updateData.numerical_answer = editingQuestion.numerical_answer;
      }
      
      await questionService.updateQuestion(editingQuestion.id, updateData);
      
      // Update the questions list
      setQuestions(questions.map(q => 
        q.id === editingQuestion.id ? editingQuestion : q
      ));
      
      setEditingQuestion(null);
    } catch (err) {
      setError('Failed to update question. Please try again.');
      console.error('Error updating question:', err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleQuestionTextChange = (text: string) => {
    if (!editingQuestion) return;
    setEditingQuestion({
      ...editingQuestion,
      question_text: text
    });
  };
  
  const handleOptionTextChange = (index: number, text: string) => {
    if (!editingQuestion || !editingQuestion.options) return;
    
    const newOptions = [...editingQuestion.options];
    newOptions[index] = {
      ...newOptions[index],
      text
    };
    
    setEditingQuestion({
      ...editingQuestion,
      options: newOptions
    });
  };
  
  const handleOptionCorrectChange = (index: number, isCorrect: boolean) => {
    if (!editingQuestion || !editingQuestion.options) return;
    
    const newOptions = [...editingQuestion.options];
    
    // For MCQ, only one option can be correct
    if (editingQuestion.question_type === QuestionType.MCQ && isCorrect) {
      // Clear all options first
      newOptions.forEach(opt => opt.is_correct = false);
    }
    
    newOptions[index] = {
      ...newOptions[index],
      is_correct: isCorrect
    };
    
    setEditingQuestion({
      ...editingQuestion,
      options: newOptions
    });
  };
  
  const handleNumericalAnswerChange = (value: number) => {
    if (!editingQuestion) return;
    setEditingQuestion({
      ...editingQuestion,
      numerical_answer: value
    });
  };
  
  const handleUploadQuestionImage = async (file: File): Promise<string> => {
    if (!editingQuestion) throw new Error('No question selected for image upload');
    
    const result = await questionService.uploadQuestionImage(editingQuestion.id, file);
    
    // Update the editing question state with the new image URL
    setEditingQuestion({
      ...editingQuestion,
      image_url: result.image_url
    });
    
    return result.image_url;
  };
  
  const handleUploadOptionImage = async (file: File, optionIndex: number): Promise<string> => {
    if (!editingQuestion || !sectionId) throw new Error('Cannot upload option image');
    
    const result = await questionService.uploadOptionImage(parseInt(sectionId), file);
    
    if (editingQuestion.options) {
      const newOptions = [...editingQuestion.options];
      newOptions[optionIndex] = {
        ...newOptions[optionIndex],
        image_url: result.image_url
      };
      
      setEditingQuestion({
        ...editingQuestion,
        options: newOptions
      });
    }
    
    return result.image_url;
  };
  
  // Display question with options
  const renderQuestion = (question: ParsedQuestion) => {
    const isEditing = editingQuestion && editingQuestion.id === question.id;
    
    return (
      <Card 
        key={question.id} 
        className={`mb-4 ${isEditing ? 'border-2 border-blue-300' : ''}`}
      >
        <div className="mb-4">
          {/* Question text */}
          <div className="mb-4">
            {isEditing ? (
              <textarea
                value={editingQuestion?.question_text}
                onChange={(e) => handleQuestionTextChange(e.target.value)}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                rows={3}
              />
            ) : (
              <div className="text-lg font-medium">{question.question_text}</div>
            )}
          </div>

          {/* Question image */}
          {(question.image_url || isEditing) && (
            <div className="mb-4">
              {isEditing ? (
                <ImageUploader
                  onImageUpload={handleUploadQuestionImage}
                  currentImageUrl={editingQuestion?.image_url}
                  label="Update Question Image"
                />
              ) : question.image_url ? (
                <img 
                  src={question.image_url} 
                  alt="Question" 
                  className="max-h-64 max-w-full object-contain mx-auto"
                />
              ) : null}
            </div>
          )}
          
          {/* Options for MCQ/MSQ */}
          {(question.question_type === QuestionType.MCQ || question.question_type === QuestionType.MSQ) && (
            <div className="mt-4 space-y-2">
              <h3 className="font-medium">Options:</h3>
              <div className="space-y-3">
                {question.options?.map((option, index) => (
                  <div key={index} className={`p-3 border rounded ${option.is_correct ? 'bg-green-50 border-green-300' : ''}`}>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type={question.question_type === QuestionType.MCQ ? 'radio' : 'checkbox'}
                            checked={option.is_correct}
                            onChange={(e) => handleOptionCorrectChange(index, e.target.checked)}
                            className="mr-2"
                          />
                          <textarea
                            value={editingQuestion?.options?.[index].text}
                            onChange={(e) => handleOptionTextChange(index, e.target.value)}
                            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                            rows={2}
                          />
                        </div>
                        
                        <ImageUploader
                          onImageUpload={(file) => handleUploadOptionImage(file, index)}
                          currentImageUrl={editingQuestion?.options?.[index].image_url}
                          label="Add Option Image"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 w-5 h-5 mt-0.5 border rounded-full mr-2 ${
                            option.is_correct ? 'bg-green-500 border-green-600' : 'border-gray-300'
                          }`}/>
                          <div className="flex-1">{option.text}</div>
                        </div>
                        
                        {option.image_url && (
                          <div className="mt-2 pl-7">
                            <img 
                              src={option.image_url} 
                              alt={`Option ${index + 1}`} 
                              className="max-h-32 max-w-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Numerical answer */}
          {question.question_type === QuestionType.NUM && (
            <div className="mt-4">
              <h3 className="font-medium">Answer:</h3>
              {isEditing ? (
                <input
                  type="number"
                  value={editingQuestion?.numerical_answer}
                  onChange={(e) => handleNumericalAnswerChange(parseFloat(e.target.value))}
                  className="p-2 border rounded focus:ring focus:ring-blue-300"
                  step="0.01"
                />
              ) : (
                <div className="p-3 border rounded bg-green-50 border-green-300">
                  {question.numerical_answer}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Edit/Save/Cancel buttons */}
        <div className="mt-4 flex justify-end">
          {isEditing ? (
            <>
              <Button 
                variant="secondary" 
                onClick={handleCancelEdit}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleUpdateQuestion}
                isLoading={saving}
                disabled={saving}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              onClick={() => handleEditQuestion(question)}
            >
              Edit Question
            </Button>
          )}
        </div>
      </Card>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Section Questions</h1>
        <Button
          variant="secondary"
          onClick={() => navigate(`/exams/${examId}`)}
        >
          Back to Exam
        </Button>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {questions.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No questions found. Generate questions for this section first.
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">
            Total questions: {questions.length}. Click on "Edit Question" to modify or add images.
          </p>
          {questions.map(renderQuestion)}
        </div>
      )}
    </div>
  );
};

export default SectionQuestionsPage;