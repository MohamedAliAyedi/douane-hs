import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanCourtCastText(input: string): string {
  // Step 1: Remove metadata like 'Document metadata', 'source', and 'page'
  // let cleanedText = input.replace(/Document metadata:.*?Page content:/s, "");

  // Step 2: Remove unnecessary numbers, punctuation, or formatting artifacts
  let cleanedText = input.replace(/[.,;()—–]/g, "");

  // Step 3: Extract and highlight HS codes (pattern: "####.##" or "####.##.##")
  cleanedText = cleanedText.replace(/\b\d{4}(\.\d{2}){1,2}\b/g, (match) => `HS Code: ${match}`);

  // Step 4: Normalize whitespaces (remove extra spaces and newlines)
  cleanedText = cleanedText.replace(/\s+/g, " ").trim();


  return cleanedText; // If relevant lines exist, return them, otherwise the cleaned text.
}