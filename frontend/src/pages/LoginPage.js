import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import useStore from '../store';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useStore(state => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login({ email, password });
      setAuth(null, data.access_token);
      
      // Fetch user profile
      const me = await api.getMe();
      setAuth(me, data.access_token);
      
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md text-white border border-white/20">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-white/20 rounded-full">
            <LogIn size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center mb-6">Tizimga Kirish</h2>
        
        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-lg mb-4 text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-white/40 transition-colors"
              placeholder="Sizning emailingiz..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Parol</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-white/40 transition-colors"
              placeholder="Parol..."
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-white text-[#764ba2] font-bold py-3 rounded-lg mt-6 hover:bg-opacity-90 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Kirish"}
          </button>
        </form>
        
        <p className="text-center mt-6 text-white/70">
          Hisobingiz yo'qmi? <Link to="/register" className="text-white font-semibold underline">Ro'yxatdan o'tish</Link>
        </p>
      </div>
    </div>
  );
}
