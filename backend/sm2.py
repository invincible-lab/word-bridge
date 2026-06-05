import math
import time

def calculate_sm2(quality_input: int, ef: float, interval: int, repetitions: int, current_streak: int = 0):
    """
    SM-2 algoritmi.
    quality_input: 0 (Bilmadim), 1 (Qiyin), 2 (Oson)
    """
    # Map quality_input to q
    if quality_input == 0:
        q = 1 # Bilmadim
    elif quality_input == 1:
        q = 3 # Qiyin
    else:
        q = 5 # Oson
        
    if q < 3:
        # Xato javob yoki bilmaydi -> jarayoni nollanadi
        repetitions = 0
        interval = 1
    else:
        repetitions += 1
        if repetitions == 1:
            interval = 1
        elif repetitions == 2:
            interval = 6
        else:
            interval = round(interval * ef)
            
            # Streak bonusi
            if current_streak >= 7:
                interval = round(interval * 1.1)

    # EF ni yangilash
    ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    if ef < 1.3:
        ef = 1.3

    # Next review time in seconds (unix timestamp)
    # 1 kun = 86400 soniya
    next_review = time.time() + (interval * 86400)
    
    return {
        "ef": round(ef, 3),
        "interval": interval,
        "repetitions": repetitions,
        "nextReview": next_review
    }
