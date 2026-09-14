import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Tests from './pages/Tests';
import Quiz from './pages/Quiz';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pending from './pages/Pending';
import Admin from './pages/Admin';
import TrafficSigns from './pages/TrafficSigns';
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
          <Route path="/traffic-signs" element={<TrafficSigns />} />
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
            path="/tests/:id"
            element={
              <ProtectedRoute requireApproved>
                <Quiz />
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
        </Routes>
      </main>
      <footer className="site-footer">
        <p>© {new Date().getFullYear()} عماد للتيوري السويدي — موقع مجاني للمتدربين.</p>
      </footer>
    </>
  );
}
