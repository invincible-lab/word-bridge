"""
Word Bridge — Backend (FastAPI + MongoDB)
O'zbek-Ingliz so'z o'rganish ilovasi uchun API server.
"""
import os
import time
import uuid
from typing import List, Optional, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

from fastapi import Depends
from ai import generate_word_data
import auth
import models
import sm2

load_dotenv()

# ── Sozlamalar ───────────────────────────────────────────────
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "word_bridge")

app = FastAPI(title="Word Bridge API", version="1.0.0")

# CORS — frontend bilan bog'lanish uchun
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Ma'lumotlar bazasi ───────────────────────────────────────
client: Optional[AsyncIOMotorClient] = None
db = None


@app.on_event("startup")
async def startup():
    global client, db
    # certifi — Python 3.12+ da MongoDB Atlas SSL muammosini hal qiladi
    import certifi
    client = AsyncIOMotorClient(
        MONGO_URL,
        tlsCAFile=certifi.where(),
    )
    db = client[DB_NAME]
    print(f"MongoDB ulandi: {MONGO_URL[:40]}... / {DB_NAME}")


@app.on_event("shutdown")
async def shutdown():
    if client:
        client.close()


# ── Modellar ─────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    words: List[str]


class WordOut(BaseModel):
    id: str
    originalInput: str
    english: str
    uzbek: str
    exerciseSentence: str
    exerciseSentenceTranslation: str = ""
    answer: str
    exerciseType: str = "fill_in_the_blank"
    options: List[str] = []
    status: Literal["learning", "learned"]
    createdAt: float


class SaveRequest(BaseModel):
    words: List[WordOut]


class CheckRequest(BaseModel):
    answer: str


# ── Yordamchi ────────────────────────────────────────────────
def clean_doc(doc: dict) -> dict:
    """MongoDB _id ni olib tashlash."""
    doc.pop("_id", None)
    return doc


# ── API endpointlar ──────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "Word Bridge API ishlamoqda 🚀"}

# ── Auth Endpoints ──────────────────────────────────────────
@app.post("/api/auth/register", response_model=models.UserOut)
async def register(user: models.UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Bu email band")
    
    hashed_pw = auth.get_password_hash(user.password)
    new_user = {
        "id": f"usr_{uuid.uuid4().hex[:12]}",
        "name": user.name,
        "email": user.email,
        "passwordHash": hashed_pw,
        "level": "Yangi Boshlovchi",
        "createdAt": time.time(),
        "settings": models.UserSettings().model_dump(),
        "stats": models.UserStats().model_dump()
    }
    await db.users.insert_one(new_user)
    return new_user

@app.post("/api/auth/login")
async def login(user: models.UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not auth.verify_password(user.password, db_user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")
    
    access_token = auth.create_access_token(data={"sub": db_user["id"]})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user["id"], "email": db_user["email"]}}

@app.get("/api/auth/me", response_model=models.UserOut)
async def get_me(user_id: str = Depends(auth.get_current_user_id)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    return user


@app.post("/api/words/generate", response_model=List[WordOut])
async def generate_words(req: GenerateRequest):
    """So'zlarni AI orqali qayta ishlash (tarjima + mashq)."""
    if not req.words:
        raise HTTPException(400, "Kamida bitta so'z kiriting")

    results = []
    for raw in req.words:
        raw = raw.strip()
        if not raw:
            continue
        data = await generate_word_data(raw)
        results.append(
            WordOut(
                id=f"w_{uuid.uuid4().hex[:12]}",
                originalInput=raw,
                english=data["english"],
                uzbek=data["uzbek"],
                exerciseSentence=data["exerciseSentence"],
                exerciseSentenceTranslation=data.get("exerciseSentenceTranslation", ""),
                answer=data["answer"].lower().strip(),
                exerciseType=data.get("exerciseType", "fill_in_the_blank"),
                options=data.get("options", []),
                status="learning",
                createdAt=time.time(),
            )
        )
    return results


@app.post("/api/words/save")
async def save_words(req: SaveRequest, user_id: str = Depends(auth.get_current_user_id)):
    """So'zlarni bazaga saqlash va UserWords progressiga qo'shish."""
    if not req.words:
        raise HTTPException(400, "Saqlanadigan so'z yo'q")

    docs = [w.model_dump() for w in req.words]
    # Agar frontenddan _id qolib ketgan bo'lsa
    for d in docs:
        d.pop("_id", None)
    
    # 1. Global words bazasiga saqlash (nusxa bilan — insert_many docs ga
    #    ObjectId _id qo'shadi, u esa keyin word_obj ichida JSON xatosiga sabab bo'ladi).
    if docs:
        await db.words.insert_many([dict(d) for d in docs])

    # 2. Foydalanuvchi taraqqiyoti uchun userWords ga saqlash
    user_words = []
    for w in docs:
        user_words.append({
            "id": f"uw_{uuid.uuid4().hex[:12]}",
            "userId": user_id,
            "wordId": w["id"],
            "word_obj": w, # osonroq topish uchun
            "ef": 2.5,
            "interval": 0,
            "repetitions": 0,
            "nextReview": time.time(),
            "lastAnswer": None,
            "createdAt": time.time()
        })
    if user_words:
        await db.userWords.insert_many(user_words)
        
    return {"saved": len(docs)}


@app.get("/api/words", response_model=List[WordOut])
async def get_words(status: Optional[str] = None, user_id: str = Depends(auth.get_current_user_id)):
    """Saqlangan so'zlarni olish. filter: all / learned / learning."""
    # UserWords bazasidan olamiz
    cursor = db.userWords.find({"userId": user_id}).sort("createdAt", -1)
    results = []
    async for d in cursor:
        w_obj = d.get("word_obj", {})
        if w_obj:
            results.append(w_obj)
    return results


@app.patch("/api/words/{word_id}/status")
async def toggle_status(word_id: str, user_id: str = Depends(auth.get_current_user_id)):
    """So'z holatini o'zgartirish (learning <-> learned).

    Faqat foydalanuvchining o'z so'zi (userWords) ustida ishlaydi.
    """
    uw = await db.userWords.find_one({"userId": user_id, "wordId": word_id})
    if not uw:
        raise HTTPException(404, "So'z topilmadi")

    current = uw.get("word_obj", {}).get("status", "learning")
    new_status = "learned" if current == "learning" else "learning"
    await db.userWords.update_one(
        {"id": uw["id"]}, {"$set": {"word_obj.status": new_status}}
    )
    return {"id": word_id, "status": new_status}


@app.delete("/api/words/{word_id}")
async def delete_word(word_id: str, user_id: str = Depends(auth.get_current_user_id)):
    """So'zni o'chirish (faqat foydalanuvchining o'z so'zi)."""
    result = await db.userWords.delete_one({"userId": user_id, "wordId": word_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "So'z topilmadi")
    return {"deleted": word_id}


@app.get("/api/review/today")
async def get_today_review(user_id: str = Depends(auth.get_current_user_id)):
    """Bugun takrorlanishi kerak bo'lgan so'zlarni beradi (SM-2)"""
    now = time.time()
    
    # nextReview vaqti kelgan yoki o'tgan so'zlar
    cursor = db.userWords.find({
        "userId": user_id,
        "nextReview": {"$lte": now}
    }).sort("nextReview", 1).limit(20) # max 20 ta so'z

    words = []
    async for d in cursor:
        # word_obj ichidagi so'z ma'lumotlarini yuzaga chiqaramiz.
        # word_obj.id == wordId bo'lgani uchun frontend submitda to'g'ri id yuboradi.
        w = d.get("word_obj")
        if w:
            words.append(w)

    return words

@app.post("/api/review/submit")
async def submit_review(req: models.ReviewSubmit, user_id: str = Depends(auth.get_current_user_id)):
    """Mashq natijasini qabul qilib, SM-2 algoritmi bilan keyingi sanani belgilash"""
    uw = await db.userWords.find_one({"userId": user_id, "wordId": req.wordId})
    if not uw:
        raise HTTPException(404, "UserWord topilmadi")
        
    user = await db.users.find_one({"id": user_id})
    stats = user.get("stats", {})
    current_streak = stats.get("streak", 0)

    # SM-2 hisoblash
    sm2_result = sm2.calculate_sm2(
        quality_input=req.quality,
        ef=uw.get("ef", 2.5),
        interval=uw.get("interval", 0),
        repetitions=uw.get("repetitions", 0),
        current_streak=current_streak
    )

    await db.userWords.update_one(
        {"id": uw["id"]},
        {"$set": {
            "ef": sm2_result["ef"],
            "interval": sm2_result["interval"],
            "repetitions": sm2_result["repetitions"],
            "nextReview": sm2_result["nextReview"],
            "lastAnswer": req.quality
        }}
    )

    # ── Streak hisobi (kun bo'yicha) ──────────────────────────
    # today_day = epochdan beri o'tgan kunlar soni (UTC).
    today_day = int(time.time() // 86400)
    last_day = stats.get("lastReviewDay")

    if last_day == today_day:
        new_streak = current_streak or 1      # bugun allaqachon mashq qilingan
    elif last_day == today_day - 1:
        new_streak = current_streak + 1       # ketma-ket kun
    else:
        new_streak = 1                        # birinchi marta yoki uzilish

    longest_streak = max(stats.get("longestStreak", 0), new_streak)

    # XP berish (to'g'ri javob uchun)
    xp_gained = 10 if req.quality > 0 else 0

    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "stats.streak": new_streak,
            "stats.longestStreak": longest_streak,
            "stats.lastReviewDay": today_day,
        }, "$inc": {"stats.totalXP": xp_gained}}
    )

    return {"sm2": sm2_result, "xpGained": xp_gained, "streak": new_streak}

@app.get("/api/progress")
async def get_progress(user_id: str = Depends(auth.get_current_user_id)):
    """Foydalanuvchi statistikasi (Dashboard uchun)"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")

    now = time.time()
    total = await db.userWords.count_documents({"userId": user_id})
    learned = await db.userWords.count_documents(
        {"userId": user_id, "repetitions": {"$gt": 2}}
    )
    due_today = await db.userWords.count_documents(
        {"userId": user_id, "nextReview": {"$lte": now}}
    )

    return {
        "stats": user.get("stats", {}),
        "totalWords": total,
        "learnedWords": learned,
        "dueToday": due_today,
        "level": user.get("level", "Yangi Boshlovchi"),
    }
