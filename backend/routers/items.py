"""
Items Router - Handle saved items operations
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Dict, Optional
from pydantic import BaseModel

from services.supabase import get_supabase_client

router = APIRouter()


class SaveItemRequest(BaseModel):
    """Request model for saving an item"""
    external_id: str
    title_vague: str
    title_real: Optional[str] = None
    price_listed: Optional[float] = None
    price_estimated: Optional[float] = None
    image_url: Optional[str] = None
    market_url: Optional[str] = None
    marketplace: str = "ebay"


class DeleteItemRequest(BaseModel):
    """Request model for deleting an item"""
    item_id: str


async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """
    Dependency to extract and verify user from JWT token
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        supabase = get_supabase_client()
        
        # Verify token
        user_id = supabase.verify_user(token)
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return user_id
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


@router.post("/items")
async def save_item(
    item: SaveItemRequest,
    user_id: str = Depends(get_current_user)
) -> Dict:
    """
    Save an item to user's watchlist
    
    Requires authentication via Bearer token
    """
    try:
        supabase = get_supabase_client()
        
        # Check if item already exists
        exists = await supabase.check_item_exists(user_id, item.external_id)
        if exists:
            raise HTTPException(
                status_code=409,
                detail="Item already saved"
            )
        
        # Save item
        saved_item = await supabase.save_item(
            user_id=user_id,
            item_data=item.dict()
        )
        
        return {
            "success": True,
            "message": "Item saved successfully",
            "item": saved_item
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Save item error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save item: {str(e)}")


@router.get("/items")
async def get_saved_items(
    user_id: str = Depends(get_current_user)
) -> Dict:
    """
    Get all saved items for authenticated user
    
    Returns items sorted by creation date (newest first)
    """
    try:
        supabase = get_supabase_client()
        items = await supabase.get_user_items(user_id)
        
        return {
            "success": True,
            "count": len(items),
            "items": items
        }
    
    except Exception as e:
        print(f"Get items error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch items: {str(e)}")


@router.delete("/items/{item_id}")
async def delete_item(
    item_id: str,
    user_id: str = Depends(get_current_user)
) -> Dict:
    """
    Delete a saved item
    
    Only allows deletion of user's own items (enforced by RLS)
    """
    try:
        supabase = get_supabase_client()
        success = await supabase.delete_item(user_id, item_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Item not found or already deleted"
            )
        
        return {
            "success": True,
            "message": "Item deleted successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete item error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete item: {str(e)}")


@router.get("/items/check/{external_id}")
async def check_item_saved(
    external_id: str,
    user_id: str = Depends(get_current_user)
) -> Dict:
    """
    Check if an item is already saved by user
    
    Useful for UI to show "saved" state
    """
    try:
        supabase = get_supabase_client()
        exists = await supabase.check_item_exists(user_id, external_id)
        
        return {
            "external_id": external_id,
            "is_saved": exists
        }
    
    except Exception as e:
        print(f"Check item error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to check item: {str(e)}")
