# 📖 Word Bridge

O'zbek-Ingliz so'z o'rganish web ilovasi. So'zlarni tarjima qiladi, AI yordamida
misol gaplar va to'ldirish mashqlarini yaratadi, o'rganish progressini kuzatadi.

**Texnologiyalar:** React + React Router (frontend), FastAPI + MongoDB (backend),
AI tarjima (Anthropic Claude API yoki o'rnatilgan lug'at).

---

## 📁 Loyiha tuzilishi

```
word-bridge/
├── backend/
│   ├── main.py            # FastAPI server + API endpointlar
│   ├── ai.py              # AI tarjima (Claude API / fallback lug'at)
│   ├── requirements.txt   # Python kutubxonalari
│   └── .env.example       # Sozlamalar namunasi
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js         # Routing
        ├── api.js         # Backend bilan bog'lanish
        ├── HomePage.js    # Bosh sahifa
        ├── HistoryPage.js # Tarix sahifasi
        ├── ProgressPage.js# Progress sahifasi
        ├── NavBar.js, Toast.js, Spinner.js, styles.js
        └── index.js, index.css
```

---

## ⚙️ Talab qilinadigan dasturlar

Ishga tushirishdan oldin kompyuteringizda quyidagilar o'rnatilgan bo'lishi kerak:

1. **Python 3.10+** — https://www.python.org/downloads/
2. **Node.js 18+** — https://nodejs.org/
3. **MongoDB** — https://www.mongodb.com/try/download/community
   - Yoki bepul bulutli variant: **MongoDB Atlas** (https://www.mongodb.com/atlas)

---

## 🚀 Ishga tushirish (2 ta terminal kerak)

### 1-QADAM: Backend (1-terminal)

```bash
cd word-bridge/backend

# Virtual muhit yaratish
python -m venv venv

# Faollashtirish:
#   Windows:
venv\Scripts\activate
#   Mac/Linux:
source venv/bin/activate

# Kutubxonalarni o'rnatish
pip install -r requirements.txt

# Sozlamalar faylini yaratish
#   Windows:
copy .env.example .env
#   Mac/Linux:
cp .env.example .env

# Serverni ishga tushirish
uvicorn main:app --reload --port 8000
```

Backend ishlasa, brauzerda `http://localhost:8000` ochib ko'ring —
`{"message": "Word Bridge API ishlamoqda 🚀"}` chiqishi kerak.

### 2-QADAM: Frontend (2-terminal)

```bash
cd word-bridge/frontend

# Kutubxonalarni o'rnatish (birinchi marta)
npm install

# Ishga tushirish
npm start
```

Brauzer avtomatik `http://localhost:3000` da ochiladi.

---

## 🔑 AI tarjima sozlash (ixtiyoriy)

Ilova **2 xil rejimda** ishlaydi:

| Rejim | Qanday yoqiladi | Imkoniyatlari |
|-------|-----------------|---------------|
| **Lug'at rejimi** | Hech narsa qilmaslik (standart) | ~8 ta so'z bilan ishlaydi, sinash uchun |
| **AI rejimi** | `.env` ga API kalit qo'yish | Istalgan so'zni tarjima qiladi |

AI rejimini yoqish uchun:

1. https://console.anthropic.com/ saytida ro'yxatdan o'ting
2. API kalit oling
3. `backend/.env` faylini oching va kalitni yozing:

```
ANTHROPIC_API_KEY=sk-ant-...
```

4. Backend serverni qayta ishga tushiring.

> **Eslatma:** API kalitsiz ham ilova to'liq ishlaydi — faqat lug'atdagi
> so'zlar bilan cheklanasiz (uy, kitob, suv, kompyuter, maktab, do'st, ovqat, mashina).

---

## 🗄 MongoDB sozlash variantlari

### Variant A — Lokal MongoDB
MongoDB Community o'rnatib, xizmatni ishga tushiring. `.env` da o'zgartirish shart emas:
```
MONGO_URL=mongodb://localhost:27017
```

### Variant B — MongoDB Atlas (bulutli, bepul)
1. https://www.mongodb.com/atlas da bepul klaster yarating
2. Connection string ni nusxalang
3. `backend/.env` da o'zgartiring:
```
MONGO_URL=mongodb+srv://foydalanuvchi:parol@cluster.xxxxx.mongodb.net/
```

---

## 📡 API endpointlar

| Metod | Manzil | Vazifasi |
|-------|--------|----------|
| POST | `/api/words/generate` | So'zlarni tarjima qilish + mashq yaratish |
| POST | `/api/words/save` | So'zlarni bazaga saqlash |
| GET | `/api/words?status=...` | Saqlangan so'zlarni olish (all/learned/learning) |
| PATCH | `/api/words/{id}/status` | O'rganilgan holatini o'zgartirish |
| DELETE | `/api/words/{id}` | So'zni o'chirish |
| POST | `/api/words/{id}/check` | Mashq javobini tekshirish |
| GET | `/api/progress` | Statistika (jami, o'rganilgan, foiz, oxirgi 5 ta) |

API hujjatlarini interaktiv ko'rish: `http://localhost:8000/docs`

---

## ❓ Tez-tez uchraydigan muammolar

**"MongoServerError" yoki ulanish xatosi** — MongoDB ishlamayapti.
MongoDB xizmatini ishga tushiring yoki Atlas connection string ni tekshiring.

**Frontendda "Failed to fetch"** — backend ishlamayapti.
1-terminalda `uvicorn` ishlab turganini tekshiring.

**`npm start` xato beradi** — `npm install` ni qayta bajaring.

**So'z tarjima qilinmayapti** — API kalit yo'q va so'z lug'atda yo'q.
Lug'atdagi so'zlarni sinab ko'ring yoki `.env` ga API kalit qo'shing.
