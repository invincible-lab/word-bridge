import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import { useToast } from "./Toast";
import { S } from "./styles";
import Spinner from "./Spinner";

// ── Tarix mashq kartasi ──────────────────────────────────────
function HistoryCard({ word, onToggle, onDelete }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const toast = useToast();

  const type = word.exerciseType || "fill_in_the_blank";

  const check = (userAns = answer) => {
    const trimmed = userAns.trim().toLowerCase();
    const correct = (word.answer || word.english || "").toLowerCase().trim();
    const ok = trimmed === correct;
    setResult(ok ? "correct" : "wrong");
    if (type !== "multiple_choice") setAnswer(userAns);
  };

  return (
    <div style={S.glassCard}>
      {/* So'z ma'lumotlari */}
      <div style={S.cardTopRow}>
        <div>
          <div style={S.wordEn}>{word.english}</div>
          <div style={S.wordUz}>{word.uzbek}</div>
          <div style={S.smallBadge}>Kirish: {word.originalInput}</div>
        </div>
        <div style={S.iconCol}>
          {word.status === "learned" && (
            <span style={S.learnedBadge}>O'rganilgan</span>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={S.iconBtn}
              title="O'rganilgan deb belgilash"
              onClick={() => onToggle(word.id)}
            >
              {word.status === "learned" ? "✅" : "⭕"}
            </button>
            <button
              style={{ ...S.iconBtn, color: "#f87171" }}
              title="O'chirish"
              onClick={() => onDelete(word.id)}
            >
              🗑
            </button>
          </div>
        </div>
      </div>

      {/* Mashq qismi */}
      <div style={S.exerciseBlock}>
        <div style={S.exerciseLabel}>
          Mashq ({
            type === "listening" ? "Eshitib yozish" :
            type === "flashcard" ? "Flashcard" :
            type === "multiple_choice" ? "Variantni tanlash" :
            "Bo'shliqni to'ldirish"
          })
        </div>

        {type === "flashcard" ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <p style={{ ...S.sentence, textAlign: "center", fontSize: 22, fontWeight: 600 }}>
              {word.uzbek}
            </p>
            {result ? (
              <p style={{ fontSize: 26, color: "#a855f7", fontWeight: "bold", marginTop: 8 }}>
                {word.english}
              </p>
            ) : (
              <button style={{ ...S.outlineBtn, flex: "none", marginTop: 8 }} onClick={() => setResult("shown")}>
                Javobni ko'rish
              </button>
            )}
          </div>
        ) : (
          <>
            <p style={S.sentence}>
              {word.exerciseSentence}
            </p>

            {!result && (
              <div style={S.answerRow}>
                {type === "multiple_choice" && word.options && word.options.length > 0 ? (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", width: "100%" }}>
                    {word.options.map((opt, i) => (
                      <button key={i} onClick={() => check(opt)} style={S.outlineBtn}>
                        {opt}
                      </button>
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
                    <button style={S.checkBtn} onClick={() => check()}>
                      Tekshirish
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Natija */}
        {result === "correct" && (
          <p style={{ ...S.feedback, color: "#34d399" }}>✓ To'g'ri javob!</p>
        )}
        {result === "wrong" && (
          <p style={{ ...S.feedback, color: "#f87171" }}>
            ✕ Noto'g'ri. To'g'ri javob: <b>{word.answer || word.english}</b>
          </p>
        )}

        {/* Gapning tarjimasi */}
        {result && word.exerciseSentenceTranslation && (
          <p style={{
            marginTop: 10, fontSize: 14, color: "rgba(255,255,255,0.9)",
            fontStyle: "italic", padding: "10px 14px",
            backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 8,
            borderLeft: "4px solid #a855f7"
          }}>
            <b>Tarjimasi:</b> {word.exerciseSentenceTranslation}
          </p>
        )}

        {/* Qayta urinish tugmasi */}
        {result && result !== "shown" && (
          <button
            style={{ ...S.outlineBtn, flex: "none", marginTop: 10, fontSize: 13 }}
            onClick={() => { setResult(null); setAnswer(""); }}
          >
            Qayta urinish
          </button>
        )}
      </div>
    </div>
  );
}

// ── Tarix sahifasi ───────────────────────────────────────────
export default function HistoryPage() {
  const [allWords, setAllWords] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getWords("all");
      setAllWords(data);
    } catch (e) {
      toast(e.message || "Yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = {
    all: allWords.length,
    learned: allWords.filter((w) => w.status === "learned").length,
    learning: allWords.filter((w) => w.status === "learning").length,
  };

  const filtered = allWords.filter((w) =>
    filter === "all" ? true : w.status === filter
  );

  const handleToggle = async (id) => {
    try {
      await api.toggleStatus(id);
      setAllWords((ws) =>
        ws.map((w) =>
          w.id === id
            ? { ...w, status: w.status === "learned" ? "learning" : "learned" }
            : w
        )
      );
    } catch (e) {
      toast(e.message || "Xatolik", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteWord(id);
      setAllWords((ws) => ws.filter((w) => w.id !== id));
      toast("So'z o'chirildi", "info");
    } catch (e) {
      toast(e.message || "Xatolik", "error");
    }
  };

  const tabs = [
    { key: "all", label: `Barchasi (${counts.all})` },
    { key: "learned", label: `O'rganilgan (${counts.learned})` },
    { key: "learning", label: `O'rganilayotgan (${counts.learning})` },
  ];

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <div style={S.bookIcon}>🕐</div>
        <h1 style={S.midTitle}>So'zlar tarixi</h1>
        <p style={S.heroSub}>Siz saqlagan barcha so'zlar</p>
      </div>

      <div style={S.tabRow}>
        {tabs.map((t) => {
          const active = filter === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              style={{
                ...S.tabBtn,
                background: active ? "#ffffff" : "transparent",
                color: active ? "#7c3aed" : "#ffffff",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {loading && <Spinner text="Yuklanmoqda..." />}

      {!loading && filtered.length === 0 && (
        <div style={S.glassCard}>
          <p style={{ color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
            Hozircha so'zlar yo'q. Bosh sahifada so'z qo'shing.
          </p>
        </div>
      )}

      {!loading &&
        filtered.map((w) => (
          <HistoryCard
            key={w.id}
            word={w}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
    </div>
  );
}
