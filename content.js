let categories = {};
const colors = [
    'rgba(255, 229, 229, 0.7)',
    'rgba(229, 255, 229, 0.7)',
    'rgba(229, 229, 255, 0.7)',
    'rgba(255, 243, 224, 0.7)',
    'rgba(224, 247, 250, 0.7)',
    'rgba(245, 224, 250, 0.7)',
    'rgba(250, 224, 224, 0.7)',
    'rgba(224, 250, 245, 0.7)'
];

async function analyzeContent() {
    // Get main article content
    const articleContent = document.querySelector('article, [role="article"], .article, main') || document.body;
    // const text = articleContent.innerText;
    const text = "The 1921 Centre vs. Harvard football game was a regular-season collegiate American football game played on October 29, 1921, at Harvard Stadium in Boston, Massachusetts. The contest featured the undefeated Centre Praying Colonels, representing Centre College, and the undefeated Harvard Crimson, representing Harvard University. Centre won the game 6–0, despite entering as heavy underdogs, and the game is widely viewed as one of the largest upsets in college football history. The game is often referred to by the shorthand C6H0, after a Centre professor's remark that Harvard had been poisoned by this \"impossible\" chemical formula.";

    try {
        const capabilities = await ai.languageModel.capabilities();

        if (capabilities.available !== "no") {
            const session = await ai.languageModel.create({
                systemPrompt: `You are an expert at semantic analysis. Analyze the given text and identify 3-5 main semantic categories. For each category:
        1. Provide a clear, concise name
        2. List 5-10 relevant keywords that appear in the text
        3. Format response as JSON like: {"categories":[{"name":"category1","keywords":["word1","word2"]}]}`
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
}`
            try {
                const analysisResult = JSON.parse(result);
                categories = {};

                analysisResult.categories.forEach((category, index) => {
                    categories[category.name] = {
                        keywords: category.keywords,
                        color: `semantic-highlight-${index}`
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
                console.error('Failed to parse AI response:', e);
                return null;
            }
        }
    } catch (e) {
        console.error('AI analysis failed:', e);
        return null;
    }
}

function highlightText() {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }

    textNodes.forEach(textNode => {
        let text = textNode.nodeValue;
        let modified = false;

        Object.entries(categories).forEach(([category, data]) => {
            data.keywords.forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                if (regex.test(text) && !modified) {
                    const span = document.createElement('span');
                    span.className = `semantic-highlight ${data.color}`;
                    span.textContent = text;
                    textNode.parentNode.replaceChild(span, textNode);
                    modified = true;
                }
            });
        });
    });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyze') {
        analyzeContent().then(categories => {
            sendResponse({ success: true, categories });
        });
        return true;
    } else if (request.action === 'reset') {
        location.reload();
        sendResponse({ success: true });
    }
});