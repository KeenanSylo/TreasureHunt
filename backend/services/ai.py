"""
AI Service - Gemini Vision Integration
Analyzes product images to identify specific models and estimate value
"""

import os
import google.generativeai as genai
from typing import List, Dict, Optional
import json


class AIService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        genai.configure(api_key=api_key)
        # Use Gemini 2.5 Flash - latest and most capable
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
    
    async def analyze_item(
        self,
        image_urls: List[str],
        vague_title: str
    ) -> Dict:
        """
        Analyze product images to identify specific model and estimate value
        
        Args:
            image_urls: List of image URLs (max 3)
            vague_title: The seller's original title
        
        Returns:
            Dict with identified model, estimated value, and confidence
        """
        # Limit to top 3 images
        image_urls = image_urls[:3]
        
        # Build prompt
        prompt = f"""
You are an expert product appraiser specializing in identifying specific models of secondhand items.

The seller listed this item as: "{vague_title}"

CRITICAL: First determine if this item actually IS the product type suggested by the listing title.
For example:
- If searching for "camera", REJECT items like trading cards, movies, or books that merely contain the word "camera"
- If searching for "guitar", REJECT guitar picks, strings, or instruction books
- If searching for "watch", REJECT watch bands, batteries, or display cases

Only analyze items that are ACTUALLY the main product category being searched for.

If the item matches the category, provide:
1. The specific model/brand identification (be as precise as possible)
2. The estimated used market value in USD
3. Your confidence level (high/medium/low)
4. A brief explanation of key identifying features

If the item does NOT match the expected category, return:
{{
    "title_real": "Not a [category] - [what it actually is]",
    "price_estimated": 0.00,
    "confidence": "low",
    "reasoning": "This is not actually a [category], it's [actual item type]"
}}

For valid items, return:
{{
    "title_real": "Specific Model Name",
    "price_estimated": 1200.00,
    "confidence": "high",
    "reasoning": "Brief explanation of identification and valuation"
}}

Be conservative with valuations. Only return high confidence if you're certain of the model.
"""
        
        try:
            # For now, use text-only analysis since we need to handle image URLs
            # In production, you'd download images and pass them directly
            # This is a simplified version using text prompt only
            response = self.model.generate_content(prompt)
            
            # Parse JSON from response
            response_text = response.text.strip()
            
            # Extract JSON from markdown code blocks if present
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            analysis = json.loads(response_text)
            
            return {
                "title_real": analysis.get("title_real", "Unable to identify"),
                "price_estimated": float(analysis.get("price_estimated", 0)),
                "confidence": analysis.get("confidence", "low"),
                "reasoning": analysis.get("reasoning", "")
            }
        
        except Exception as e:
            print(f"AI Analysis Error: {str(e)}")
            # Return safe defaults on error
            return {
                "title_real": vague_title,
                "price_estimated": 0.0,
                "confidence": "low",
                "reasoning": f"Analysis failed: {str(e)}"
            }
    
    async def analyze_item_with_images(
        self,
        image_urls: List[str],
        vague_title: str
    ) -> Dict:
        """
        Enhanced version that downloads and analyzes actual images
        This is the production-ready version
        """
        import httpx
        
        prompt = f"""
You are an expert product appraiser specializing in identifying specific models of secondhand items.

The seller listed this item as: "{vague_title}"

CRITICAL INSTRUCTION: Look at the images and determine if this item actually IS the product type suggested by the title.

Common mismatches to REJECT:
- Trading cards, movies, books, or memorabilia that contain product keywords
- Accessories, parts, or related items that are NOT the main product
- Collectibles featuring the product name but not the actual product

Examples:
- "Lights Camera Action" trading cards → NOT a camera, REJECT
- Guitar pick variety pack → NOT a guitar, REJECT  
- Watch battery → NOT a watch, REJECT
- Camera lens cleaning kit → NOT a camera, REJECT

If the image shows the item does NOT match the expected product category:
{{
    "title_real": "Not a [category] - [what it actually is]",
    "price_estimated": 0.00,
    "confidence": "low",
    "reasoning": "Image shows this is [actual item type], not [expected category]"
}}

If the image confirms it IS the correct product type, analyze carefully:
1. The specific model/brand identification (be as precise as possible)
2. The estimated used market value in USD (be conservative)
3. Your confidence level (high/medium/low)
4. Key identifying features you observed

Return ONLY valid JSON:
{{
    "title_real": "Exact Model Name",
    "price_estimated": 1200.00,
    "confidence": "high",
    "reasoning": "Brief explanation"
}}
"""
        
        try:
            # Download images
            image_parts = []
            async with httpx.AsyncClient() as client:
                for url in image_urls[:3]:
                    try:
                        response = await client.get(url, timeout=5.0)
                        if response.status_code == 200:
                            image_parts.append({
                                'mime_type': response.headers.get('content-type', 'image/jpeg'),
                                'data': response.content
                            })
                    except Exception as e:
                        print(f"Failed to download image {url}: {e}")
                        continue
            
            if not image_parts:
                # Fallback to text-only if no images downloaded
                return await self.analyze_item(image_urls, vague_title)
            
            # Generate content with images
            response = self.model.generate_content([prompt] + image_parts)
            response_text = response.text.strip()
            
            # Extract JSON
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            analysis = json.loads(response_text)
            
            return {
                "title_real": analysis.get("title_real", vague_title),
                "price_estimated": float(analysis.get("price_estimated", 0)),
                "confidence": analysis.get("confidence", "low"),
                "reasoning": analysis.get("reasoning", "")
            }
        
        except Exception as e:
            print(f"AI Analysis Error: {str(e)}")
            return {
                "title_real": vague_title,
                "price_estimated": 0.0,
                "confidence": "low",
                "reasoning": f"Analysis failed: {str(e)}"
            }


# Singleton instance
ai_service = AIService()
