
'use server';

/**
 * @fileOverview A Genkit flow that generates a background image for the weather app.
 * 
 * - generateBackground: A function that takes a city and weather description and returns a background image.
 */

import { ai } from '@/ai/genkit';
import { 
    GenerateBackgroundInputSchema, 
    type GenerateBackgroundInput, 
    GenerateBackgroundOutputSchema, 
    type GenerateBackgroundOutput 
} from './schemas';


// This is the exported function that will be called from server actions.
export async function generateBackground(input: GenerateBackgroundInput): Promise<GenerateBackgroundOutput> {
    return generateBackgroundFlow(input);
}


const generateBackgroundFlow = ai.defineFlow(
  {
    name: 'generateBackgroundFlow',
    inputSchema: GenerateBackgroundInputSchema,
    outputSchema: GenerateBackgroundOutputSchema,
  },
  async ({ city, weather, country, adminArea }) => {
    // Map weather codes to descriptive terms for better prompts
    const weatherDescriptions: Record<string, string> = {
      'clear_sky': 'clear blue sky, sunny day',
      'few_clouds': 'partly cloudy sky',
      'scattered_clouds': 'cloudy sky',
      'broken_clouds': 'overcast sky',
      'shower_rain': 'rainy weather with rain showers',
      'rain': 'rainy day with rainfall',
      'thunderstorm': 'dramatic storm with lightning',
      'snow': 'snowy winter scene',
      'mist': 'misty foggy atmosphere',
    };

    const weatherDesc = weatherDescriptions[weather] || weather.replace(/_/g, ' ');
    
    // Create a detailed prompt for better image generation
    // Include country and admin area if available for better accuracy
    const locationString = [city, adminArea, country].filter(Boolean).join(', ');
    const prompt = `A breathtaking panoramic drone view of ${locationString}, capturing a wide aerial cityscape. The sky is ${weatherDesc} and dominates the composition, showcasing the atmospheric conditions. Photorealistic, 8k resolution, cinematic lighting, wide angle lens, high detail.`;
    
    console.log(`🎨 Generating AI image for: "${locationString}" with "${weatherDesc}"`);

    // STRATEGY 1: Hugging Face (if key is configured)
    const hfToken = process.env.HUGGINGFACE_API_KEY;
    
    if (hfToken) {
      try {
        console.log('   Trying Hugging Face API...');
        // Using the correct Router endpoint
        const response = await fetch(
          'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${hfToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                num_inference_steps: 25, // Slightly faster
                guidance_scale: 7.5,
              },
            }),
          }
        );

        if (response.ok) {
          const imageBlob = await response.blob();
          const arrayBuffer = await imageBlob.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64Image = buffer.toString('base64');
          console.log(`✅ Image generated with Hugging Face (${(imageBlob.size / 1024).toFixed(1)}KB)`);
          return { image: `data:image/png;base64,${base64Image}` };
        } else {
          console.log(`⚠️ Hugging Face failed (${response.status}). Falling back to Pollinations.ai...`);
        }
      } catch (error) {
        console.error('⚠️ Hugging Face error:', error);
        console.log('   Falling back to Pollinations.ai...');
      }
    } else {
      console.log('ℹ️  HUGGINGFACE_API_KEY not found. Using Pollinations.ai (Free, No Key needed)...');
    }

    // STRATEGY 2: Pollinations.ai (Robust Fallback - No Key Required)
    try {
      // Pollinations.ai is a free, URL-based generation service
      // We use a random seed to ensure unique images every time
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=720&seed=${seed}&model=flux`;
      
      console.log('   Fetching from Pollinations.ai...');
      
      // We fetch it to verify it works and to potentially cache or process if needed
      // But for now we can just return the URL directly or fetch to base64 to avoid hotlinking issues
      const response = await fetch(imageUrl);
      
      if (response.ok) {
        const imageBlob = await response.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        console.log(`✅ Image generated with Pollinations.ai (${(imageBlob.size / 1024).toFixed(1)}KB)`);
        return { image: `data:image/jpeg;base64,${base64Image}` };
      }
    } catch (error) {
      console.error('❌ Pollinations.ai failed:', error);
    }

    // Final Fallback: Gradient
    console.log('❌ All image generation strategies failed. Using gradient fallback.');
    return { image: '' };
  }
);
