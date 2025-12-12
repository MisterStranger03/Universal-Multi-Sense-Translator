
import { GoogleGenAI } from "@google/genai";
import { ORCHESTRATOR_SYSTEM_PROMPT, PERCEPTION_SIMULATOR_PROMPT } from "../constants";
import { OrchestratorOutput, PerceptionModuleOutput, UserSettings } from "../types";

// Helper to clean JSON string if it comes wrapped in markdown
const cleanJson = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
};

// 1. Perception Layer Simulator
export const runPerceptionSimulation = async (base64Image: string): Promise<PerceptionModuleOutput> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  
  // Clean base64 header if present
  const data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data } },
        { text: PERCEPTION_SIMULATOR_PROMPT }
      ]
    },
    config: {
      responseMimeType: "application/json",
      temperature: 0.2, 
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Perception Simulator");

  try {
    return JSON.parse(cleanJson(text));
  } catch (e) {
    console.error("Failed to parse perception JSON", text);
    throw new Error("Perception parsing failed");
  }
};

// 2. Orchestrator Layer
// Now accepts userSettings to customize the output language/culture
export const runOrchestrator = async (perceptionData: PerceptionModuleOutput, settings: UserSettings): Promise<OrchestratorOutput> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });

  // Inject settings into the input payload
  const inputPayload = {
    ...perceptionData,
    settings: {
      language: settings.targetLanguage,
      context: settings.culturalContext
    }
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [{ text: `INPUT PERCEPTION DATA & SETTINGS: ${JSON.stringify(inputPayload)}` }]
    },
    config: {
      systemInstruction: ORCHESTRATOR_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.4,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Orchestrator");

  try {
    return JSON.parse(cleanJson(text));
  } catch (e) {
    console.error("Failed to parse orchestrator JSON", text);
    throw new Error("Orchestration parsing failed");
  }
};
