"use client";

import { API_OCR } from "./api";

const API = API_OCR;

export const uploadImage = async (file: File) => {
  try {
    const apiUrl = `${API}/analyze-invoice/`;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const getTaskStatus = async (taskId: string) => {
  try {
    const apiUrl = `${API}/task-status/${taskId}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data; // Returns { status, result }
  } catch (error) {
    console.error("Error fetching task status:", error);
    throw error;
  }
};
