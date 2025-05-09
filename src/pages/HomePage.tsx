import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Question Paper Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Create customized question papers powered by Gemini AI. Design exams with
          multiple sections, modify questions, and add images to enhance your assessments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Create New Exam">
          <p className="text-gray-600 mb-4">
            Create a new exam with custom sections, question types, and marking schemes.
          </p>
          <Link to="/exams/create">
            <Button variant="primary" fullWidth>
              Create Exam
            </Button>
          </Link>
        </Card>

        <Card title="Manage Exams">
          <p className="text-gray-600 mb-4">
            View, edit and manage all your previously created exam papers.
          </p>
          <Link to="/exams">
            <Button variant="info" fullWidth>
              View Exams
            </Button>
          </Link>
        </Card>

        <Card title="AI Generated Questions">
          <p className="text-gray-600 mb-4">
            Generate high-quality questions using the power of Gemini AI for your exams.
          </p>
          <p className="text-sm text-gray-500">
            Create an exam to use this feature.
          </p>
        </Card>
      </div>

      <div className="mt-12 bg-blue-50 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-blue-800 mb-3">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="font-bold text-blue-600 text-xl mb-2">1. Create Exam</div>
            <p className="text-gray-600">Define your exam structure with sections, question types, and marking scheme.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="font-bold text-blue-600 text-xl mb-2">2. Generate Questions</div>
            <p className="text-gray-600">Let AI generate high-quality questions for each section of your exam.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="font-bold text-blue-600 text-xl mb-2">3. Customize Content</div>
            <p className="text-gray-600">Modify questions and add images to enhance your question paper.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;