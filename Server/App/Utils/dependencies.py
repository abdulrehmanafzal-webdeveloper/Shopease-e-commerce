from typing import Optional
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from App.Utils.security import SECRET_KEY, ALGORITHM
from DB.connection import get_connection


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login", auto_error=False)

def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[dict]:
    if not token:
        return None  # No token provided, treat as guest

    conn = None
    try:
        # Decode JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")

        if not email:
            return None

        # Fetch user from DB
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        return user

    except JWTError:
        return None
    finally:
        if conn:
            conn.close()
