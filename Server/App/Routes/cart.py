from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from App.DB.connection import get_connection
from App.Utils.dependencies import get_current_user
from typing import Optional

router = APIRouter(prefix="/cart", tags=["Cart"])


class AddToCart(BaseModel):
    product_id: int
    quantity: int


# ------------------ Add to Cart ------------------
@router.post("/addcart")
def add_to_cart(
    item: AddToCart,
    session_id: Optional[str] = None,
    user: Optional[dict] = Depends(get_current_user),
):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:

        # Determine identifier
        if user:
            identifier_col = "user_email"
            identifier_value = user["email"]
        elif session_id:
            identifier_col = "session_id"
            identifier_value = session_id
        else:
            raise HTTPException(
                status_code=400, detail="Login or session_id required for cart"
            )

        # Validate product & stock
        cursor.execute("SELECT stock FROM products WHERE id = %s", (item.product_id,))
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if product["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail="Not enough stock available")

        # Update existing or insert new cart item
        cursor.execute(
            f"SELECT * FROM cart WHERE {identifier_col}=%s AND product_id=%s",
            (identifier_value, item.product_id),
        )
        existing_item = cursor.fetchone()

        if existing_item:
            cursor.execute(
                "UPDATE cart SET quantity = quantity + %s WHERE id = %s",
                (item.quantity, existing_item["id"]),
            )
        else:
            cursor.execute(
                f"INSERT INTO cart ({identifier_col}, product_id, quantity) VALUES (%s,%s,%s)",
                (identifier_value, item.product_id, item.quantity),
            )

        # Deduct stock
        cursor.execute(
            "UPDATE products SET stock = stock - %s WHERE id=%s",
            (item.quantity, item.product_id),
        )
        conn.commit()
        return {"message": "Product added to cart"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ------------------ View Cart ------------------
@router.get("/getcart")
def view_cart(
    session_id: Optional[str] = None, user: Optional[dict] = Depends(get_current_user)
):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)  # Debugging line to check request state
    try:
        # user = getattr(request.state, "user", None)

        if user:
            identifier_col = "user_email"
            identifier_value = user["email"]
        elif session_id:
            identifier_col = "session_id"
            identifier_value = session_id
        else:
            raise HTTPException(
                status_code=400, detail="Login or session_id required for cart"
            )

        cursor.execute(
            f"""
            SELECT c.product_id as cart_product_id,c.id,c.user_email,c.session_id,p.id AS product_id, p.name, p.price, p.image_url,p.stock, c.quantity
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.{identifier_col} = %s
        """,
            (identifier_value,),
        )
        cart_items = cursor.fetchall()

        # Add frequently bought with for each cart item
        for item in cart_items:
            cursor.execute(
                f"""
                SELECT DISTINCT p.id, p.name, p.price, p.image_url
                FROM cart c1
                JOIN cart c2 
                  ON (c1.session_id IS NOT NULL AND c1.session_id = c2.session_id)
                  OR (c1.user_email IS NOT NULL AND c1.user_email = c2.user_email)
                JOIN products p ON p.id = c2.product_id
                WHERE c1.product_id=%s AND c2.product_id!=%s
                LIMIT 3
            """,
                (item["product_id"], item["product_id"]),
            )
            item["frequently_bought_with"] = cursor.fetchall()

        return {"cart_items": cart_items, "count": len(cart_items)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ------------------ Remove from Cart ------------------
@router.delete("/removecart/{product_id}")
def remove_from_cart(
    product_id: int,
    user: Optional[dict] = Depends(get_current_user),
    session_id: Optional[str] = None,
):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:

        if user:
            identifier_col = "user_email"
            identifier_value = user["email"]
        elif session_id:
            identifier_col = "session_id"
            identifier_value = session_id
        else:
            raise HTTPException(
                status_code=400, detail="Login or session_id required for cart"
            )

        # Get item quantity for stock restore
        cursor.execute(
            f"SELECT quantity FROM cart WHERE {identifier_col}=%s AND product_id=%s",
            (identifier_value, product_id),
        )
        item = cursor.fetchone()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found in cart")

        cursor.execute(
            f"DELETE FROM cart WHERE {identifier_col}=%s AND product_id=%s",
            (identifier_value, product_id),
        )
        cursor.execute(
            "UPDATE products SET stock = stock + %s WHERE id = %s",
            (item["quantity"], product_id),
        )

        conn.commit()
        return {"message": "Item removed from cart"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ------------------ Update Cart Quantity ------------------
@router.put("/updatecart/{product_id}")
def update_cart(
    product_id: int, quantity: int, user: Optional[dict] = Depends(get_current_user), session_id: Optional[str] = None
):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:

        if user:
            identifier_col = "user_email"
            identifier_value = user["email"]
        elif session_id:
            identifier_col = "session_id"
            identifier_value = session_id
        else:
            raise HTTPException(
                status_code=400, detail="Login or session_id required for cart"
            )

        # Check current quantity
        cursor.execute(
            f"SELECT quantity FROM cart WHERE {identifier_col}=%s AND product_id=%s",
            (identifier_value, product_id),
        )
        existing_item = cursor.fetchone()
        if not existing_item:
            raise HTTPException(status_code=404, detail="Item not found in cart")

        old_qty = existing_item["quantity"]
        diff = quantity - old_qty

        # Adjust stock based on difference
        if diff > 0:
            cursor.execute("SELECT stock FROM products WHERE id=%s", (product_id,))
            stock = cursor.fetchone()["stock"]
            if stock < diff:
                raise HTTPException(status_code=400, detail="Not enough stock")
            cursor.execute(
                "UPDATE products SET stock = stock - %s WHERE id=%s", (diff, product_id)
            )
        elif diff < 0:
            cursor.execute(
                "UPDATE products SET stock = stock + %s WHERE id=%s",
                (-diff, product_id),
            )

        cursor.execute(
            f"UPDATE cart SET quantity=%s WHERE {identifier_col}=%s AND product_id=%s",
            (quantity, identifier_value, product_id),
        )

        conn.commit()
        return {"message": "Cart updated"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ------------------ Clear Cart ------------------
@router.delete("/clearcart")
def clear_cart(
    user: Optional[dict] = Depends(get_current_user), session_id: Optional[str] = None
):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
      

        if user:
            identifier_col = "user_email"
            identifier_value = user["email"]
        elif session_id:
            identifier_col = "session_id"
            identifier_value = session_id
        else:
            raise HTTPException(
                status_code=400, detail="Login or session_id required for cart"
            )

        # Restore stock for all items
        cursor.execute(
            f"SELECT product_id, quantity FROM cart WHERE {identifier_col}=%s",
            (identifier_value,),
        )
        items = cursor.fetchall()

        cursor.execute(
            f"DELETE FROM cart WHERE {identifier_col}=%s", (identifier_value,)
        )
        conn.commit()
        return {"message": "Cart cleared"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
