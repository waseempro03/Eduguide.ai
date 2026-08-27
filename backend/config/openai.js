import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

let openaiInstance = null;

export function isOpenAIConfigured() {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && key.trim().length > 10 && !key.includes('your_openai_api_key_here') && !key.includes('placeholder'));
}

export function getOpenAIClient() {
  if (!isOpenAIConfigured()) {
    return null;
  }
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openaiInstance;
}
