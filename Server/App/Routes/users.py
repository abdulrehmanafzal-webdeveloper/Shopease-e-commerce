from fastapi import APIRouter, HTTPException,Depends
from pydantic import BaseModel, EmailStr, field_validator
import re
from DB.connection import get_connection
from Utils import security
from Utils.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "user"  # Default role

    @field_validator("password")
    @classmethod
    def strong_password(cls, value: str):
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if len(re.findall(r"[A-Z]", value)) < 3:
            raise ValueError("Password must contain at least 3 uppercase letters.")
        if len(re.findall(r"[a-z]", value)) < 2:
            raise ValueError("Password must contain at least 2 lowercase letters.")
        if len(re.findall(r"[^A-Za-z0-9]", value)) < 2:
            raise ValueError("Password must contain at least 2 special characters.")
        return value

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: str
    email: EmailStr
    password: str 

    @field_validator("password")
    @classmethod
    def strong_password(cls, value: str):
        if value is None:
            return value
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if len(re.findall(r"[A-Z]", value)) < 3:
            raise ValueError("Password must contain at least 3 uppercase letters.")
        if len(re.findall(r"[a-z]", value)) < 2:
            raise ValueError("Password must contain at least 2 lowercase letters.")
        if len(re.findall(r"[^A-Za-z0-9]", value)) < 2:
            raise ValueError("Password must contain at least 2 special characters.")
        return value


@router.post("/register")
def register(user: UserRegister):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Normalize email to lowercase
        user.email = user.email.lower()

        # Check if email already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hash password
        hashed_password = security.hash_password(user.password)

        # Save user with role="user"
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
            (user.name, user.email, hashed_password, user.role or "user")
        )
        conn.commit()
        return {"message": "User registered successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

    finally:
        if conn:
            conn.close()


@router.post("/login")
def login(user: UserLogin):
    print(user)
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Normalize email
        useremail = user.email.lower()

        # Find user
        cursor.execute("SELECT * FROM users WHERE email = %s", (useremail,))
        db_user = cursor.fetchone()

        if not db_user or not security.verify_password(user.password, db_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Generate JWT token
        token = security.create_access_token({
            "email": db_user["email"],
            "role": db_user["role"]
        })

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id":db_user["id"],
                "email": db_user["email"],
                "name": db_user["name"],
                "role": db_user["role"],
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

    finally:
        if conn:
            conn.close()


@router.put("/update")
def update_user(updated_data: UserUpdate,user=Depends(get_current_user)):
    conn = None
    try:
        id=user["id"]
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        update_fields = []
        values = []

        if updated_data.name:
            update_fields.append("name = %s")
            values.append(updated_data.name)

        if updated_data.email:
            updated_data.email = updated_data.email.lower()
            update_fields.append("email = %s")
            values.append(updated_data.email)

        if updated_data.password:
            hashed_password = security.hash_password(updated_data.password)
            update_fields.append("password = %s")
            values.append(hashed_password)

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")


        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = {id}"
        cursor.execute(query, tuple(values))
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": "User updated successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

    finally:
        if conn:
            conn.close()


@router.delete("/delete/{user_id}")
def delete_user(user_id: int):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": "User deleted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

    finally:
        if conn:
            conn.close()
