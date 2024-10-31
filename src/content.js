import { Readability } from "readabilitySAX";
import { saxParser } from "./lib/saxParser.js";
import TurndownService from "turndown";
import { encode } from "gpt-tokenizer";

let categories = {};
const readability = new Readability();
const colors = [
  "rgba(255, 229, 229, 0.7)",
  "rgba(229, 255, 229, 0.7)",
  "rgba(229, 229, 255, 0.7)",
  "rgba(255, 243, 224, 0.7)",
  "rgba(224, 247, 250, 0.7)",
  "rgba(245, 224, 250, 0.7)",
  "rgba(250, 224, 224, 0.7)",
  "rgba(224, 250, 245, 0.7)",
];

function highlightText() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  );

  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  // Add Levenshtein Distance function
  function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] =
            1 +
            Math.min(
              dp[i - 1][j], // deletion
              dp[i][j - 1], // insertion
              dp[i - 1][j - 1], // substitution
            );
        }
      }
    }
    return dp[m][n];
  }

  textNodes.forEach((textNode) => {
    let text = textNode.nodeValue;
    let words = text.split(/\b/);

    Object.entries(categories).forEach(([category, data]) => {
      data.keywords.forEach((keyword) => {
        words.forEach((word, index) => {
          // Skip empty strings and whitespace
          if (!word.trim()) return;

          // Calculate similarity
          const distance = levenshteinDistance(
            word.toLowerCase(),
            keyword.toLowerCase(),
          );
          const maxLength = Math.max(word.length, keyword.length);
          const similarity = 1 - distance / maxLength;

          // If similarity is above threshold and not yet modified
          if (similarity > 0.8) {
            const span = document.createElement("span");
            span.className = `semantic-highlight ${data.color}`;
            span.textContent = text;
            textNode.parentNode.replaceChild(span, textNode);
          }
        });
      });
    });
  });
}

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
        Your role is semantic classifier of text. You receive a paragraph as input and return JSON array.

        First example:
        input: "Global warming continues to threaten our planet. Rising sea levels and extreme weather events are clear signs of climate change. Scientists emphasize the urgent need for renewable energy solutions and stricter emissions controls. Solar and wind power adoption is growing, but greenhouse gas emissions remain a major concern."
        output: '["global warming","climate change"]'
        
        Second example:
        input: "Machine learning algorithms are revolutionizing business operations. Companies are using AI to automate tasks and analyze large datasets. However, concerns about data privacy and algorithmic bias remain major challenges that need to be addressed."
        output: '["machine learning", "ai"]'
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
        // Combine all results
        const allCategories = results.map((result, index) => {
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
        });

        // Merge similar categories and combine their keywords
        const mergedCategories = allCategories.reduce((acc, curr) => {
          const existingCategory = acc.find(
            (c) => c.name.toLowerCase() === curr.name.toLowerCase(),
          );
          if (existingCategory) {
            // Merge keywords, remove duplicates
            existingCategory.keywords = [
              ...new Set([...existingCategory.keywords, ...curr.keywords]),
            ];
          } else {
            acc.push(curr);
          }
          return acc;
        }, []);

        const analysisResult = { categories: mergedCategories };
        console.log(
          "Analysis Result:",
          JSON.stringify(analysisResult, null, 2),
        );
        categories = {};

        analysisResult.categories.forEach((category, index) => {
          categories[category.name] = {
            keywords: category.keywords,
            color: `semantic-highlight-${index}`,
          };
        });

        // Add dynamic styles
        let styleSheet = document.createElement("style");
        Object.entries(categories).forEach(([_, data], index) => {
          styleSheet.textContent += `
            .${data.color} {
              background-color: ${colors[index % colors.length]} !important;
              padding: 2px 4px;
              border-radius: 3px;
              transition: background-color 0.3s;
            }
          `;
        });
        document.head.appendChild(styleSheet);

        highlightText();
        return categories;
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
    analyzeContent().then((categories) => {
      sendResponse({ success: true, categories });
    });
    return true;
  } else if (request.action === "reset") {
    location.reload();
    sendResponse({ success: true });
  }
});
