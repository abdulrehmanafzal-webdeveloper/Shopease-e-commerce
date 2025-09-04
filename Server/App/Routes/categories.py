from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from App.DB.connection import get_connection
from App.Utils.dependencies import get_current_user


router = APIRouter(prefix="/categories", tags=["Categories & Subcategories"])


# =====================
# Pydantic Models
# =====================
class CategoryCreate(BaseModel):
    name: str
    description: str
    banner_url: str


class SubCategoryCreate(BaseModel):
    name: str
    category_id: int
    description: str
    image_url: str


# =====================
# Create Category (Admin only)
# =====================
@router.post("/create")
def create_category(data: CategoryCreate, user=Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        if user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")

        # Check if category already exists
        cursor.execute("SELECT id FROM categories WHERE name=%s", (data.name,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Category already exists")

        cursor.execute("""
            INSERT INTO categories (name, description, banner_url)
            VALUES (%s, %s, %s)
        """, (data.name, data.description, data.banner_url))
        conn.commit()
        return {"message": "Category created successfully", "category_id": cursor.lastrowid}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating category: {str(e)}")
    finally:
        conn.close()


# =====================
# Create SubCategory (Admin only)
# =====================
@router.post("/sub/create")
def create_subcategory(data: SubCategoryCreate, user=Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        if user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")

        # Ensure parent category exists
        cursor.execute("SELECT id FROM categories WHERE id=%s", (data.category_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Parent category not found")

        # Check if subcategory already exists in the same category
        cursor.execute("SELECT id FROM sub_categories WHERE name=%s AND category_id=%s", (data.name, data.category_id))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Subcategory already exists in this category")

        cursor.execute("""
            INSERT INTO sub_categories (name, category_id, description, image_url)
            VALUES (%s, %s, %s, %s)
        """, (data.name, data.category_id, data.description, data.image_url))
        conn.commit()
        return {"message": "Subcategory created successfully", "sub_category_id": cursor.lastrowid}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating subcategory: {str(e)}")
    finally:
        conn.close()


# =====================
# Delete Category (Admin only)
# =====================
@router.delete("/delete/{category_id}")
def delete_category(category_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        if user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")

        # Check if category exists
        cursor.execute("SELECT id FROM categories WHERE id=%s", (category_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Category not found")

        # Check if category has subcategories
        cursor.execute("SELECT id FROM sub_categories WHERE category_id=%s", (category_id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Cannot delete category with existing subcategories")

        # Check if category has products
        cursor.execute("SELECT id FROM products WHERE category_id=%s", (category_id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Cannot delete category with existing products")

        # Delete the category
        cursor.execute("DELETE FROM categories WHERE id=%s", (category_id,))
        conn.commit()
        return {"message": f"Category id {category_id} deleted successfully"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting category: {str(e)}")
    finally:
        conn.close()


# =====================
# Delete SubCategory (Admin only)
# =====================
@router.delete("/sub/delete/{sub_category_id}")
def delete_subcategory(sub_category_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        if user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")

        # Check if subcategory exists
        cursor.execute("SELECT id FROM sub_categories WHERE id=%s", (sub_category_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Subcategory not found")

        # Check if subcategory has products
        cursor.execute("SELECT id FROM products WHERE sub_category_id=%s", (sub_category_id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Cannot delete subcategory with existing products")

        # Delete the subcategory
        cursor.execute("DELETE FROM sub_categories WHERE id=%s", (sub_category_id,))
        conn.commit()
        return {"message": f"Subcategory id {sub_category_id} deleted successfully"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting subcategory: {str(e)}")
    finally:
        conn.close()


# =====================
# Fetch All Categories with Nested Subcategories
# =====================
@router.get("/all")
def get_all_categories():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Fetch categories
        cursor.execute("SELECT * FROM categories ORDER BY id ASC")
        categories = cursor.fetchall()

        # Fetch subcategories for each category
        for category in categories:
            cursor.execute("""
                SELECT * FROM sub_categories WHERE category_id = %s ORDER BY id ASC
            """, (category["id"],))
            category["subcategories"] = cursor.fetchall()
            
        return {"categories": categories, "count": len(categories)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")
    finally:
        conn.close()




# ====================
# Carousel Slides
# ====================
@router.get("/carousel")
def get_carousel_slides():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Fetch subcategories with their parent category name
        cursor.execute("""
            SELECT 
                s.id,
                s.image_url,
                s.name as sub_category_name
            FROM sub_categories s
        """)
        slides = cursor.fetchall()
        return {"slides": slides, "count": len(slides)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# random categories
@router.get("/home-sections")
def get_home_sections(limit_subcats: int = 15, products_per_subcat: int = 10):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # 1️⃣ Pick random subcategories
        cursor.execute(f"""
            SELECT s.*, c.name AS category_name,c.banner_url,c.id as category_id
            FROM sub_categories s
            JOIN categories c ON s.category_id = c.id
            ORDER BY RAND() 
            LIMIT %s
        """, (limit_subcats,))
        subcats = cursor.fetchall()

        # 2️⃣ Attach limited products to each subcategory
        for sub in subcats:
            cursor.execute("""
                SELECT id as product_id, name as product_name, price, stock, image_url
                FROM products
                WHERE sub_category_id = %s
                ORDER BY RAND() 
                LIMIT %s
            """, (sub["id"], products_per_subcat))
            sub["products"] = cursor.fetchall()

        return {"sections": subcats}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating home sections: {str(e)}")
    finally:
        conn.close()



# 
@router.get("/subcategories/{category_id}")
def get_subcategories_by_category(category_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Ensure category exists
        cursor.execute("SELECT id,banner_url FROM categories WHERE id = %s", (category_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Category not found")

        # Fetch subcategories
        cursor.execute("""
        SELECT sc.*, c.banner_url
        FROM sub_categories sc
        JOIN categories c ON sc.category_id = c.id
        WHERE sc.category_id = %s
        ORDER BY sc.id ASC
        """, (category_id,))
        subcategories = cursor.fetchall()
        return {"subcategories": subcategories, "count": len(subcategories)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching subcategories: {str(e)}")
    finally:
        conn.close()




