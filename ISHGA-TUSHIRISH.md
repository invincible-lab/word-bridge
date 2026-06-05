# Word Bridge — Ishga tushirish qo'llanmasi

Loyihani ishga tushirish uchun **2 ta alohida terminal** kerak bo'ladi:
biri **backend** (server), biri **frontend** (sayt).

VS Code'da terminal ochish: yuqori menyudan **Terminal → New Terminal**.
Ikkinchi terminal uchun terminal panelidagi **+** tugmasini bosing.

> Eslatma: terminal loyiha papkasida (`vocab-bridge`) ochilgan bo'lishi kerak.
> Quyidagi buyruqlar PowerShell va CMD da ishlaydi.

---

## 1-TERMINAL — Backend (port 8765)

Birinchi terminalda navbati bilan mana bu ikkita buyruqni kiriting (har biridan keyin Enter bosing):

```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8765
```

Quyidagicha yozuv chiqsa — backend tayyor:

```
Uvicorn running on http://127.0.0.1:8765
Application startup complete.
```

❗ Bu terminalni **yopmang** — yopsangiz backend o'chadi.

---

## 2-TERMINAL — Frontend (port 3001)

Yangi (ikkinchi) terminal ochib, quyidagilarni yozing:

```powershell
cd frontend
npm start
```

Kompilyatsiya 1-2 daqiqa davom etadi. Tayyor bo'lganda brauzer avtomatik ochiladi yoki o'zingiz oching:

👉 **http://localhost:3001**

❗ Bu terminalni ham **yopmang**.

---

## Yopish

Ishni tugatganda har ikkala terminalda **Ctrl + C** bosing yoki terminal oynalarini yoping.

---

## Muammolar va yechimlar

### "[WinError 10013] Сделана попытка доступа к сокету..." xatosi
Bu xato port bandligini bildiradi. Endi dastur **8765-port**da ishlaydi, shuning uchun bu xato takrorlanmasligi kerak.

### "Failed to fetch" — login qila olmayapman
Backend ishlamayapti degani. **1-terminal**ni tekshiring:
- Backend terminalida xato bormi?
- `http://localhost:8765` brauzerda ochilganda `{"message":"Word Bridge API ishlamoqda"}` chiqishi kerak.
- Agar chiqmasa — 1-terminaldagi backendni qayta ishga tushiring.

### "port already in use" / "address already in use"
Eski server hali ishlab turibdi. Band portni bo'shating:

```powershell
# Barcha Python (backend) jarayonlarini to'xtatish
Get-Process | Where-Object {$_.ProcessName -eq 'python'} | Stop-Process -Force

# Barcha Node (frontend) jarayonlarini to'xtatish
Get-Process | Where-Object {$_.ProcessName -eq 'node'} | Stop-Process -Force
```

Keyin yuqoridagi ishga tushirish buyruqlarini qaytadan bering.

---

## Birinchi marta o'rnatish (faqat bir marta kerak)

Agar `backend\venv` yoki `frontend\node_modules` papkalari yo'q bo'lsa, avval quyidagilarni bajaring:

**Backend kutubxonalari:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

**`.env` fayl** (agar yo'q bo'lsa): `backend\.env.example` dan nusxa olib, `backend\.env` deb nomlang va qatorlarni to'ldiring.

**Frontend kutubxonalari:**
```powershell
cd frontend
npm install
```
