import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import type { Exam } from '../types';
import examService from '../services/examService';

const ExamListPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const data = await examService.getAllExams();
        setExams(data);
        setError(null);
      } catch (err) {
        setError('Failed to load exams. Please try again later.');
        console.error('Error fetching exams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Exams</h1>
        <Link to="/exams/create">
          <Button variant="primary">Create New Exam</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No exams found. Click "Create New Exam" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{exam.name}</h2>
              <div className="text-sm text-gray-500 mb-4">
                Created on {new Date(exam.created_at).toLocaleDateString()}
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-gray-700">
                  <div>Total marks: <span className="font-medium">{exam.total_marks}</span></div>
                  <div>Duration: <span className="font-medium">{exam.time_minutes} minutes</span></div>
                  <div>Sections: <span className="font-medium">{exam.sections.length}</span></div>
                </div>
              </div>
              <Link to={`/exams/${exam.id}`}>
                <Button variant="info" fullWidth>
                  View Details
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamListPage;