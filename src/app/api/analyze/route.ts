import { NextRequest, NextResponse } from 'next/server';
import vision from '@google-cloud/vision';

// Initialize Google Vision client
const client = new vision.ImageAnnotatorClient({
  credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS 
    ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : undefined,
  apiKey: process.env.GOOGLE_VISION_API_KEY,
});

interface AnalysisResult {
  real_model: string;
  est_value: number;
  is_undervalued: boolean;
  confidence_score: number;
  labels: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, vagueTitle, listingPrice } = await request.json();

    if (!imageUrl || !vagueTitle) {
      return NextResponse.json(
        { error: 'imageUrl and vagueTitle are required' },
        { status: 400 }
      );
    }

    // Use Google Vision to detect labels and objects
    const [result] = await client.labelDetection(imageUrl);
    const labels = result.labelAnnotations?.map(label => label.description || '') || [];
    
    // Use web detection to find similar images and get context
    const [webDetection] = await client.webDetection(imageUrl);
    const webEntities = webDetection.webDetection?.webEntities || [];
    
    // Extract potential brand/model from web entities
    const brandInfo = webEntities
      .filter(entity => (entity.score || 0) > 0.5)
      .map(entity => entity.description)
      .filter(Boolean)
      .slice(0, 5);

    // Basic AI logic (you can enhance this with OpenAI later)
    const identifiedModel = brandInfo[0] || labels[0] || 'Unknown Item';
    const confidence = Math.round((webEntities[0]?.score || 0.5) * 100);
    
    // Estimate value based on confidence and typical market values
    const estimatedValue = listingPrice 
      ? listingPrice * (1.5 + (confidence / 100))
      : 100;

    const analysis: AnalysisResult = {
      real_model: identifiedModel,
      est_value: Math.round(estimatedValue),
      is_undervalued: estimatedValue > (listingPrice || 0) * 1.2,
      confidence_score: confidence,
      labels: labels.slice(0, 5),
    };

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Google Vision API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image', details: error.message },
      { status: 500 }
    );
  }
}
