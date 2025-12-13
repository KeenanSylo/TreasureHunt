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
    
    def _generate_fallback_estimate(self, listed_price: float, category: str) -> float:
        """Generate a reasonable fallback price estimate based on category"""
        if category == 'fashion':
            # Fashion items typically resell for 30-70% of retail, assume 40% markup for used
            return round(listed_price * 1.4, 2)
        elif category == 'electronics':
            # Electronics depreciate, assume modest 20% markup
            return round(listed_price * 1.2, 2)
        elif category == 'collectibles':
            # Collectibles can vary widely, assume 50% markup
            return round(listed_price * 1.5, 2)
        else:
            # General items, assume 30% markup
            return round(listed_price * 1.3, 2)
    
    def _detect_category(self, title: str) -> str:
        """Detect item category from title"""
        title_lower = title.lower()
        
        # Fashion/Clothing keywords
        fashion_keywords = ['shirt', 't-shirt', 'tshirt', 'dress', 'jeans', 'pants', 'jacket', 
                           'coat', 'sweater', 'hoodie', 'shoes', 'sneakers', 'boots', 'bag', 
                           'handbag', 'purse', 'shorts', 'skirt', 'top', 'blouse', 'cardigan',
                           'sweatshirt', 'polo', 'tank', 'camisole', 'leggings', 'tracksuit']
        
        # Electronics/Tech keywords
        tech_keywords = ['camera', 'lens', 'phone', 'laptop', 'computer', 'console', 'iphone',
                        'ipad', 'macbook', 'xbox', 'playstation', 'nintendo', 'tablet']
        
        # Collectibles/Vintage keywords
        collectible_keywords = ['vintage', 'antique', 'rare', 'limited edition', 'signed',
                               'collectible', 'memorabilia', 'watch', 'rolex', 'omega']
        
        if any(keyword in title_lower for keyword in fashion_keywords):
            return 'fashion'
        elif any(keyword in title_lower for keyword in tech_keywords):
            return 'electronics'
        elif any(keyword in title_lower for keyword in collectible_keywords):
            return 'collectibles'
        else:
            return 'general'
    
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
        
        # Detect category and build specialized prompt
        category = self._detect_category(vague_title)
        
        if category == 'fashion':
            prompt = f"""
You are an expert FASHION and CLOTHING appraiser specializing in designer brands, vintage fashion, and high-value garments.

The seller listed this item as: "{vague_title}"

As a fashion expert, analyze this clothing/accessory item:

1. BRAND IDENTIFICATION: Identify the brand/designer (H&M, Zara, Gucci, Prada, Supreme, Nike, Adidas, etc.)
2. ITEM TYPE: Specific garment type (e.g., "Oversized Graphic T-Shirt", "Leather Bomber Jacket")
3. CONDITION ASSESSMENT: Estimate condition from description
4. MARKET VALUE: Research typical resale prices for this brand/item

HIGH-VALUE FASHION INDICATORS (return high confidence):
- Designer brands: Gucci, Prada, Louis Vuitton, Chanel, Dior, Balenciaga
- Streetwear: Supreme, Off-White, Bape, Palace, Stussy
- Athletic: Nike Limited Editions, Yeezy, Jordan, Rare Adidas
- Vintage: 90s/00s designer, rare band tees, vintage denim

Return JSON:
{{
    "title_real": "Brand + Specific Item Description",
    "price_estimated": [resale value in USD],
    "confidence": "high/medium/low",
    "reasoning": "Brand analysis and market value explanation"
}}

Confidence Guidelines for Fashion:
- HIGH: Designer/streetwear brands, rare items, clear brand identification
- MEDIUM: Popular fast fashion brands in good condition, recognizable styles
- LOW: Unknown brands, generic items, poor condition descriptions
"""
        else:
            # Original prompt for electronics/collectibles
            prompt = f"""
You are an expert product appraiser specializing in electronics, collectibles, and vintage items.

The seller listed this item as: "{vague_title}"

Analyze if this is the actual product type (not accessories, cards, or related items).

For valid items, identify:
1. Specific model/brand
2. Estimated used market value in USD
3. Confidence level (high/medium/low)
4. Key identifying features

Return JSON:
{{
    "title_real": "Specific Model Name",
    "price_estimated": 1200.00,
    "confidence": "high",
    "reasoning": "Brief explanation"
}}
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
            
            # Ensure we have a price estimate
            price_estimated = float(analysis.get("price_estimated", 0))
            if price_estimated == 0:
                # If AI didn't provide estimate, generate fallback
                category = self._detect_category(vague_title)
                # Assume a reasonable base price if not available
                price_estimated = self._generate_fallback_estimate(50.0, category)
            
            return {
                "title_real": analysis.get("title_real", "Unable to identify"),
                "price_estimated": price_estimated,
                "confidence": analysis.get("confidence", "low"),
                "reasoning": analysis.get("reasoning", "")
            }
        
        except Exception as e:
            print(f"AI Analysis Error: {str(e)}")
            # Return fallback estimate on error
            category = self._detect_category(vague_title)
            return {
                "title_real": vague_title,
                "price_estimated": self._generate_fallback_estimate(50.0, category),
                "confidence": "low",
                "reasoning": f"Analysis failed: {str(e)}"
            }
    
    async def analyze_item_with_images(
        self,
        image_urls: List[str],
        vague_title: str,
        listed_price: float = 0.0
    ) -> Dict:
        """
        Enhanced version that downloads and analyzes actual images
        This is the production-ready version
        """
        import httpx
        
        category = self._detect_category(vague_title)
        
        if category == 'fashion':
            prompt = f"""
You are an expert FASHION APPRAISER with deep knowledge of designer brands, streetwear, vintage clothing, and luxury accessories.

The seller listed this item as: "{vague_title}"

Look at the images carefully and identify:

1. BRAND/DESIGNER: Look for logos, tags, labels, or distinctive brand features
   - Luxury: Gucci, Prada, LV, Chanel, Dior, Balenciaga, Saint Laurent
   - Streetwear: Supreme, Off-White, Bape, Palace, Stussy, Anti Social Social Club
   - Athletic: Nike (Jordan, Dunk, Air Max), Adidas (Yeezy, Ultra Boost), New Balance
   - Popular: Zara, H&M, Uniqlo, ASOS, Urban Outfitters, Free People

2. CONDITION: Assess from images
   - New with Tags / Like New → Higher value
   - Gently Used / Good → Standard value  
   - Worn / Fair → Lower value

3. ITEM SPECIFICS: Type, color, size (if visible), style

4. MARKET VALUE: Estimate resale value based on:
   - Brand prestige and demand
   - Item rarity and desirability  
   - Condition assessment
   - Current fashion trends

VALUATION GUIDELINES:
- Luxury designer: $100-$5000+ (high confidence if logo/tags visible)
- Hyped streetwear: $50-$500+ (high confidence for Supreme, Off-White, etc.)
- Premium athletic: $80-$300+ (medium-high for Jordan, Yeezy)
- Fast fashion (good condition): $10-$50 (medium confidence)
- Generic brands: $5-$30 (medium-low confidence)

CRITICAL: ALWAYS provide a price_estimated value. If you cannot determine exact value, provide a reasonable range-based estimate.
For unknown/generic items, estimate $15-30 based on typical secondhand clothing prices.

Return JSON:
{{
    "title_real": "[Brand] [Item Type] [Key Features]",
    "price_estimated": [typical resale value],
    "confidence": "high/medium/low",
    "reasoning": "Identified [brand] from [visible features]. Condition appears [assessment]. Typical resale value: $[range]"
}}

Confidence Levels:
- HIGH (70-95%): Clear brand identification, visible logos/tags, recognizable designer/streetwear
- MEDIUM (50-70%): Recognizable style or popular brand, decent condition
- LOW (<50%): Generic/unbranded, poor condition, unclear images
"""
        else:
            # Original prompt for electronics/collectibles
            prompt = f"""
You are an expert appraiser for electronics, collectibles, and vintage items.

The seller listed this item as: "{vague_title}"

Look at the images to verify this is the actual product (not cards, accessories, or memorabilia).

If valid, identify the specific model/brand and estimate market value.

Return JSON:
{{
    "title_real": "Specific Model Name",
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
            
            # Ensure we have a price estimate
            price_estimated = float(analysis.get("price_estimated", 0))
            if price_estimated == 0:
                # Use fallback based on listed price or category
                category = self._detect_category(vague_title)
                base_price = listed_price if listed_price > 0 else 50.0
                price_estimated = self._generate_fallback_estimate(base_price, category)
            
            return {
                "title_real": analysis.get("title_real", vague_title),
                "price_estimated": price_estimated,
                "confidence": analysis.get("confidence", "low"),
                "reasoning": analysis.get("reasoning", "")
            }
        
        except Exception as e:
            print(f"AI Analysis Error: {str(e)}")
            # Use fallback estimate on error
            category = self._detect_category(vague_title)
            base_price = listed_price if listed_price > 0 else 50.0
            return {
                "title_real": vague_title,
                "price_estimated": self._generate_fallback_estimate(base_price, category),
                "confidence": "low",
                "reasoning": f"Analysis failed: {str(e)}"
            }


    async def analyze_bundle(
        self,
        image_urls: List[str],
        bundle_title: str,
        listed_price: float = 0.0,
        search_category: str = ""
    ) -> Dict:
        """
        BUNDLE BREAKER: Analyze a job lot/bundle to identify hidden valuable items
        
        Args:
            image_urls: List of image URLs showing the bundle
            bundle_title: Seller's listing title
            listed_price: Current listing price
            search_category: Original search query (e.g., "Camera")
        
        Returns:
            Dict with main_item, hidden_gems, and estimated_breakup_value
        """
        prompt = f"""
You are an EXPERT APPRAISER specializing in analyzing JOB LOTS, BUNDLES, and COLLECTIONS of used items.

The seller listed this bundle as: "{bundle_title}"
Listed price: ${listed_price}
Search category: "{search_category}"

Your mission: Find valuable items HIDDEN in this pile that the seller may have overlooked or undervalued.

ANALYZE THE IMAGES:

1. IDENTIFY DISTINCT ITEMS:
   - Look for individual items in the pile/collection
   - Count how many separate pieces you can see
   - Focus on items related to: {search_category}

2. FIND HIDDEN GEMS (High-Value Items):
   - Camera bundles: Look for specific LENSES (Canon L-series, Nikon Gold Ring, Zeiss), camera BODIES (model numbers), FILTERS, professional accessories
   - Electronics: Specific model numbers, brand names, vintage items
   - Fashion: Designer labels, brand tags, luxury items
   - Collectibles: Rare items, vintage pieces, signed items
   - Tools: Professional-grade brands (Snap-on, Mac Tools, Festool)
   - Video games: Specific valuable titles, limited editions, sealed items

3. IGNORE GENERIC FILLER:
   - Don't value generic cables, common accessories, broken items
   - Focus on items that have resale value

4. ESTIMATE BREAKUP VALUE:
   - Research typical resale prices for EACH valuable item you identify
   - Add up individual values: Item 1 ($X) + Item 2 ($Y) + Item 3 ($Z) = Total
   - Be realistic but optimistic - we're looking for deals where breakup > listing price

EXAMPLE OUTPUT for Camera Bundle:
{{
    "main_item": "Canon EOS Camera Bundle with Lenses",
    "hidden_gems": [
        "Canon EF 24-70mm f/2.8L II USM Lens (Worth $1,400)",
        "Canon EF 70-200mm f/4L USM Lens (Worth $600)",
        "Canon 50mm f/1.8 STM Lens (Worth $125)",
        "Hoya UV Filter 77mm (Worth $30)"
    ],
    "estimated_breakup_value": 2155.00,
    "confidence": "high",
    "reasoning": "Identified 2 professional L-series Canon lenses in excellent condition based on red ring markings visible in photos. These alone are worth $2,000+. Listed bundle price of $400 represents 5x profit potential."
}}

CRITICAL RULES:
- ALWAYS return a valid JSON object
- hidden_gems must be a LIST of STRINGS describing specific valuable items with estimated values
- estimated_breakup_value should be the SUM of all individual item values
- If you can't identify valuable items, return breakup value = 0 and empty hidden_gems list
- Focus on SPECIFIC identifiable items, not generic descriptions

Return JSON:
{{
    "main_item": "Brief description of the bundle",
    "hidden_gems": ["Specific Item 1 (Worth $X)", "Specific Item 2 (Worth $Y)"],
    "estimated_breakup_value": [total value if sold separately],
    "confidence": "high/medium/low",
    "reasoning": "Explain what valuable items you found and why this is/isn't a good deal"
}}
"""
        
        try:
            import httpx
            
            # Download images
            image_parts = []
            async with httpx.AsyncClient() as client:
                for url in image_urls[:5]:  # Analyze up to 5 images for bundles
                    try:
                        response = await client.get(url, timeout=5.0)
                        if response.status_code == 200:
                            image_parts.append({
                                'mime_type': response.headers.get('content-type', 'image/jpeg'),
                                'data': response.content
                            })
                    except Exception as e:
                        print(f"Failed to download bundle image {url}: {e}")
                        continue
            
            if not image_parts:
                return {
                    "main_item": bundle_title,
                    "hidden_gems": [],
                    "estimated_breakup_value": 0.0,
                    "confidence": "low",
                    "reasoning": "No images available for bundle analysis"
                }
            
            # Generate content with images
            response = self.model.generate_content([prompt] + image_parts)
            response_text = response.text.strip()
            
            # Extract JSON
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            analysis = json.loads(response_text)
            
            # Ensure we have required fields
            return {
                "main_item": analysis.get("main_item", bundle_title),
                "hidden_gems": analysis.get("hidden_gems", []),
                "estimated_breakup_value": float(analysis.get("estimated_breakup_value", 0)),
                "confidence": analysis.get("confidence", "low"),
                "reasoning": analysis.get("reasoning", "")
            }
        
        except Exception as e:
            print(f"Bundle AI Analysis Error: {str(e)}")
            return {
                "main_item": bundle_title,
                "hidden_gems": [],
                "estimated_breakup_value": 0.0,
                "confidence": "low",
                "reasoning": f"Bundle analysis failed: {str(e)}"
            }


# Singleton instance
ai_service = AIService()
