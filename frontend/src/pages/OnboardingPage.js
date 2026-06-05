import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api';
import useStore from '../store';

const QUESTIONS = [
  { q: "He ____ a student.", opts: ["is", "am", "are", "be"], ans: 0 },
  { q: "I usually ____ up at 7 AM.", opts: ["getting", "get", "got", "gets"], ans: 1 },
  { q: "She ____ to the cinema yesterday.", opts: ["goes", "go", "went", "going"], ans: 2 },
  { q: "If I ____ you, I would study harder.", opts: ["was", "am", "were", "be"], ans: 2 },
  { q: "By next year, I ____ graduated.", opts: ["will have", "have", "will", "had"], ans: 0 },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const setAuth = useStore(state => state.setAuth);

  const handleAnswer = (index) => {
    if (index === QUESTIONS[current].ans) {
      setScore(s => s + 1);
    }
    
    if (current + 1 < QUESTIONS.length) {
      setCurrent(c => c + 1);
    } else {
      setDone(true);
    }
  };

  const finishOnboarding = async () => {
    // Determine level: 0-1 = A1, 2-3 = A2, 4 = B1, 5 = B2
    const levels = ["A1", "A2", "A2", "B1", "B2", "C1"];
    const level = levels[score];
    
    try {
      // For now we just update user object in store locally
      // In a real app we'd send the level to backend: await api.updateProfile({ level })
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  if (done) {
    const level = ["A1", "A2", "A2", "B1", "B2", "C1"][score];
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md text-center text-white border border-white/20">
          <h2 className="text-3xl font-bold mb-4">Ajoyib!</h2>
          <p className="text-xl mb-6">Sizning taxminiy darajangiz:</p>
          <div className="text-6xl font-bold text-yellow-400 mb-8">{level}</div>
          <button onClick={finishOnboarding} className="w-full bg-white text-[#764ba2] font-bold py-3 rounded-lg hover:bg-opacity-90">
            O'rganishni boshlash
          </button>
        </motion.div>
      </div>
    );
  }

  const q = QUESTIONS[current];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md text-white border border-white/20">
        <div className="w-full bg-white/20 h-2 rounded-full mb-8">
          <motion.div 
            className="h-full bg-blue-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(current / QUESTIONS.length) * 100}%` }}
          />
        </div>
        
        <h3 className="text-2xl font-semibold mb-6 text-center">{q.q}</h3>
        
        <div className="space-y-3">
          {q.opts.map((opt, idx) => (
            <button 
              key={idx}
              onClick={() => handleAnswer(idx)}
              className="w-full bg-white/5 border border-white/20 hover:bg-white/20 p-4 rounded-xl text-left transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
