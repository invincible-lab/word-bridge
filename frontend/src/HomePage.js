import React, { useState } from "react";
import { api } from "./api";
import { useToast } from "./Toast";
import { S } from "./styles";
import Spinner from "./Spinner";

// ── Mashq turi uchun rang/belgi ma'lumotlari ─────────────────
const TYPE_META = {
  fill_in_the_blank: { label: "Bo'shliqni to'ldirish", icon: "✍️", color: "#3b82f6" },
  multiple_choice:   { label: "Variantni tanlash",     icon: "🔘", color: "#10b981" },
  flashcard:         { label: "Flashcard",             icon: "🃏", color: "#a855f7" },
  listening:         { label: "Eshitib yozish",        icon: "🎧", color: "#f59e0b" },
};

// ── Mashq kartasi (natijalar uchun) ──────────────────────────
function ExerciseCard({ word, index }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  const type = word.exerciseType || "fill_in_the_blank";
  const meta = TYPE_META[type] || TYPE_META.fill_in_the_blank;

  const check = (userAns = answer) => {
    const ok = userAns.trim().toLowerCase() === word.answer.toLowerCase();
    setResult(ok ? "correct" : "wrong");
    if(type !== "multiple_choice") setAnswer(userAns);
  };

  return (
    <div style={{ ...S.glassCard, borderLeft: `4px solid ${meta.color}` }}>
      <div style={S.cardTopRow}>
        <span style={S.cardTitle}>Mashq #{index + 1}</span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: `${meta.color}22`, border: `1px solid ${meta.color}`,
          color: "#fff", padding: "5px 12px", borderRadius: 10,
          fontSize: 13, fontWeight: 600,
        }}>
          {meta.icon} {meta.label}
        </span>
      </div>

      {type === "flashcard" ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
            Inglizchasini eslang:
          </div>
          <h3 style={{ fontSize: "26px", marginBottom: "14px", color: "white", fontWeight: 700 }}>{word.uzbek}</h3>
          {result ? (
            <h3 style={{ fontSize: "30px", color: meta.color, fontWeight: "bold" }}>{word.english}</h3>
          ) : (
            <button style={{ ...S.outlineBtn, flex: "none" }} onClick={() => setResult("shown")}>👁 Javobni ko'rish</button>
          )}
        </div>
      ) : (
        <>
          <p style={S.sentence}>
            {word.exerciseSentence}
          </p>
          
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
                  placeholder={type === "listening" ? "Eshitganingizni yozing..." : "Javobni kiriting..."}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && check()}
                />
                <button style={S.checkBtn} onClick={() => check()}>Tekshirish</button>
              </>
            )}
          </div>
        </>
      )}

      {result === "correct" && <p style={{ ...S.feedback, color: "#34d399" }}>✓ To'g'ri javob!</p>}
      {result === "wrong" && (
        <p style={{ ...S.feedback, color: "#f87171" }}>
          ✕ Noto'g'ri. To'g'ri javob: <b>{word.answer}</b>
        </p>
      )}
      
      {result && word.exerciseSentenceTranslation && (
        <p style={{ marginTop: "10px", fontSize: "15px", color: "rgba(255,255,255,0.9)", fontStyle: "italic", padding: "12px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px", borderLeft: "4px solid #a855f7" }}>
          <b>Tarjimasi:</b> {word.exerciseSentenceTranslation}
        </p>
      )}
    </div>
  );
}

// ── Bosh sahifa ──────────────────────────────────────────────
export default function HomePage() {
  const [inputs, setInputs] = useState([""]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const updateInput = (i, val) =>
    setInputs((arr) => arr.map((x, idx) => (idx === i ? val : x)));
  const addInput = () => setInputs((arr) => [...arr, ""]);
  const removeInput = (i) =>
    setInputs((arr) => arr.filter((_, idx) => idx !== i));

  const generate = async () => {
    const words = inputs.map((w) => w.trim()).filter(Boolean);
    if (words.length === 0) {
      toast("Iltimos, kamida bitta so'z kiriting", "error");
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      const out = await api.generate(words);
      setResults(out);
      toast("Natijalar muvaffaqiyatli yaratildi!", "success");
    } catch (e) {
      toast(e.message || "Xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await api.save(results);
      toast(`${results.length} ta so'z saqlandi!`, "success");
      setResults([]);
      setInputs([""]);
    } catch (e) {
      toast(e.message || "Saqlashda xatolik", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <div style={S.bookIcon}>📖</div>
        <h1 style={S.bigTitle}>Word Bridge</h1>
        <p style={S.heroSub}>
          O'zbek va ingliz tillarida so'zlarni tarjima qiling, misol gaplar va
          mashqlar yarating
        </p>
      </div>

      <div style={S.glassCard}>
        <h2 style={S.cardHeader}>✨ So'zlarni kiriting</h2>
        <p style={S.cardSub}>O'zbek yoki ingliz tilida so'zlarni kiriting</p>

        {inputs.map((val, i) => (
          <div key={i} style={S.inputRow}>
            <input
              style={S.input}
              placeholder="So'z kiriting (masalan: 'uy' yoki 'house')"
              value={val}
              onChange={(e) => updateInput(i, e.target.value)}
            />
            {inputs.length > 1 && (
              <button style={S.deleteX} onClick={() => removeInput(i)}>
                ×
              </button>
            )}
          </div>
        ))}

        <div style={S.btnRow}>
          <button style={S.outlineBtn} onClick={addInput}>
            + Yana so'z qo'shish
          </button>
          <button style={S.solidBtn} onClick={generate} disabled={loading}>
            {loading ? "⏳ Yaratilmoqda..." : "✨ Natijalarni yaratish"}
          </button>
        </div>
      </div>

      {loading && <Spinner text="AI so'zlarni qayta ishlamoqda..." />}

      {results.length > 0 && (
        <div style={{ width: "100%" }}>
          <div style={S.resultsHeader}>
            <h2 style={S.sectionTitle}>Natijalar</h2>
            <button style={S.saveBtn} onClick={saveAll} disabled={saving}>
              {saving ? "💾 Saqlanmoqda..." : "💾 Saqlash"}
            </button>
          </div>
          {results.map((w, i) => (
            <ExerciseCard key={w.id} word={w} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
