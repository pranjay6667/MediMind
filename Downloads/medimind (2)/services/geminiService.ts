import { GoogleGenAI, Part } from "@google/genai";
import { Medicine } from '../types';

// Helper to get AI instance safely
const getAIClient = (): GoogleGenAI | null => {
    // Guidelines require API key to be obtained exclusively from process.env.API_KEY
    if (!process.env.API_KEY) {
        console.warn("API_KEY not found in process.env");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeInteractions = async (medicines: Medicine[]): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable: API Key not found. Please check your configuration.";
  
  if (medicines.length < 2) {
    return "Please add at least two medicines to check for interactions.";
  }

  const medList = medicines.map(m => `${m.name} (${m.dosage})`).join(', ');
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I am taking the following medicines: ${medList}. 
      Analyze this list for any potential drug interactions, side effects warnings, or dietary restrictions I should be aware of. 
      Keep the response concise, friendly, and structured in markdown. Warning: Always advise consulting a doctor.`,
    });
    
    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't analyze your medicines at the moment. Please try again later.";
  }
};

export const chatWithHealthBot = async (
  history: { role: 'user' | 'model', text: string }[], 
  message: string, 
  contextData: string
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Service Unavailable: API Key not found.";

  try {
    // Convert simplified history to SDK format
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }] as Part[],
    }));

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: formattedHistory,
        config: {
            systemInstruction: `You are MediMind AI, a specialized medical adherence assistant.
            
            Current User Context:
            ${contextData}

            Your capabilities:
            1. Analyze adherence patterns (praise consistency, ask about missed doses).
            2. Explain medication purposes, side effects, and best practices (e.g., "take with food").
            3. Check for interactions between the user's current medicines.
            4. Provide general health tips relevant to their medication schedule.

            Guidelines:
            - Be empathetic, encouraging, and concise.
            - Format output with Markdown (bolding key points, lists).
            - STRICT SAFETY: Do NOT provide medical diagnoses or change prescriptions. Always advise consulting a healthcare professional for symptoms or dosage changes.
            - If asked about adherence, look at the context provided regarding taken/skipped logs.
            `
        }
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I didn't quite catch that.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to the health server. Please check your internet connection.";
  }
};

export const scanPrescription = async (imageBase64: string): Promise<Partial<Medicine>[]> => {
  const ai = getAIClient();
  if (!ai) {
    console.error("API Key missing for vision");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64
          }
        },
        {
          text: `You are an expert pharmacist AI assistant. Analyze this image (which may be a handwritten prescription, a medicine bottle label, or a pill box) and extract medication details.

          Extract the following fields for each medicine found:
          1. name: The brand or generic name (string).
          2. dosage: Strength (e.g., "10mg", "500 mg").
          3. frequency: Must be strictly one of these exact strings: "Daily", "Weekly", "As Needed". If it says "QD", "BID", "TID", map to "Daily".
          4. time: Best estimate time in HH:mm (24hr) format. 
             - Morning/Breakfast -> "08:00"
             - Noon/Lunch -> "13:00"
             - Evening/Dinner -> "19:00"
             - Bedtime -> "22:00"
             - Default to "08:00" if unknown.
          5. notes: Short instructions (e.g., "Take with food", "May cause drowsiness").

          Return ONLY a valid JSON array of objects. Do not include markdown code blocks like \`\`\`json. Just the raw JSON.`
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return [];
    
    // Clean up potential markdown formatting just in case
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return [];
  }
};