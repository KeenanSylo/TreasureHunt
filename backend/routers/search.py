"""
Search Router - Handle search requests with caching
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict
import asyncio

from services.ebay import ebay_service
from services.ai import ai_service
from services.cache import cache_service

router = APIRouter()


@router.get("/search")
async def search_items(
    q: str = Query(..., description="Search query"),
    max_price: int = Query(100, description="Maximum price filter")
) -> Dict:
    """
    Search for undervalued items using eBay and AI analysis
    
    Flow:
    1. Check cache for existing results
    2. If cache miss, search eBay for items
    3. Analyze top items with AI
    4. Cache results for 24 hours
    5. Return merged data
    """
    try:
        # 1. Check cache
        cache_key = cache_service.build_search_key(q, max_price)
        cached_result = await cache_service.get(cache_key)
        
        if cached_result:
            return {
                "query": q,
                "max_price": max_price,
                "cached": True,
                "results": cached_result
            }
        
        # 2. Search eBay
        ebay_items = await ebay_service.search_items(
            query=q,
            max_price=max_price,
            limit=10
        )
        
        if not ebay_items:
            return {
                "query": q,
                "max_price": max_price,
                "cached": False,
                "results": []
            }
        
        # 3. AI Analysis on top 3 items with images
        analyzed_items = []
        
        # Create analysis tasks for items with images
        analysis_tasks = []
        for item in ebay_items[:3]:
            if item.get("image_url"):
                task = analyze_item_async(item)
                analysis_tasks.append(task)
            else:
                # Skip items without images
                analyzed_items.append({
                    **item,
                    "title_real": item["title_vague"],
                    "price_estimated": 0.0,
                    "profit_potential": 0.0,
                    "confidence": "low",
                    "reasoning": "No image available for analysis"
                })
        
        # Run AI analysis in parallel
        if analysis_tasks:
            analyzed_results = await asyncio.gather(*analysis_tasks, return_exceptions=True)
            
            for result in analyzed_results:
                if isinstance(result, Exception):
                    print(f"Analysis error: {result}")
                elif result:
                    analyzed_items.append(result)
        
        # Add remaining items without AI analysis
        for item in ebay_items[len(analyzed_items):]:
            analyzed_items.append({
                **item,
                "title_real": item["title_vague"],
                "price_estimated": 0.0,
                "profit_potential": 0.0,
                "confidence": "low",
                "reasoning": "Not analyzed"
            })
        
        # 4. Cache results
        await cache_service.set(cache_key, analyzed_items, ttl=86400)
        
        # 5. Return results
        return {
            "query": q,
            "max_price": max_price,
            "cached": False,
            "results": analyzed_items
        }
    
    except Exception as e:
        print(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


async def analyze_item_async(item: Dict) -> Dict:
    """
    Analyze a single item with AI
    
    Args:
        item: eBay item data
    
    Returns:
        Item with AI analysis merged in
    """
    try:
        # Get AI analysis
        image_urls = [item["image_url"]] if item.get("image_url") else []
        
        analysis = await ai_service.analyze_item_with_images(
            image_urls=image_urls,
            vague_title=item["title_vague"]
        )
        
        # Calculate profit potential
        price_listed = item.get("price_listed", 0) or 0
        price_estimated = analysis.get("price_estimated", 0) or 0
        profit_potential = price_estimated - price_listed
        
        # Merge item and analysis
        return {
            **item,
            "title_real": analysis.get("title_real"),
            "price_estimated": price_estimated,
            "profit_potential": profit_potential,
            "confidence": analysis.get("confidence"),
            "reasoning": analysis.get("reasoning")
        }
    
    except Exception as e:
        print(f"Item analysis error: {str(e)}")
        # Return item with no analysis on error
        return {
            **item,
            "title_real": item["title_vague"],
            "price_estimated": 0.0,
            "profit_potential": 0.0,
            "confidence": "low",
            "reasoning": f"Analysis failed: {str(e)}"
        }
