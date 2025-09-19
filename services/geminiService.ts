import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import type { AuditReport } from '../types';

if (!process.env.API_KEY) {
  // In a real production app, you'd want to handle this more gracefully.
  // For this context, we assume the environment variable is set.
  console.warn("API_KEY environment variable not set. Using a placeholder. The app will not function correctly.");
  process.env.API_KEY = "YOUR_API_KEY_HERE";
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        findings: {
            type: Type.ARRAY,
            description: "A list of security vulnerabilities or informational findings found in the smart contract.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "A concise title for the finding.",
                    },
                    severity: {
                        type: Type.STRING,
                        description: "The severity level of the finding.",
                        enum: ['Critical', 'High', 'Medium', 'Low', 'Informational', 'Gas Optimization']
                    },
                    description: {
                        type: Type.STRING,
                        description: "A detailed explanation of the vulnerability, including where it occurs in the code.",
                    },
                    recommendation: {
                        type: Type.STRING,
                        description: "Actionable steps to fix the vulnerability.",
                    },
                },
                required: ['title', 'severity', 'description', 'recommendation']
            }
        }
    },
    required: ['findings']
};


export const auditContract = async (contractCode: string): Promise<AuditReport> => {
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contractCode,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.2, // Lower temperature for more deterministic security analysis
        },
    });

    // Proactively check for content blocking
    const blockReason = response.promptFeedback?.blockReason;
    if (blockReason) {
        throw new Error(`Request was blocked by the API due to: ${blockReason}. Please adjust your contract code or safety settings.`);
    }

    const jsonText = response.text?.trim();

    if (!jsonText) {
       throw new Error("The AI returned an empty response. This could be due to a content filter or a temporary API issue. Please try again.");
    }
    
    let parsedJson;
    try {
        parsedJson = JSON.parse(jsonText);
    } catch (parseError) {
        console.error("Failed to parse JSON response:", jsonText);
        throw new Error("The AI returned a response that was not valid JSON. This might be a temporary issue, please try again.");
    }
    
    // Basic validation to ensure the response structure is correct
    if (parsedJson && Array.isArray(parsedJson.findings)) {
      return parsedJson as AuditReport;
    } else {
      throw new Error("The AI returned a JSON object with an unexpected structure. The 'findings' array is missing.");
    }

  } catch (error) {
    console.error("Error during contract audit:", error);
    let userMessage = "An unexpected error occurred. Please check the console for more details.";

    if (error instanceof Error) {
        // Check for specific, common API errors by inspecting the message
        if (error.message.includes('API key not valid')) {
            userMessage = "Authentication failed: The API key is invalid. Please verify your API_KEY environment variable.";
        } else if (error.message.toLowerCase().includes('quota')) {
            userMessage = "API quota exceeded. Please check your usage limits in your Google AI dashboard or wait and try again later.";
        } else if (error.message.includes('blocked by the API')) {
            // Catches the specific error we threw above for block reasons
            userMessage = error.message;
        } else if (error.message.includes('valid JSON')) {
            // Catches error from our JSON parsing check
             userMessage = error.message;
        } else if (error.message.includes('unexpected structure')) {
            // Catches error from our structure validation
            userMessage = error.message;
        } else {
            // For other generic errors (network, server-side issues, etc.)
            userMessage = `An error occurred while communicating with the AI service: ${error.message}`;
        }
    }
    
    throw new Error(userMessage);
  }
};