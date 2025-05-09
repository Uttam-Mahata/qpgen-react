import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import type { Exam } from '../types';
import examService from '../services/examService';
import { getQuestionTypeDisplay } from '../utils/questionUtils';

const ExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingSection, setGeneratingSection] = useState<number | null>(null);

  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) return;
      
      try {
        setLoading(true);
        const data = await examService.getExam(parseInt(examId));
        setExam(data);
      } catch (err) {
        setError('Failed to load exam details.');
        console.error('Error fetching exam:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  const handleGenerateQuestions = async (sectionId: number) => {
    try {
      setGeneratingSection(sectionId);
      await examService.generateQuestions(sectionId);
      
      // Refresh exam data after generating questions
      const updatedExam = await examService.getExam(parseInt(examId!));
      setExam(updatedExam);
      setError(null);
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error('Error generating questions:', err);
    } finally {
      setGeneratingSection(null);
    }
  };

  const navigateToSectionQuestions = (sectionId: number) => {
    navigate(`/exams/${examId}/sections/${sectionId}/questions`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'Exam not found'}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{exam.name}</h1>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => navigate('/exams')}
          >
            Back to Exams
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Duration</h3>
            <p className="mt-1 text-lg font-semibold">{exam.time_minutes} minutes</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Marks</h3>
            <p className="mt-1 text-lg font-semibold">{exam.total_marks}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created On</h3>
            <p className="mt-1 text-lg font-semibold">
              {new Date(exam.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Sections</h3>
            <p className="mt-1 text-lg font-semibold">{exam.sections.length}</p>
          </div>
        </div>
      </Card>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Exam Sections</h2>

      {exam.sections.map((section) => (
        <Card key={section.id} className="mb-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-800">{section.name}</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Question Type:</span> {getQuestionTypeDisplay(section.question_type)}
                </div>
                <div>
                  <span className="font-medium">Questions:</span> {section.questions_to_attempt} out of {section.total_questions}
                </div>
                <div>
                  <span className="font-medium">Marks Per Question:</span> {section.marks_per_question}
                </div>
                {section.negative_marking_allowed && (
                  <div>
                    <span className="font-medium">Negative Marking:</span> {section.negative_marks} marks
                  </div>
                )}
                <div>
                  <span className="font-medium">Total Section Marks:</span> {section.questions_to_attempt * section.marks_per_question}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button
                variant="primary"
                onClick={() => navigateToSectionQuestions(section.id)}
              >
                View Questions
              </Button>
              <Button
                variant="success"
                isLoading={generatingSection === section.id}
                disabled={generatingSection !== null}
                onClick={() => handleGenerateQuestions(section.id)}
              >
                Generate Questions
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ExamDetailPage;