from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
import time

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserSettings(BaseModel):
    notifications: bool = True
    dailyGoal: int = 20
    timezone: str = "UTC"

class UserStats(BaseModel):
    totalXP: int = 0
    streak: int = 0
    longestStreak: int = 0
    wordsLearned: int = 0

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    avatar: Optional[str] = None
    level: str = "Yangi Boshlovchi"
    createdAt: float
    settings: UserSettings = UserSettings()
    stats: UserStats = UserStats()

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class WordBaseOut(BaseModel):
    id: str
    word: str
    translation: str
    level: str
    pronunciation: Optional[str] = None
    examples: List[str] = []
    category: str = "General"

class UserWordSM2(BaseModel):
    id: str
    userId: str
    wordId: str
    ef: float = 2.5
    interval: int = 0
    repetitions: int = 0
    nextReview: float = Field(default_factory=time.time)
    lastAnswer: Optional[int] = None
    createdAt: float = Field(default_factory=time.time)

class ReviewSubmit(BaseModel):
    wordId: str
    quality: Literal[0, 1, 2] # 0=Bilmadim, 1=Qiyin, 2=Oson

class SessionCreate(BaseModel):
    wordsStudied: int
    correctAnswers: int
    xpEarned: int
    exerciseTypes: List[str]

class BadgeOut(BaseModel):
    id: str
    userId: str
    badgeType: str
    earnedAt: float
    metadata: dict = {}
