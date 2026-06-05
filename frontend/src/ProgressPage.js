import React, { useState, useEffect } from "react";
import { api } from "./api";
import { useToast } from "./Toast";
import { Flame, Star, Trophy, BookOpen, Award, CheckCircle2, Clock, Target, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";

function StatCard({ icon, label, value, colorClass }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg w-full">
      <div className={`text-4xl mb-3 ${colorClass}`}>{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-white/70 text-sm font-medium text-center">{label}</div>
    </div>
  );
}

// Yutuqni (badge) ko'rsatadigan karta — qo'lga kiritilgan/kiritilmaganligiga qarab
function Badge({ icon, title, desc, earned }) {
  return (
    <div
      className={`bg-white/5 border p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all
        ${earned ? "border-yellow-400/40 shadow-md" : "border-white/10 opacity-40 grayscale"}`}
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-3
          ${earned ? "bg-yellow-400/20" : "bg-white/10"}`}
      >
        {icon}
      </div>
      <h3 className="text-white font-bold text-sm">{title}</h3>
      <p className="text-white/50 text-xs mt-1">{desc}</p>
    </div>
  );
}

export default function ProgressPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getProgress();
        setData(res);
      } catch (e) {
        toast(e.message || "Yuklashda xatolik", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const totalXP = data?.stats?.totalXP || 0;
  const streak = data?.stats?.streak || 0;
  const longestStreak = data?.stats?.longestStreak || 0;
  const learnedWords = data?.learnedWords || 0;
  const totalWords = data?.totalWords || 0;
  const dueToday = data?.dueToday || 0;
  const percent = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

  // Haqiqiy statistikaga asoslangan yutuqlar
  const badges = [
    {
      icon: <CheckCircle2 className={learnedWords >= 1 ? "text-blue-400" : "text-white/40"} size={32} />,
      title: "Birinchi Qadam",
      desc: "1 ta so'z o'rganildi",
      earned: learnedWords >= 1,
    },
    {
      icon: <Zap className={totalXP >= 100 ? "text-yellow-400" : "text-white/40"} size={32} />,
      title: "100 XP",
      desc: "100 ball to'plandi",
      earned: totalXP >= 100,
    },
    {
      icon: <Flame className={streak >= 3 ? "text-orange-500" : "text-white/40"} size={32} />,
      title: "Olov",
      desc: "3 kun qatorasiga",
      earned: streak >= 3,
    },
    {
      icon: <Flame className={streak >= 7 ? "text-red-500" : "text-white/40"} size={32} />,
      title: "Bir Hafta",
      desc: "7 kun qatorasiga",
      earned: streak >= 7,
    },
    {
      icon: <BookOpen className={learnedWords >= 10 ? "text-green-400" : "text-white/40"} size={32} />,
      title: "Bilimdon",
      desc: "10 ta so'z o'rganildi",
      earned: learnedWords >= 10,
    },
    {
      icon: <Crown className={learnedWords >= 50 ? "text-purple-400" : "text-white/40"} size={32} />,
      title: "Usta",
      desc: "50 ta so'z o'rganildi",
      earned: learnedWords >= 50,
    },
  ];
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-4xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">O'rganish Statistikasi</h1>
        <p className="text-white/70 text-lg">Gamifikatsiya va sizning o'sish tarixingiz</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin text-white"><Star size={48} /></div>
        </div>
      )}

      {/* Hali so'z qo'shilmagan holat */}
      {!loading && data && totalWords === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-2xl shadow-lg text-center"
        >
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-2">Hali statistika yo'q</h2>
          <p className="text-white/70">
            Bosh sahifada so'z qo'shing va mashq qiling — statistikangiz shu yerda paydo bo'ladi.
          </p>
        </motion.div>
      )}

      {!loading && data && totalWords > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatCard icon={<Star />} label="Jami XP" value={totalXP} colorClass="text-yellow-400" />
            <StatCard icon={<Flame />} label="Streak" value={`${streak} kun`} colorClass="text-orange-500" />
            <StatCard icon={<BookOpen />} label="O'rganilgan" value={learnedWords} colorClass="text-green-400" />
            <StatCard icon={<Clock />} label="Takrorlash kerak" value={dueToday} colorClass="text-blue-400" />
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg"
          >
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">So'zlar o'zlashtirilishi</h2>
                <p className="text-white/70 text-sm">SM-2 orqali xotirada saqlanayotgan so'zlar</p>
              </div>
              <div className="text-4xl font-bold text-green-400">{percent}%</div>
            </div>

            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </div>
            <div className="flex justify-between text-white/50 text-sm mt-2 font-medium">
              <span>{learnedWords} ta o'rganilgan</span>
              <span>Jami {totalWords} ta so'z</span>
            </div>
          </motion.div>

          {/* Qo'shimcha ko'rsatkichlar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-3 shadow-lg">
              <Trophy className="text-purple-400" size={28} />
              <div>
                <div className="text-white/70 text-xs">Daraja</div>
                <div className="text-white font-bold">{data.level}</div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-3 shadow-lg">
              <Flame className="text-red-500" size={28} />
              <div>
                <div className="text-white/70 text-xs">Eng uzun streak</div>
                <div className="text-white font-bold">{longestStreak} kun</div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-3 shadow-lg">
              <Target className="text-green-400" size={28} />
              <div>
                <div className="text-white/70 text-xs">Yutuqlar</div>
                <div className="text-white font-bold">{earnedCount} / {badges.length}</div>
              </div>
            </div>
          </motion.div>

          {/* Badges Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-yellow-400" size={32} />
              <h2 className="text-2xl font-bold text-white">Yutuqlar (Badges)</h2>
              <span className="ml-auto text-white/60 text-sm font-medium">{earnedCount} / {badges.length}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {badges.map((b) => (
                <Badge key={b.title} {...b} />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
