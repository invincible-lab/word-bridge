import React, { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { useToast } from "../Toast";
import { S } from "../styles";
import Spinner from "../Spinner";

export default function ReviewPage() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTodayReview();
      setWords(data);
    } catch (e) {
      toast(e.message || "Yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const submitQuality = async (quality) => {
    try {
      await api.submitReview(words[currentIndex].id, quality);
      nextWord();
    } catch (e) {
      toast(e.message || "Xatolik", "error");
    }
  };

  const nextWord = () => {
    setResult(null);
    setAnswer("");
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) return <div style={S.page}><Spinner text="Mashqlar yuklanmoqda..." /></div>;
  
  if (currentIndex >= words.length) {
    return (
      <div style={S.page}>
        <div style={S.glassCard}>
          <h2 style={{...S.cardHeader, textAlign: 'center'}}>🎉 Mashqlar tugadi!</h2>
          <p style={{...S.cardSub, textAlign: 'center'}}>Bugungi barcha so'zlarni takrorladingiz.</p>
        </div>
      </div>
    );
  }

  const word = words[currentIndex];
  const type = word.exerciseType || "fill_in_the_blank";

  const check = (userAns = answer) => {
    const ok = userAns.trim().toLowerCase() === (word.answer || word.english || "").toLowerCase().trim();
    setResult(ok ? "correct" : "wrong");
    if(type !== "multiple_choice") setAnswer(userAns);
  };

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <h1 style={S.midTitle}>Mashqlar ({currentIndex + 1} / {words.length})</h1>
      </div>

      <div style={S.glassCard}>
        {type === "flashcard" ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h3 style={{ fontSize: "26px", marginBottom: "14px", color: "white", fontWeight: 700 }}>{word.uzbek}</h3>
            {result ? (
              <h3 style={{ fontSize: "30px", color: "#a855f7", fontWeight: "bold" }}>{word.english}</h3>
            ) : (
              <button style={{ ...S.outlineBtn, flex: "none" }} onClick={() => setResult("shown")}>👁 Javobni ko'rish</button>
            )}
          </div>
        ) : (
          <div style={S.exerciseBlock}>
            <p style={S.sentence}>
              {word.exerciseSentence}
            </p>
            
            {!result && (
              <div style={S.answerRow}>
                {type === "multiple_choice" && word.options && word.options.length > 0 ? (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
                    {word.options.map((opt, i) => (
                      <button key={i} onClick={() => check(opt)} style={S.outlineBtn}>{opt}</button>
                    ))}
                  </div>
                ) : (
                  <>
                    <input
                      style={S.input}
                      placeholder="Javobni kiriting..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && check()}
                    />
                    <button style={S.checkBtn} onClick={() => check()}>Tekshirish</button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {result === "correct" && <p style={{ ...S.feedback, color: "#34d399" }}>✓ To'g'ri javob!</p>}
        {result === "wrong" && (
          <p style={{ ...S.feedback, color: "#f87171" }}>
            ✕ Noto'g'ri. To'g'ri javob: <b>{word.answer || word.english}</b>
          </p>
        )}
        
        {result && word.exerciseSentenceTranslation && (
          <p style={{ marginTop: "10px", fontSize: "15px", color: "rgba(255,255,255,0.9)", fontStyle: "italic", padding: "12px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px", borderLeft: "4px solid #a855f7" }}>
            <b>Tarjimasi:</b> {word.exerciseSentenceTranslation}
          </p>
        )}

        {result && (
          <div style={{...S.btnRow, marginTop: 20}}>
            <p style={{width: '100%', color: 'white', marginBottom: 5}}>Qanchalik qiyin bo'ldi?</p>
            <button style={{...S.outlineBtn, borderColor: '#f87171', color: '#f87171'}} onClick={() => submitQuality(0)}>Bilmadim</button>
            <button style={{...S.outlineBtn, borderColor: '#fbbf24', color: '#fbbf24'}} onClick={() => submitQuality(1)}>Qiyin</button>
            <button style={{...S.outlineBtn, borderColor: '#34d399', color: '#34d399'}} onClick={() => submitQuality(2)}>Oson</button>
          </div>
        )}
      </div>
    </div>
  );
}
