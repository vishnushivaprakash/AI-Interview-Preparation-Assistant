import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Line, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState({ scores: [], labels: [], avgScore: 0 });
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      fetchAnalytics(parsedUser.token);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchAnalytics = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('http://localhost:5000/api/interview/analytics', config);
      if (data.scores.length > 0) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploadStatus('Uploading...');
    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };
      await axios.post('http://localhost:5000/api/resume/upload', formData, config);
      setUploadStatus('Resume processed successfully!');
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      setUploadStatus('Upload failed. Try again.');
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const lineData = {
    labels: analytics.labels.length > 0 ? analytics.labels : ['Int 1', 'Int 2', 'Int 3'],
    datasets: [
      {
        label: 'Interview Scores',
        data: analytics.scores.length > 0 ? analytics.scores : [0, 0, 0],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4
      }
    ]
  };

  const radarData = {
    labels: ['Technical', 'Communication', 'Problem Solving', 'Confidence', 'Relevance'],
    datasets: [
      {
        label: 'Current Skill Level',
        data: analytics.avgScore > 0 ? [analytics.avgScore, analytics.avgScore-0.5, analytics.avgScore+0.5, analytics.avgScore-1, analytics.avgScore] : [0,0,0,0,0],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgb(16, 185, 129)',
        pointBackgroundColor: 'rgb(16, 185, 129)',
      }
    ]
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">AI Interview Coach</h1>
        <div className="flex items-center gap-4">
          <span className="font-medium text-slate-700">Hello, {user.name}</span>
          <button onClick={handleLogout} className="text-slate-500 hover:text-indigo-600 transition-colors font-medium">
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Dashboard</h2>
          <p className="text-slate-600">Welcome to your interview preparation hub. Let's get you ready for your next big role.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => navigate('/interview')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">New Interview</h3>
            <p className="text-slate-500 text-sm">Start a new AI-guided mock interview session.</p>
          </div>

          <div onClick={() => fileInputRef.current.click()} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf,.docx"
            />
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload Resume</h3>
            <p className="text-slate-500 text-sm">Get tailored questions based on your profile.</p>
            {uploadStatus && (
              <div className="absolute bottom-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {uploadStatus}
              </div>
            )}
          </div>

          <div onClick={() => navigate('/analytics')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Analytics</h3>
            <p className="text-slate-500 text-sm">Track your performance and view reports.</p>
          </div>
        </div>

        {/* Charts Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid md:grid-cols-2 gap-6"
        >
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Score Trend</h3>
            <div className="h-64">
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Skill Radar</h3>
            <div className="h-64 flex justify-center">
              <Radar data={radarData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
};

export default Dashboard;
