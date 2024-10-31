import { Readability } from "readabilitySAX";
import { saxParser } from "./lib/saxParser.js";
import TurndownService from "turndown";
import { encode } from "gpt-tokenizer";

const readability = new Readability();


async function analyzeContent() {
  // Get main article content
  const readable = new Readability();
  readable.setSkipLevel(0);
  saxParser(document.childNodes[document.childNodes.length - 1], readable);
  const fullArticle = readable.getArticle("text").text;

  // Split into paragraphs and filter empty ones
  const paragraphs = fullArticle
    .split(/\n\s*\n/)
    .filter((para) => para.trim().length > 0);

  // Process each paragraph, keeping track of total tokens
  const MAX_TOKENS = 3000;
  let totalTokens = 0;
  let processedParagraphs = [];

  for (const para of paragraphs) {
    const paraTokens = encode(para);
    if (totalTokens + paraTokens.length <= MAX_TOKENS) {
      processedParagraphs.push(para);
      totalTokens += paraTokens.length;
    } else {
      break; // Stop if we would exceed token limit
    }
  }

  try {
    const capabilities = await ai.languageModel.capabilities();

    if (capabilities.available !== "no") {
      const session = await ai.languageModel.create({
        systemPrompt: `
        Your role is breaking down text into key subtexts. You receive a paragraph as input and return JSON array.

        First example:
        input: "Global warming continues to threaten our planet. Rising sea levels and extreme weather events are clear signs of climate change. Scientists emphasize the urgent need for renewable energy solutions and stricter emissions controls. Solar and wind power adoption is growing, but greenhouse gas emissions remain a major concern."
        output: '["Environmental Threat","Observable Evidence","Scientific Urgency","Renewable Energy Solutions","Ongoing Challenges"]'
        
        Second example:
        input: "Machine learning algorithms are revolutionizing business operations. Companies are using AI to automate tasks and analyze large datasets. However, concerns about data privacy and algorithmic bias remain major challenges that need to be addressed."
        output: '["Technological Revolution","Business Transformation","Automation and Analytics","Ethical Challenges","Data Privacy Concerns"]

        Classify the following paragraph, ONLY PICK THE TWO MOST RELEVANT KEYWORDS:
      `,
      });

      // Process paragraphs sequentially
      const results = [];
      for (const para of processedParagraphs) {
        try {
          const result = await session.prompt(para);
          results.push(result);
        } catch (error) {
          console.error("Failed to process paragraph :", error);
          continue;
        }
      }

      try {
        // Combine and flatten all results
        const allCategories = new Set(
          results
            .flatMap((result, index) => {
              try {
                return JSON.parse(result);
              } catch (error) {
                console.error("Failed to parse result:", {
                  index,
                  result,
                  error: error.message,
                });
                return [];
              }
            })
            .flat(),
        );

        console.log("Analysis Result:", JSON.stringify(allCategories, null, 2));
        return Array.from(allCategories);
      } catch (e) {
        console.error("Failed to parse AI response:", e);
        return null;
      }
    }
  } catch (e) {
    console.error("AI analysis failed:", e);
    return null;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyze") {
    analyzeContent().then((results) => {
      sendResponse({ success: true, results });
    });
    return true;
  } else if (request.action === "reset") {
    location.reload();
    sendResponse({ success: true });
  }
});
