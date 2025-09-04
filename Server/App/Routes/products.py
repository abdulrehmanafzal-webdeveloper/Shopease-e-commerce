from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from pydantic import BaseModel
from App.DB.connection import get_connection
from App.Utils.dependencies import get_current_user
from typing import Optional, List, Tuple
import os
import logging
from uuid import uuid4
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["Products"])


# =====================
# Product Models
# =====================
class Product(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    image_url: str
    sub_category_id: int


class ProductUpdate(BaseModel):
    product_id: int
    price: float
    stock: int
    image_url: str
    sub_category_id: int


# =====================
# Create Product (Sell With Us)
# =====================
@router.post("/enterproduct")
def create_product(product: Product, user=Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    print(product)
    try:
        if user["role"] not in ["admin", "user"]:
            raise HTTPException(status_code=403, detail="Permission denied")

        # Find subcategory by name (exact match recommended)
        cursor.execute(
            "SELECT id FROM sub_categories WHERE id = %s",
            (product.sub_category_id,),
        )
        sub_category = cursor.fetchone()
        if not sub_category:
            raise HTTPException(status_code=404, detail="Subcategory not found")

        # Insert product with resolved sub_category_id
        cursor.execute(
            """
            INSERT INTO products 
            (name, description, price, stock, image_url, sub_category_id, user_id)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """,
            (
                product.name,
                product.description,
                product.price,
                product.stock,
                product.image_url,
                sub_category["id"],
                user["id"],
            ),
        )
        conn.commit()

        return {
            "message": "Product created successfully",
            "product_id": cursor.lastrowid,
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating product: {str(e)}")
    finally:
        conn.close()


# =====================
# Fetch All Products (Paginated)
# =====================
@router.get("/allproducts")
def get_all_products():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT p.id as product_id,
            p.name AS product_name,
            p.description AS product_description,
            p.price,
            p.stock,
            p.image_url,
            p.user_id,
            u.role AS user_role
            FROM products p
            LEFT JOIN users u ON p.user_id = u.id
            """
        )
        results = cursor.fetchall()
        return {"products": results}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching products: {str(e)}"
        )
    finally:
        conn.close()


# =====================
# Product Details
# =====================
@router.get("/getproductsbyid/{sub_category_id}")
def get_product_details(sub_category_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT p.id as product_id,
            p.name AS product_name,
            p.description AS product_description,
            p.price,
            p.stock,
            p.image_url,
            p.sub_category_id
            FROM products p
            WHERE p.sub_category_id = %s
        """,
            (sub_category_id,),
        )
        product = cursor.fetchall()
        if not product:
            raise HTTPException(status_code=404, detail="Products not found")
        return {"products": product}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# =====================
# Update Product
# =====================
@router.put("/updateproduct")
def update_product(data: ProductUpdate, user=Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM products WHERE id=%s", (data.product_id,))
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if not (user["role"] == "admin" or product["user_id"] == user["id"]):
            raise HTTPException(
                status_code=403, detail="Not authorized to update this product"
            )

        cursor.execute(
            """
            UPDATE products
            SET price=%s, stock=%s, image_url=%s, sub_category_id=%s
            WHERE id=%s
        """,
            (
                data.price,
                data.stock,
                data.image_url,
                data.sub_category_id,
                data.product_id,
            ),
        )
        conn.commit()

        return {"message": "Product updated successfully"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating product: {str(e)}")
    finally:
        conn.close()


# =====================
# Delete Product
# =====================
@router.delete("/deleteproduct/{product_id}")
def delete_product(product_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check if product exists
        cursor.execute("SELECT * FROM products WHERE id=%s", (product_id,))
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Check user authorization
        if not (user["role"] == "admin" or product["user_id"] == user["id"]):
            raise HTTPException(
                status_code=403, detail="Not authorized to delete this product"
            )

        # Check if product is part of any orders
        cursor.execute(
            "SELECT COUNT(*) as count FROM order_items WHERE product_id=%s",
            (product_id,),
        )
        order_count = cursor.fetchone()["count"]
        if order_count > 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete product that is part of existing orders",
            )

        # Remove product from all carts and restore stock
        cursor.execute(
            "SELECT user_email, session_id, quantity FROM cart WHERE product_id=%s",
            (product_id,),
        )
        cart_items = cursor.fetchall()

        # Restore stock for each cart item and remove from cart
        for item in cart_items:
            # Restore stock
            cursor.execute(
                "UPDATE products SET stock = stock + %s WHERE id = %s",
                (item["quantity"], product_id),
            )

        # Remove product from all carts
        cursor.execute("DELETE FROM cart WHERE product_id=%s", (product_id,))

        # Delete the product
        cursor.execute("DELETE FROM products WHERE id=%s", (product_id,))
        conn.commit()

        # Log the deletion
        logger.info(
            f"Product {product_id} deleted by user {user['email'] if user else 'Unknown'}"
        )

        return {"message": "Product deleted successfully"}

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        conn.rollback()
        logger.error(f"Error deleting product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting product: {str(e)}")
    finally:
        conn.close()


# =====================
# Search Products
# =====================
def calculate_similarity(str1, str2):
    """Calculate similarity between two strings using a simple algorithm"""
    str1, str2 = str1.lower(), str2.lower()
    if str1 == str2:
        return 1.0

    # Calculate Jaccard similarity
    set1, set2 = set(str1.split()), set(str2.split())
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))

    if union == 0:
        return 0.0

    return intersection / union


def is_category_search(keyword, categories, subcategories, threshold=0.6):
    """Determine if the keyword is more likely a category search"""
    keyword_lower = keyword.lower()

    # Check for exact matches with categories/subcategories
    for cat in categories:
        if keyword_lower == cat["name"].lower():
            return True

    for subcat in subcategories:
        if keyword_lower == subcat["name"].lower():
            return True

    # Check for high similarity with categories/subcategories
    for cat in categories:
        if calculate_similarity(keyword, cat["name"]) >= threshold:
            return True
        if calculate_similarity(keyword, cat["description"] or "") >= threshold:
            return True

    for subcat in subcategories:
        if calculate_similarity(keyword, subcat["name"]) >= threshold:
            return True
        if calculate_similarity(keyword, subcat["description"] or "") >= threshold:
            return True

    # Check for common category keywords
    common_categories = [
        "electronics",
        "fashion",
        "home",
        "sports",
        "kids",
        "shoes",
        "clothing",
        "accessories",
    ]
    for cat in common_categories:
        if cat in keyword_lower:
            return True

    return False


@router.get("/search")
def search_products(keyword: str = Query(..., min_length=1)):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Get all categories and subcategories for analysis
        cursor.execute("SELECT id, name, description FROM categories")
        categories = cursor.fetchall()

        cursor.execute("SELECT id, name, description, category_id FROM sub_categories")
        subcategories = cursor.fetchall()

        # Determine search type
        search_type = (
            "product"
            if not is_category_search(keyword, categories, subcategories)
            else "category"
        )

        if search_type == "category":
            # Category search - search in categories and subcategories
            query = """
            SELECT
                p.id as product_id,
                p.name AS product_name,
                p.description AS product_description,
                p.price,
                p.stock,
                p.image_url,
                sc.id as sub_category_id,
                sc.name AS sub_category_name,
                c.id as category_id,
                c.name AS category_name
            FROM categories c
            INNER JOIN sub_categories sc
                ON c.id = sc.category_id
            INNER JOIN products p
                ON sc.id = p.sub_category_id
            WHERE
                LOWER(c.name) LIKE LOWER(%s)
                OR LOWER(c.description) LIKE LOWER(%s)
                OR LOWER(sc.name) LIKE LOWER(%s)
                OR LOWER(sc.description) LIKE LOWER(%s)
            """

            like_pattern = f"%{keyword}%"
            cursor.execute(
                query, (like_pattern, like_pattern, like_pattern, like_pattern)
            )
            products = cursor.fetchall()
        else:
            # Product search - search directly in product names
            query = """
            SELECT
                p.id as product_id,
                p.name AS product_name,
                p.description AS product_description,
                p.price,
                p.stock,
                p.image_url,
                sc.id as sub_category_id,
                sc.name AS sub_category_name,
                c.id as category_id,
                c.name AS category_name
            FROM products p
            INNER JOIN sub_categories sc
                ON p.sub_category_id = sc.id
            INNER JOIN categories c
                ON sc.category_id = c.id
            WHERE
                LOWER(p.name) LIKE LOWER(%s)
            ORDER BY
                CASE
                    WHEN LOWER(p.name) = LOWER(%s) THEN 1  -- Exact match first
                    WHEN LOWER(p.name) LIKE LOWER(%s) THEN 2  -- Starts with
                    WHEN LOWER(p.name) LIKE LOWER(%s) THEN 3  -- Contains
                    ELSE 4
                END,
                p.name
            """

            like_pattern = f"%{keyword}%"
            cursor.execute(
                query, (like_pattern, keyword, f"{keyword}%", f"%{keyword}%")
            )
            products = cursor.fetchall()

            # If no exact or close matches, try fuzzy matching
            if len(products) < 5:
                # Get all products for fuzzy matching
                cursor.execute(
                    """
                    SELECT
                        p.id as product_id,
                        p.name AS product_name,
                        p.description AS product_description,
                        p.price,
                        p.stock,
                        p.image_url,
                        sc.id as sub_category_id,
                        sc.name AS sub_category_name,
                        c.id as category_id,
                        c.name AS category_name
                    FROM products p
                    INNER JOIN sub_categories sc
                        ON p.sub_category_id = sc.id
                    INNER JOIN categories c
                        ON sc.category_id = c.id
                """
                )
                all_products = cursor.fetchall()

                # Create a set of existing product IDs to prevent duplicates
                existing_product_ids = {product["product_id"] for product in products}

                # Add fuzzy matches
                fuzzy_matches = []
                for product in all_products:
                    similarity = calculate_similarity(keyword, product["product_name"])
                    if similarity > 0.5:  # Adjust threshold as needed
                        product["similarity"] = similarity
                        fuzzy_matches.append(product)

                # Sort by similarity and add to results
                fuzzy_matches.sort(key=lambda x: x["similarity"], reverse=True)
                for match in fuzzy_matches:
                    # Only add if not already in results
                    if match["product_id"] not in existing_product_ids:
                        products.append(match)
                        existing_product_ids.add(
                            match["product_id"]
                        )  # Add to set to prevent future duplicates
                        if len(products) >= 20:  # Limit results
                            break

        cursor.close()
        conn.close()

        if not products:
            return {
                "message": "No products found for the given keyword.",
                "search_type": search_type,
            }

        return {
            "count": len(products),
            "products": products,
            "search_type": search_type,
        }

    except Exception as e:
        return {"error": str(e)}


# =====================
# Trending Products (Homepage)
# =====================
@router.get("/trending")
def get_trending_products(limit: int = 6):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT p.id, p.name, p.price, p.image_url, COUNT(c.product_id) AS popularity
            FROM cart c
            JOIN products p ON c.product_id = p.id
            GROUP BY p.id
            ORDER BY popularity DESC
            LIMIT %s
        """,
            (limit,),
        )
        return cursor.fetchall()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching trending products: {str(e)}"
        )
    finally:
        conn.close()


@router.get("/getproductbyid/{product_id}")
def get_product_by_id(product_id: int, limit_related: int = Query(4, description="Number of related products to fetch")):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        # Get the main product
        query = """
        SELECT 
            p.id AS product_id,
            p.name AS product_name,
            p.description AS product_description,
            p.price,
            p.stock,
            p.image_url,
            sc.id AS sub_category_id,
            sc.name AS sub_category_name,
            c.id AS category_id,
            c.name AS category_name
        FROM products p
        INNER JOIN sub_categories sc ON p.sub_category_id = sc.id
        INNER JOIN categories c ON sc.category_id = c.id
        WHERE p.id = %s
        """

        cursor.execute(query, (product_id,))
        product = cursor.fetchone()

        if not product:
            return {"message": f"No product found with ID {product_id}."}
            
        # Get related products from the same sub-category
        related_query = """
        SELECT 
            p.id AS product_id,
            p.name AS product_name,
            p.description AS product_description,
            p.price,
            p.stock,
            p.image_url
        FROM products p
        WHERE p.sub_category_id = %s AND p.id != %s
        LIMIT %s
        """
        
        cursor.execute(related_query, (product["sub_category_id"], product_id, limit_related))
        related_products = cursor.fetchall()
        
        cursor.close()
        conn.close()

        return {
            "product": product,
            "related_products": related_products
        }

    except Exception as e:
        logger.error(f"Error fetching product details: {str(e)}")
        return {"error": str(e)}

    # =====================


# Upload Image Endpoint
# =====================
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), user=Depends(get_current_user)):
    try:
        if user["role"] not in ["admin", "user"]:
            raise HTTPException(status_code=403, detail="Permission denied")

        # Generate unique file name
        file_ext = os.path.splitext(file.filename)[1]
        unique_name = f"{uuid4().hex}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        # Save file to local uploads folder
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        # Return relative path to be stored in DB
        file_url = f"/{UPLOAD_DIR}/{unique_name}"
        return {"url": file_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")


# =====================
# fetch product for a specific user
@router.get("/allproducts/{user_id}")
def get_products_by_user(user_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT 
                p.id AS product_id,
                p.name AS product_name,
                p.description AS product_description,
                p.price,
                p.stock,
                p.image_url,
                p.user_id
            FROM products p
            WHERE p.user_id = %s
            """,
            (user_id,),
        )
        results = cursor.fetchall()
        return {"products": results}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching products: {str(e)}"
        )
    finally:
        conn.close()
