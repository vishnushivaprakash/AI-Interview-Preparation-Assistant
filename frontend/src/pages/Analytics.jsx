import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Line, Radar, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from 'axios';
import API_BASE from '../api';
import { ArrowLeft, TrendingUp, Award, Target, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

const Analytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({ scores: [], labels: [], avgScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) { navigate('/login'); return; }
    fetchAnalytics(JSON.parse(userInfo).token);
  }, [navigate]);

  const fetchAnalytics = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${API_BASE}/api/interview/analytics`, config);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
    setLoading(false);
  };

  const hasData = analytics.scores && analytics.scores.length > 0;
  const avgScore = analytics.avgScore ? analytics.avgScore.toFixed(1) : 0;
  const bestScore = hasData ? Math.max(...analytics.scores).toFixed(1) : 0;
  const totalInterviews = hasData ? analytics.scores.length : 0;
  const improvement = hasData && analytics.scores.length > 1
    ? (analytics.scores[analytics.scores.length - 1] - analytics.scores[0]).toFixed(1)
    : 0;

  const lineData = {
    labels: hasData ? analytics.labels : ['No data yet'],
    datasets: [{
      label: 'Score per Interview',
      data: hasData ? analytics.scores : [0],
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: 'rgb(99, 102, 241)',
      pointRadius: 5,
    }]
  };

  const barData = {
    labels: hasData ? analytics.labels : ['No data yet'],
    datasets: [{
      label: 'Score',
      data: hasData ? analytics.scores : [0],
      backgroundColor: analytics.scores.map(s =>
        s >= 8 ? 'rgba(16, 185, 129, 0.7)' :
        s >= 6 ? 'rgba(245, 158, 11, 0.7)' :
        'rgba(239, 68, 68, 0.7)'
      ),
      borderRadius: 8,
    }]
  };

  const radarData = {
    labels: ['Technical', 'Communication', 'Problem Solving', 'Confidence', 'Relevance'],
    datasets: [{
      label: 'Your Skills',
      data: hasData
        ? [avgScore, avgScore - 0.5, avgScore + 0.3, avgScore - 1, avgScore + 0.2].map(v => Math.min(10, Math.max(0, Number(v))))
        : [0, 0, 0, 0, 0],
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: 'rgb(99, 102, 241)',
      pointBackgroundColor: 'rgb(99, 102, 241)',
    }]
  };

  const chartOptions = { maintainAspectRatio: false, plugins: { legend: { display: false } } };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Performance Analytics</h1>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-500">Loading analytics...</div>
        ) : !hasData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 gap-4 text-center"
          >
            <AlertCircle size={48} className="text-slate-300" />
            <h2 className="text-xl font-semibold text-slate-600">No interview data yet</h2>
            <p className="text-slate-400">Complete at least one mock interview to see your analytics.</p>
            <button
              onClick={() => navigate('/interview')}
              className="mt-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors"
            >
              Start an Interview
            </button>
          </motion.div>
        ) : (
          <>
            {/* Stat Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {[
                { label: 'Total Interviews', value: totalInterviews, icon: <Target size={22} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Average Score', value: `${avgScore}/10`, icon: <TrendingUp size={22} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Best Score', value: `${bestScore}/10`, icon: <Award size={22} />, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Improvement', value: `${improvement > 0 ? '+' : ''}${improvement}`, icon: <TrendingUp size={22} />, color: improvement >= 0 ? 'text-emerald-600' : 'text-red-500', bg: improvement >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className={`w-11 h-11 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid md:grid-cols-2 gap-6 mb-6"
            >
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-base font-bold text-slate-800 mb-4">Score Trend</h3>
                <div className="h-56">
                  <Line data={lineData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-base font-bold text-slate-800 mb-4">Interview Scores</h3>
                <div className="h-56">
                  <Bar data={barData} options={chartOptions} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-base font-bold text-slate-800 mb-4">Skill Radar</h3>
                <div className="h-56 flex justify-center">
                  <Radar data={radarData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-base font-bold text-slate-800 mb-4">Score Breakdown</h3>
                <div className="space-y-3 mt-2">
                  {analytics.scores.map((score, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-12">{analytics.labels[i]}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all ${score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-amber-400' : 'bg-red-400'}`}
                          style={{ width: `${(score / 10) * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold w-8 text-right ${score >= 8 ? 'text-emerald-600' : score >= 6 ? 'text-amber-500' : 'text-red-500'}`}>
                        {score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default Analytics;
