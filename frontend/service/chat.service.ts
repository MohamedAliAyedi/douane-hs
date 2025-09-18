"use client";

import { toast } from "react-toastify";
import { API_HS_CODE, API_IMAGE } from "./api";

export interface Message {
  type: string;
  avatar?: string;
  name: string;
  message: string;
  time: string;
}

const API = API_HS_CODE;

/**
 * Sends a message to the API and retrieves the AI response.
 * @param input - User input message.
 * @returns AI response or an error message.
 */
export async function sendMessage(input: string): Promise<Message | null> {
  const apiUrl = `${API}/get_response/`;
  const requestBody = { query: input };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("AI response received:", data.response);

      return {
        type: "ai",
        name: "Douane AI",
        message: data.response || "I'm sorry, I didn't understand that.",
        time: new Date().toLocaleTimeString(),
      };
    } else {
      console.error("Failed to get AI response:", response.statusText);
      return null;
    }
  } catch (error) {
    toast.error("Failed to get AI response.");
    console.error("Error getting AI response:", error);
    return {
      type: "ai",
      name: "Douane AI",
      message: "I'm sorry, I out of service right now!",
      time: new Date().toLocaleTimeString(),
    };
  }
}
/**
 * Sends a FeedBack to the API and retrieves the AI response.
 * @param input - User input message.
 * @returns AI response or an error message.
 */
export async function sendFeedBack(input: string): Promise<boolean> {
  const apiUrl = `${API}/get_response/`;

  const requestBody = { query: input };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("AI response received:", data.response);

      return true;
    } else {
      console.error("Failed to get AI response:", response.statusText);
      return false;
    }
  } catch (error) {
    toast.error("Failed to get AI response.");
    console.error("Error getting AI response:", error);
    return false;
  }
}

/**
 * Sends a message to the API and retrieves the AI response.
 * @param input - User input message.
 * @returns AI response or an error message.
 */

export async function processImage(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const apiUrl = `${API_IMAGE}/process-image`;
    // Replace the URL with your external API endpoint
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
      headers: {
        // If the external API requires specific headers, you can add them here.
        // Remove this if not required.
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to process image. Status: ${response.status}`);
    }

    const data = await response.json();
    return data.caption;
  } catch (error) {
    console.error("Error processing image in service:", error);
    throw new Error("Failed to process the image. Please try again.");
  }
}
