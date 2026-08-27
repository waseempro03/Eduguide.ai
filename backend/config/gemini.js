import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

let genAIInstance = null;

export function isGeminiConfigured() {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 10 && !key.includes('your_gemini_api_key_here') && !key.includes('placeholder'));
}

export function getGeminiClient() {
  if (!isGeminiConfigured()) {
    return null;
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY.trim() });
  }
  return genAIInstance;
}
