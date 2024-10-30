import { Readability } from "readabilitySAX";
import { saxParser } from "./lib/saxParser.js";

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

async function analyzeContent() {
  // Get main article content
  const readable = new Readability();
  readable.setSkipLevel(3);
  saxParser(document.childNodes[document.childNodes.length - 1], readable);
  article = readable.getArticle();

  try {
    const capabilities = await ai.languageModel.capabilities();

    if (capabilities.available !== "no") {
      const session = await ai.languageModel.create({
        systemPrompt: `You are an expert at semantic analysis. Analyze the given text and identify 3-5 main semantic categories. For each category:
        1. Provide a clear, concise name
        2. List 5-10 relevant keywords that appear in the text
        3. Format response as JSON like: {"categories":[{"name":"category1","keywords":["word1","word2"]}]}`,
      });

      // const result = await session.prompt(text);
      const result = `
            
{
  "categories": [
    {
      "name": "Food and Nutrition",
      "keywords": ["noodles", "food", "nutrition", "staple food", "shapes", "cooking", "sauces", "soups", "refrigerated", "dried"]
    },
    {
      "name": "Culinary History and Traditions",
      "keywords": ["Chinese cuisine", "Italian cuisine", "varied", "names", "pasta", "shapes", "cultures", "origin"]
    },
    {
      "name": "Manufacturing Processes",
      "keywords": ["unleavened dough", "rolled flat", "cut", "stretched", "extruded", "long strips", "strings", "waves", "helices", "tubes", "shells", "folds"]
    },
    {
      "name": "Preparation and Consumption",
      "keywords": ["boiling water", "cooking oil", "salt", "pan-fried", "deep-fried", "accompanying sauce", "soup", "short-term storage", "future use"]
    },
    {
      "name": "General Characteristics and Properties",
      "keywords": ["type", "variety", "common", "uncommon", "long", "thin", "thick", "wide", "narrow", "smooth"]
    }
  ]
}`;
      try {
        const analysisResult = JSON.parse(result);
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
    let modified = false;

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
          if (similarity > 0.8 && !modified) {
            const span = document.createElement("span");
            span.className = `semantic-highlight ${data.color}`;
            span.textContent = text;
            textNode.parentNode.replaceChild(span, textNode);
            modified = true;
          }
        });
      });
    });
  });
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
