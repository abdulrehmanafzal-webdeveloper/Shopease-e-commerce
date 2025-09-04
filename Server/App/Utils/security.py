from passlib.context import CryptContext
from jose import jwt, JWTError
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize password hashing with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Config
SECRET_KEY = os.getenv("sec_key")
ALGORITHM = "HS256"

# ---------------------------
# Password Hashing Functions
# ---------------------------

def hash_password(password: str) -> str:
    """Hash the password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify if the plain password matches the hashed password"""
    return pwd_context.verify(plain_password, hashed_password)

# ---------------------------
# JWT Functions
# ---------------------------

def create_access_token(data: dict) -> str:
    """
    Create JWT token without expiration.
    WARNING: Tokens will never expire unless manually invalidated.
    """
    token=jwt.encode(data.copy(), SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_access_token(token: str) -> dict:
    """
    Verify JWT token and return decoded data
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise JWTError("Invalid token")
