from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.core.security import decode_token

security = HTTPBearer()

def get_current_user(
  creds: HTTPAuthorizationCredentials = Depends(security),
):
  try:
    payload = decode_token(creds.credentials)

    user_id = payload.get("sub")
    role = payload.get("role")

    if not user_id or not role:
      raise HTTPException(status_code=401, detail="Invalid token payload")

    return {
      "id": user_id,
      "role": role
    }

  except JWTError:
    raise HTTPException(status_code=401, detail="Invalid token")
    
def require_role(required_roles: list[str]):
  def role_checker(user=Depends(get_current_user)):
    if user["role"] not in required_roles:
      raise HTTPException(status_code=403, detail="Forbidden")
    return user
  return role_checker