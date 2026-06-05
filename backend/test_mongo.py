import asyncio
import motor.motor_asyncio
import certifi

async def run():
    client = motor.motor_asyncio.AsyncIOMotorClient(
        'mongodb+srv://nuriddinametov1_db_user:MV1jKX7pUbidXHwE@cluster0.mdlzvzq.mongodb.net/?appName=Cluster0',
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000
    )
    try:
        await client.admin.command('ping')
        print('SUCCESS')
    except Exception as e:
        print(f'ERROR: {type(e).__name__} - {e}')

asyncio.run(run())
