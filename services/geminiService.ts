import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, GroundingSource } from "../types";

const SYSTEM_INSTRUCTION = `
You are a Senior Cyber Threat Intelligence Analyst at CISA. 
Your specific role is to identify IMMEDIATE, BREAKING threats released or updated in the last 7 days and draft a formal Cybersecurity Advisory.

STRICT RULES:
1. Timeframe: Findings must be from the last 7 days relative to the current date.
2. Severity: CVSS Base Score >= 8.0 (High/Critical).
3. Priority: Active exploitation, Zero-Day, or "in the wild".

OUTPUT FORMAT:
If NO critical vulnerabilities (CVSS >= 8.0) are found in the last 7 days, return exactly this string:
"No critical vulnerabilities with CVSS >= 8.0 were released in the last 7 days."

If critical vulnerabilities ARE found, select the SINGLE most critical one and generate a Technical Security Advisory in this Markdown format:

# CISA CYBERSECURITY ADVISORY
**ID:** CISA-[Year]-UPDATE
**Date:** [Current Date]
**TLP:** CLEAR

## Executive Summary
[Concise, urgent overview]

## Technical Details
*   **CVE ID:** [CVE-XXXX-XXXX]
*   **CVSS Score:** [Score] [Vector]
*   **Affected Products:** [List]
*   **Vulnerability Type:** [Type]

### Impact
[Business and technical impact]

## Mitigations
### Immediate Action
[Official patches]

### Workarounds
[Steps if patches unavailable]

## References
[List references found]
`;

export const runThreatAnalysis = async (): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-3-pro-preview"; 
  
  // Current timestamp for context
  const now = new Date();
  const timestamp = now.toISOString();

  const prompt = `
  Perform a real-time search for cybersecurity threats.
  Current Date and Time: ${timestamp}.
  
  Phase 1: Discovery & Analysis
  Search Sources: CISA Known Exploited Vulnerabilities (KEV) Catalog, NIST NVD, Microsoft Security Update Guide, Cisco Security Advisories, Fortinet PSIRT, Adobe Security Bulletins.
  Filter strictly for entries released or significantly updated in the LAST 7 DAYS.
  
  Phase 2: Advisory Generation
  Follow the system instructions to either state no findings or generate the advisory for the top critical threat.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 2048 } // Allow some budget for reasoning about dates/severity
      },
    });

    const text = response.text || "No response generated.";
    
    // Extract grounding chunks for source links
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Explicitly map and filter with strict typing to match GroundingSource
    const sources: GroundingSource[] = groundingChunks
      .flatMap((chunk: any) => chunk.web ? [chunk.web] : [])
      .filter((web: any): web is GroundingSource => (
        !!web && 
        typeof web.uri === 'string' && 
        typeof web.title === 'string'
      ));

    // Remove duplicates
    const uniqueSources: GroundingSource[] = Array.from(
      new Map(sources.map(item => [item.uri, item])).values()
    );

    const notFoundPhrase = "No critical vulnerabilities with CVSS >= 8.0 were released in the last 7 days";
    const foundCritical = !text.includes(notFoundPhrase);

    return {
      advisoryContent: text,
      foundCritical,
      sources: uniqueSources
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "An unexpected error occurred during analysis.");
  }
};