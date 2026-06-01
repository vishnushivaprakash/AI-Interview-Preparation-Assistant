import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 mb-6 tracking-tight">
          AI Interview Coach
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Master your next interview with personalized mock sessions, real-time feedback, and adaptive AI evaluations.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1">
            Get Started Free
          </Link>
          <Link to="/login" className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-full shadow-md hover:bg-slate-50 transition-all">
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
