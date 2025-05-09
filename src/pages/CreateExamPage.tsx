import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { QuestionType } from '../types';
import type { ExamCreate, SectionCreate } from '../types';
import examService from '../services/examService';

const CreateExamPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [examName, setExamName] = useState('');
  const [examTime, setExamTime] = useState('');
  const [sections, setSections] = useState<SectionCreate[]>([
    {
      name: '',
      total_questions: 0,
      questions_to_attempt: 0,
      marks_per_question: 0,
      negative_marking_allowed: false,
      negative_marks: 0,
      question_type: QuestionType.MCQ
    }
  ]);

  // Add a new empty section
  const addSection = () => {
    setSections([
      ...sections,
      {
        name: '',
        total_questions: 0,
        questions_to_attempt: 0,
        marks_per_question: 0,
        negative_marking_allowed: false,
        negative_marks: 0,
        question_type: QuestionType.MCQ
      }
    ]);
  };

  // Remove a section
  const removeSection = (index: number) => {
    const updatedSections = [...sections];
    updatedSections.splice(index, 1);
    setSections(updatedSections);
  };

  // Handle section field changes
  const handleSectionChange = (index: number, field: keyof SectionCreate, value: any) => {
    const updatedSections = [...sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value
    };
    
    // If negative marking is disabled, reset negative marks to 0
    if (field === 'negative_marking_allowed' && value === false) {
      updatedSections[index].negative_marks = 0;
    }
    
    setSections(updatedSections);
  };

  // Calculate total marks
  const calculateTotalMarks = () => {
    return sections.reduce((total, section) => {
      return total + (section.questions_to_attempt * section.marks_per_question);
    }, 0);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!examName.trim()) {
      setError('Exam name is required');
      return;
    }
    
    if (!examTime || parseInt(examTime) <= 0) {
      setError('Please enter a valid exam duration');
      return;
    }
    
    // Validate each section
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section.name.trim()) {
        setError(`Section ${i + 1} name is required`);
        return;
      }
      if (section.total_questions <= 0) {
        setError(`Section ${i + 1} must have at least one question`);
        return;
      }
      if (section.questions_to_attempt <= 0 || section.questions_to_attempt > section.total_questions) {
        setError(`Section ${i + 1} has invalid number of questions to attempt`);
        return;
      }
      if (section.marks_per_question <= 0) {
        setError(`Section ${i + 1} marks per question must be positive`);
        return;
      }
      if (section.negative_marking_allowed && (section.negative_marks || 0) <= 0) {
        setError(`Section ${i + 1} negative marks must be positive`);
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const examData: ExamCreate = {
        name: examName,
        time_minutes: parseInt(examTime),
        sections: sections
      };
      
      const createdExam = await examService.createExam(examData);
      navigate(`/exams/${createdExam.id}`);
    } catch (err) {
      console.error('Error creating exam:', err);
      setError('Failed to create exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Exam</h1>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Exam Details</h2>
          
          <div className="mb-4">
            <label htmlFor="examName" className="block text-sm font-medium text-gray-700 mb-1">
              Exam Name
            </label>
            <input
              type="text"
              id="examName"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="Enter exam name"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="examTime" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (in minutes)
            </label>
            <input
              type="number"
              id="examTime"
              value={examTime}
              onChange={(e) => setExamTime(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="Enter exam duration"
              min="1"
            />
          </div>
          
          <div className="bg-blue-50 rounded p-3 text-blue-800 font-medium">
            Total Marks: {calculateTotalMarks()}
          </div>
        </Card>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Exam Sections</h2>
            <Button 
              type="button" 
              onClick={addSection} 
              variant="secondary"
            >
              Add Section
            </Button>
          </div>
          
          {sections.map((section, index) => (
            <Card key={index} className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Section {index + 1}</h3>
                {sections.length > 1 && (
                  <Button 
                    type="button" 
                    onClick={() => removeSection(index)} 
                    variant="danger"
                    className="text-sm px-2 py-1"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name
                </label>
                <input
                  type="text"
                  value={section.name}
                  onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  placeholder="e.g., Physics, Mathematics, etc."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Questions
                  </label>
                  <input
                    type="number"
                    value={section.total_questions || ''}
                    onChange={(e) => handleSectionChange(index, 'total_questions', parseInt(e.target.value) || 0)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Questions to Attempt
                  </label>
                  <input
                    type="number"
                    value={section.questions_to_attempt || ''}
                    onChange={(e) => handleSectionChange(index, 'questions_to_attempt', parseInt(e.target.value) || 0)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    min="1"
                    max={section.total_questions}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marks Per Question
                  </label>
                  <input
                    type="number"
                    value={section.marks_per_question || ''}
                    onChange={(e) => handleSectionChange(index, 'marks_per_question', parseFloat(e.target.value) || 0)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    step="0.5"
                    min="0.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <select
                    value={section.question_type}
                    onChange={(e) => handleSectionChange(index, 'question_type', e.target.value as typeof QuestionType[keyof typeof QuestionType])}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <option value={QuestionType.MCQ}>Multiple Choice (MCQ)</option>
                    <option value={QuestionType.MSQ}>Multiple Select (MSQ)</option>
                    <option value={QuestionType.NUM}>Numerical</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`negativeMarking${index}`}
                    checked={section.negative_marking_allowed}
                    onChange={(e) => handleSectionChange(index, 'negative_marking_allowed', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  />
                  <label htmlFor={`negativeMarking${index}`} className="ml-2 block text-sm font-medium text-gray-700">
                    Enable Negative Marking
                  </label>
                </div>
              </div>
              
              {section.negative_marking_allowed && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Negative Marks Per Question
                  </label>
                  <input
                    type="number"
                    value={section.negative_marks || ''}
                    onChange={(e) => handleSectionChange(index, 'negative_marks', parseFloat(e.target.value) || 0)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    step="0.5"
                    min="0.5"
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            className="mr-2"
            onClick={() => navigate('/exams')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Create Exam
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateExamPage;