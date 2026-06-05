import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { UserPlus, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.register({ name, email, password });
      navigate('/login');
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
            <UserPlus size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center mb-6">Ro'yxatdan O'tish</h2>
        
        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-lg mb-4 text-center">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ism</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-white/40 transition-colors"
              placeholder="Ismingiz..."
            />
          </div>
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
              placeholder="Kuchli parol..."
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-white text-[#764ba2] font-bold py-3 rounded-lg mt-6 hover:bg-opacity-90 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Ro'yxatdan O'tish"}
          </button>
        </form>
        
        <p className="text-center mt-6 text-white/70">
          Allaqachon hisobingiz bormi? <Link to="/login" className="text-white font-semibold underline">Kirish</Link>
        </p>
      </div>
    </div>
  );
}
