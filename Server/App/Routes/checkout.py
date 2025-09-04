# backend/routes/orders.py
from fastapi import APIRouter, HTTPException,Depends
from pydantic import BaseModel, EmailStr, constr
from typing import List, Optional
from Utils.dependencies import get_current_user
from mysql.connector import Error
from DB.connection import get_connection  # your existing DB connection function

router = APIRouter(prefix="/order", tags=["Orders"])


# ---------- MODELS ----------
class OrderItem(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price: float


class CreateOrder(BaseModel):
    user_email: EmailStr
    state: str
    city: str
    address: str
    phone_number: str = constr(min_length=11, max_length=20)
    payment_method: str  # "card" or "paypal"
    transaction_id: Optional[str] = None
    card_last4: Optional[str] = None
    items: List[OrderItem]


# ---------- CREATE ORDER ----------
@router.post("/create")
def create_order(order: CreateOrder):
    conn = get_connection()
    cursor = conn.cursor()
    print(order)

    try:
        # 1. Insert into orders table with payment info
        cursor.execute(
            """
            INSERT INTO orders (user_email, state, city, address, phone_number, payment_method, transaction_id, card_last4)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
            (
                order.user_email,
                order.state,
                order.city,
                order.address,
                order.phone_number,
                order.payment_method,
                order.transaction_id,
                order.card_last4,
            ),
        )
        conn.commit()

        order_id = cursor.lastrowid

        # 2. Insert items into order_items table
        for item in order.items:
            cursor.execute(
                """
                INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
                VALUES (%s, %s, %s, %s, %s)
            """,
                (
                    order_id,
                    item.product_id,
                    item.product_name,
                    item.quantity,
                    item.price,
                ),
            )

        conn.commit()

        return {"message": "Order created successfully", "order_id": order_id}

    except Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        conn.close()


# ---------- GET ALL ORDERS FOR A USER ----------
@router.get("/orders/{user_email}")
def get_orders(user_email: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Fetch orders (with payment info)
        cursor.execute(
            """
            SELECT * FROM orders
            WHERE user_email = %s
            ORDER BY order_date DESC
            """,
            (user_email,),
        )
        orders = cursor.fetchall()

        # For each order, fetch its items (with product details via JOIN)
        for order in orders:
            cursor.execute(
                """
                SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price,
                       p.name AS product_name, p.image_url
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = %s
                """,
                (order["id"],),
            )
            order["items"] = cursor.fetchall()

        return orders

    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        conn.close()


@router.get("/all")
def get_all_orders(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Fetch all orders ordered by date descending
        cursor.execute("""
            SELECT * FROM orders
            ORDER BY order_date DESC
        """)
        orders = cursor.fetchall()

        # Fetch items for each order
        for order in orders:
            cursor.execute("""
                SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price,
                       p.name AS product_name, p.image_url
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = %s
            """, (order["id"],))
            order["items"] = cursor.fetchall()

        return orders

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        conn.close()
