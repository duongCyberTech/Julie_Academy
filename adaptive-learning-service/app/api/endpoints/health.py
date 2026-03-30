from fastapi import APIRouter, Depends
from app.api.deps import require_role

router = APIRouter()

@router.get("/")
def health(user=Depends(require_role(["admin"]))):
  return {"status": "ok"}