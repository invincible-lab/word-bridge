import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useStore from "./store";
import { LogOut } from "lucide-react";

const ITEMS = [
  { path: "/", label: "🏠 Asosiy" },
  { path: "/history", label: "🕐 Tarix" },
  { path: "/progress", label: "📈 Progress" },
];

export default function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated, logout, user } = useStore();

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-4">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-2 flex justify-between items-center shadow-lg">
        <div className="flex gap-2">
          {ITEMS.map((it) => {
            const active = pathname === it.path;
            return (
              <button
                key={it.path}
                onClick={() => navigate(it.path)}
                className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 font-medium
                  ${active ? 'bg-white text-[#764ba2] shadow-md' : 'text-white hover:bg-white/10'}`}
              >
                {it.label}
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center gap-4 px-4 text-white">
          <span className="font-semibold text-sm hidden md:block">
            {user?.name || 'Foydalanuvchi'}
          </span>
          <button 
            onClick={() => { logout(); navigate("/login"); }}
            className="p-2 bg-red-500/20 text-red-100 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
            title="Chiqish"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
