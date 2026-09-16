import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Tests from './pages/Tests';
import PracticeExamRun from './pages/PracticeExamRun';
import ImagePracticeExamRun from './pages/ImagePracticeExamRun';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pending from './pages/Pending';
import Admin from './pages/Admin';
import AdminQuestionBank from './pages/AdminQuestionBank';
import TrafficSignsLayout from './pages/traffic-signs/Layout';
import TrafficSignsLanding from './pages/traffic-signs/Landing';
import TrafficSignsCategoryGrid from './pages/traffic-signs/CategoryGrid';
import TrafficSignsAll from './pages/traffic-signs/AllSigns';
import TrafficSignDetail from './pages/traffic-signs/Detail';
import TeoriProvIntro from './pages/TeoriProvIntro';
import TeoriProvRun from './pages/TeoriProvRun';
import AdminExamResults from './pages/AdminExamResults';
import AdminExamDetail from './pages/AdminExamDetail';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/traffic-signs" element={<TrafficSignsLayout />}>
            <Route index element={<TrafficSignsLanding />} />
            <Route path="all" element={<TrafficSignsAll />} />
            <Route path=":groupId" element={<TrafficSignsCategoryGrid />} />
            <Route path=":groupId/:code" element={<TrafficSignDetail />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/pending"
            element={
              <ProtectedRoute>
                <Pending />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests"
            element={
              <ProtectedRoute requireApproved>
                <Tests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/run"
            element={
              <ProtectedRoute requireApproved>
                <PracticeExamRun />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/images"
            element={
              <ProtectedRoute requireApproved>
                <ImagePracticeExamRun />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teoriprov"
            element={
              <ProtectedRoute requireApproved>
                <TeoriProvIntro />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teoriprov/run"
            element={
              <ProtectedRoute requireApproved>
                <TeoriProvRun />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireApproved>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exam-results"
            element={
              <ProtectedRoute requireAdmin>
                <AdminExamResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exam-results/:id"
            element={
              <ProtectedRoute requireAdmin>
                <AdminExamDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/question-bank"
            element={
              <ProtectedRoute requireAdmin>
                <AdminQuestionBank />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer className="site-footer">
        <p>© {new Date().getFullYear()} عماد للتيوري السويدي — موقع مجاني للمتدربين.</p>
      </footer>
    </>
  );
}
