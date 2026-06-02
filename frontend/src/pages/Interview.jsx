import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Play, CheckCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../api';

const Interview = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);

  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Generate questions on mount
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        const { data } = await axios.post(`${API_BASE}/api/interview/generate`, {
          role: 'Frontend Developer',
          difficulty: 'Intermediate',
          type: 'Technical'
        }, config);
        setQuestions(data.questions);
      } catch (error) {
        console.error('Failed to generate questions', error);
      }
      setLoading(false);
    };

    fetchQuestions();

    // Setup Web Speech API - Fixed version
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      // Set to false: only return final, committed results — no partial repetitions
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        // Iterate only NEW results from event.resultIndex onwards
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            // Append final text to our ref (permanent store)
            finalTranscriptRef.current += result[0].transcript + ' ';
          } else {
            // Show interim text as a preview
            interim = result[0].transcript;
          }
        }
        // Update state with final text + current interim preview
        setTranscript(finalTranscriptRef.current + interim);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
  }, []);

  const startRecording = () => {
    setTranscript('');
    finalTranscriptRef.current = '';  // Reset the accumulated final text
    setIsRecording(true);
    if (recognitionRef.current) recognitionRef.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const submitAnswer = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      
      const { data } = await axios.post(`${API_BASE}/api/interview/evaluate`, {
        question: questions[currentQuestionIndex],
        answer: transcript
      }, config);
      
      setEvaluation(data);
    } catch (error) {
      console.error('Evaluation failed', error);
    }
    setLoading(false);
  };

  const nextQuestion = () => {
    setEvaluation(null);
    setTranscript('');
    setCurrentQuestionIndex(prev => prev + 1);
  };

  if (loading && questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Generating AI Interview...</div>;
  }

  const isFinished = currentQuestionIndex >= questions.length && questions.length > 0;

  if (isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-10 rounded-2xl shadow-xl text-center">
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Interview Complete!</h2>
          <p className="text-slate-600 mb-8">You've successfully finished the mock interview. Check your dashboard for the full report.</p>
          <button className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold" onClick={() => window.location.href='/dashboard'}>
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100 flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Mock Interview</h2>
            <p className="text-indigo-100 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-medium">AI Active</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto">
          
          {/* AI Question */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Interviewer</span>
            <div className="bg-slate-100 p-6 rounded-2xl rounded-tl-none border border-slate-200">
              <p className="text-lg text-slate-800 font-medium">
                {questions[currentQuestionIndex] || "Loading question..."}
              </p>
            </div>
          </div>

          {/* User Answer / Transcript */}
          <div className="flex flex-col gap-2 self-end w-3/4">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider text-right">You</span>
            <div className="bg-indigo-50 p-6 rounded-2xl rounded-tr-none border border-indigo-100 min-h-[120px]">
              {transcript ? (
                <p className="text-indigo-900">{transcript}</p>
              ) : (
                <p className="text-indigo-300 italic">Your answer will appear here...</p>
              )}
            </div>
          </div>

          {/* Evaluation Result */}
          {evaluation && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-emerald-800">AI Evaluation</h3>
                <span className="bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full font-bold text-sm">Score: {evaluation.score}/10</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-emerald-700 mb-2">Strengths</h4>
                  <ul className="list-disc pl-4 text-emerald-600">
                    {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Areas to Improve</h4>
                  <ul className="list-disc pl-4 text-red-500">
                    {evaluation.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-2">Ideal Answer</h4>
                <p className="text-emerald-700 text-sm">{evaluation.idealAnswer}</p>
              </div>
            </motion.div>
          )}

        </div>

        {/* Controls Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-center items-center gap-6">
          {!evaluation ? (
            <>
              {isRecording ? (
                <button onClick={stopRecording} className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 rounded-full font-semibold hover:bg-red-200 transition-colors">
                  <MicOff size={20} /> Stop Recording
                </button>
              ) : (
                <button onClick={startRecording} className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-full font-semibold hover:bg-slate-700 transition-colors">
                  <Mic size={20} /> Start Answering
                </button>
              )}
              <button 
                onClick={submitAnswer} 
                disabled={!transcript || isRecording || loading}
                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold disabled:opacity-50 hover:bg-indigo-700 transition-colors"
              >
                {loading ? 'Evaluating...' : 'Submit Answer'}
              </button>
            </>
          ) : (
            <button onClick={nextQuestion} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors">
              Next Question <Play size={20} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Interview;
