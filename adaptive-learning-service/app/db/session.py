from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_ASYNC_URL,
    echo=True,
    pool_pre_ping=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session