"use client";

import { TreeItem } from "@/components/classification/TreeNode";
import { toast } from "react-toastify";
import { API_HS_CODE } from "./api";

const API = API_HS_CODE;

/**
 * Sends a message to the API and retrieves the AI response.
 * @param input - User input message.
 * @returns AI response or an error message.
 */
export async function getCourtCase(hsCode: string): Promise<string> {
  const apiUrl = `${API}/get_court_case/`;

  const requestBody = { query: hsCode };

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

      return data.response || "I'm sorry, I can't find that case.";
    } else {
      toast.error("Failed to get Court Case response.");
      console.error("Failed to get AI response:", response.statusText);
      return "I'm sorry, I can't find that case.";
    }
  } catch (error) {
    toast.error("Failed to get Court Case response.");
    console.error("Error getting AI response:", error);
    return "I'm sorry, I can't find that case.";
  }
}

export async function getDescription(hsCode: string): Promise<string> {
  const apiUrl = `${API}/get_description/`;
  const requestBody = { query: hsCode };

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

      return data.response || "I'm sorry, I can't find that case.";
    } else {
      toast.error("Failed to get Court Case response.");
      console.error("Failed to get AI response:", response.statusText);
      return "I'm sorry, I can't find that case.";
    }
  } catch (error) {
    toast.error("Failed to get Court Case response.");
    console.error("Error getting AI response:", error);
    return "I'm sorry, I can't find that case.";
  }
}

export interface QueryResponse {
  heading: string;
  related_hs_codes?: string[];
  description?: string;
}

export async function getQuery(hsCode: string): Promise<QueryResponse> {
  const apiUrl = `${API}/query/`;
  const requestBody = { query: hsCode };

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

      return (
        data.response || {
          heading: data.heading || "I'm sorry, I can't find that case.",
          related_hs_codes: data.related_hs_codes || [],
          description: data.description || "",
        }
      );
    } else {
      toast.error("Failed to get Court Case response.");
      console.error("Failed to get AI response:", response.statusText);
      return {
        heading: "I'm sorry, I can't find that case.",
        related_hs_codes: [],
        description: "",
      };
    }
  } catch (error) {
    toast.error("Failed to get Court Case response.");
    console.error("Error getting AI response:", error);
    return {
      heading: "I'm sorry, I can't find that case.",
      related_hs_codes: [],
      description: "",
    };
  }
}

export async function getSimilarProducts(
  word: string
): Promise<TreeItem[] | null> {
  const apiUrl = `${API}/query_words/`;
  const requestBody = { query: word, top_k: 5 };

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
      console.log("AI response received:", data);

      return data || [];
    } else {
      toast.error("Failed to get Court Case response.");
      console.error("Failed to get AI response:", response.statusText);
      return null;
    }
  } catch (error) {
    toast.error("Failed to get Court Case response.");
    console.error("Error getting AI response:", error);
    return null;
  }
}
