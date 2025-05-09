import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ExamListPage from './pages/ExamListPage';
import ExamDetailPage from './pages/ExamDetailPage';
import CreateExamPage from './pages/CreateExamPage';
import SectionQuestionsPage from './pages/SectionQuestionsPage';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/exams" element={<ExamListPage />} />
          <Route path="/exams/:examId" element={<ExamDetailPage />} />
          <Route path="/exams/create" element={<CreateExamPage />} />
          <Route path="/exams/:examId/sections/:sectionId/questions" element={<SectionQuestionsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
