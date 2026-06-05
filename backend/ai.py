"""
AI moduli — so'zni tarjima qilish va mashq yaratish.

Ishlash tartibi:
1. Agar GROQ_API_KEY .env faylda mavjud bo'lsa — Groq (Llama 3) API ishlatadi (BEPUL).
2. Aks holda — kichik o'rnatilgan lugat asosida ishlaydi (kalitsiz sinash uchun).

Bepul API kalit olish: https://console.groq.com
(Uzbekistonda ishlaydi, kuniga 14,400 so'rov bepul)
"""
import os
import json
import re

# ── Fallback lugat (API kaliti bo'lmaganda) ─────────────────
FALLBACK_DICT = {
    "uy": ("house", "I live in a small _______ near the river.", "house"),
    "house": ("house", "I live in a small _______ near the river.", "house"),
    "kitob": ("book", "She is reading an interesting _______ tonight.", "book"),
    "book": ("book", "She is reading an interesting _______ tonight.", "book"),
    "suv": ("water", "Please bring me a glass of cold _______.", "water"),
    "water": ("water", "Please bring me a glass of cold _______.", "water"),
    "kompyuter": ("computer", "He fixed the broken _______ in one hour.", "computer"),
    "computer": ("computer", "He fixed the broken _______ in one hour.", "computer"),
    "maktab": ("school", "The children walk to _______ every morning.", "school"),
    "school": ("school", "The children walk to _______ every morning.", "school"),
    "do'st": ("friend", "My best _______ is coming to visit tomorrow.", "friend"),
    "friend": ("friend", "My best _______ is coming to visit tomorrow.", "friend"),
    "ovqat": ("food", "The _______ at this restaurant is delicious.", "food"),
    "food": ("food", "The _______ at this restaurant is delicious.", "food"),
    "mashina": ("car", "They bought a new red _______ last week.", "car"),
    "car": ("car", "They bought a new red _______ last week.", "car"),
}


def _fallback(raw: str) -> dict:
    """API kaliti bo'lmaganda lugatdan javob beradi."""
    key = raw.lower().strip()
    if key in FALLBACK_DICT:
        eng, sentence, answer = FALLBACK_DICT[key]
        uz = key
        for k, v in FALLBACK_DICT.items():
            if v[0] == eng and k != eng:
                uz = k
                break
        return {
            "english": eng,
            "uzbek": uz if uz != eng else key,
            "exerciseSentence": sentence,
            "answer": answer,
        }
    return {
        "english": raw,
        "uzbek": raw,
        "exerciseSentence": "I need to use the word _______ in a sentence.",
        "answer": raw.lower(),
    }


async def generate_word_data(raw: str) -> dict:
    """So'zni qayta ishlaydi: tarjima + misol gap + mashq.

    Groq (Llama 3.1) API ishlatadi — bepul, Uzbekistonda ishlaydi.
    API kalit: https://console.groq.com
    Agar bir nechta kalit berilgan bo'lsa, xatolikda navbatdagisiga o'tadi.
    """
    api_keys_str = os.getenv("GROQ_API_KEYS", os.getenv("GROQ_API_KEY", "")).strip()

    if not api_keys_str:
        return _fallback(raw)

    api_keys = [k.strip() for k in api_keys_str.split(",") if k.strip()]

    from groq import AsyncGroq

    last_error = None
    for api_key in api_keys:
        try:
            client = AsyncGroq(api_key=api_key)

            prompt = (
                f'You are a JSON translation engine for an Uzbek-English vocabulary app.\n'
                f'The user entered this word: "{raw}"\n\n'
                f'Produce the following JSON object exactly:\n'
                f'{{\n'
                f'  "english": "the English form of the word",\n'
                f'  "uzbek": "the Uzbek translation of the word",\n'
                f'  "exerciseSentence": "a natural English sentence (8-14 words). You MUST replace the English word with EXACTLY 7 underscores: _______",\n'
                f'  "exerciseSentenceTranslation": "the accurate Uzbek translation of the complete exercise sentence",\n'
                f'  "answer": "the exact English word that fills the blank (lowercase)",\n'
                f'  "exerciseType": "randomly pick ONE of: fill_in_the_blank, multiple_choice, flashcard, listening",\n'
                f'  "options": ["word1", "word2", "word3", "word4"] // Only if multiple_choice, otherwise []\n'
                f'}}\n\n'
                f'Respond with ONLY valid JSON, no markdown, no other text.\n'
            )

            response = await client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=350,
                temperature=0.4,
            )

            text = response.choices[0].message.content.strip()
            text = re.sub(r"```json|```", "", text).strip()
            parsed = json.loads(text)
            return {
                "english": parsed["english"],
                "uzbek": parsed["uzbek"],
                "exerciseSentence": parsed["exerciseSentence"],
                "exerciseSentenceTranslation": parsed.get("exerciseSentenceTranslation", ""),
                "answer": str(parsed.get("answer", parsed["english"])).lower(),
                "exerciseType": parsed.get("exerciseType", "fill_in_the_blank"),
                "options": parsed.get("options", [])
            }
        except Exception as e:
            print(f"Groq API xatosi (kalit {api_key[:8]}...): {e}")
            last_error = e
            continue

    print(f"Barcha Groq kalitlari ishlamadi. Oxirgi xato: {last_error} — fallback lugat ishlatilmoqda")
    return _fallback(raw)
