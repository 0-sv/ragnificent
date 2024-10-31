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
                systemPrompt: `Your role is semantic classifier of text. 

                First example:
                input: "Global warming continues to threaten our planet. Rising sea levels and extreme weather events are clear signs of climate change. Scientists emphasize the urgent need for renewable energy solutions and stricter emissions controls. Solar and wind power adoption is growing, but greenhouse gas emissions remain a major concern."
                output: {"categories":[{"name":"Environmental Threats","keywords":["global warming","sea levels","climate change","extreme weather","emissions"]},{"name":"Green Solutions","keywords":["renewable energy","solar","wind power","emissions controls","scientists"]}]}
                
                Classify the following text:`
            });

            const result = await session.prompt(text);
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