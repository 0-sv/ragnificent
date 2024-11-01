import { Readability } from "readabilitySAX";
import { saxParser } from "./lib/saxParser.js";
import TurndownService from "turndown";
import { encode } from "gpt-tokenizer";
import BM25 from "./lib/bm25.js";

const readability = new Readability();


async function analyzeContent() {
  // Get main article content
  const readable = new Readability();
  readable.setSkipLevel(0);
  saxParser(document.childNodes[document.childNodes.length - 1], readable);
  const fullArticle = readable.getArticle("text").text;
  
  // Split article into paragraphs for BM25
  const paragraphs = fullArticle
    .split(/\n\s*\n/)
    .filter(para => para.trim().length > 0);
  
  // Initialize BM25 with paragraphs
  const bm25 = new BM25();
  bm25.addDocuments(paragraphs);
  
  // Get query from user (this should be passed in from UI later)
  const query = "What are the main points about this topic?";
  const relevantIndices = bm25.search(query, 2); // Get top 2 most relevant paragraphs
  const relevantText = relevantIndices
    .map(idx => paragraphs[idx])
    .join("\n\n");

  try {
    // Check token count of full article
    const MAX_TOKENS = 3000;
    const tokens = encode(relevantText);
    if (tokens.length > MAX_TOKENS) {
      console.warn("Article exceeds maximum token length, it will be truncated");
    }
    
    const capabilities = await ai.languageModel.capabilities();

    if (capabilities.available !== "no") {
      const session = await ai.languageModel.create({
        systemPrompt: `You are a helpful AI assistant that answers questions about text content.
        
        Below is a relevant excerpt from an article. Please answer the following question about it:
        
        Question: ${query}
        
        Article excerpt:
        ${relevantText}
        
        Provide a clear, concise answer based only on the information given in the text.
        Format your response as a JSON array of key points, with 2-3 main points maximum.
        Each point should be a complete, informative statement.`,
      });

      try {
        const result = await session.prompt(relevantText);
        try {
          const categories = JSON.parse(result);
          console.log("Analysis Result:", JSON.stringify(categories, null, 2));
          return categories;
        } catch (error) {
          console.error("Failed to parse AI response:", error);
          return null;
        }
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
