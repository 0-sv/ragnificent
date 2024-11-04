# RAGnificent

A Chrome extension that uses on-device AI to provide quick, relevant answers about any webpage's content.

<!-- TOC -->
* [RAGnificent](#ragnificent)
  * [Features](#features)
  * [How It Works](#how-it-works)
  * [Techn Stack](#techn-stack)
  * [Installation](#installation)
  * [Usage](#usage)
  * [Development](#development)
* [Example prompts](#example-prompts)
  * [General Comprehension](#general-comprehension)
  * [Author's Intent and Perspective](#authors-intent-and-perspective-)
  * [Information Details](#information-details)
  * [Fact-checking and Critique](#fact-checking-and-critique)
  * [Contextual and Comparative Analysis](#contextual-and-comparative-analysis)
  * [Deeper Insights](#deeper-insights)
  * [Engagement and Interaction](#engagement-and-interaction)
<!-- TOC -->

## Features

- 🤖 On-device AI processing for privacy and speed
- 🎯 Smart content extraction using Readability
- 🔍 Advanced BM25 search algorithm for finding relevant context
- 💡 Natural language question answering
- ⚡ Fast and responsive interface
- 🎨 Dark mode UI with smooth animations

## How It Works

1. The extension extracts the main content from the webpage using ReadabilitySAX
2. Content is split into paragraphs and indexed using BM25 algorithm
3. When you ask a question, the most relevant paragraphs are selected
4. The on-device AI model generates a concise answer based on the selected context

## Techn Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Content Processing**: 
  - ReadabilitySAX for content extraction
  - TurndownService for HTML to text conversion
  - Custom BM25 implementation for relevance ranking
- **AI**: Uses the Chrome Extension AI API for on-device processing

## Installation

If you download the release directly from GitHub, then you can skip steps 1, 2 and 3.

1. Clone this repository
2. `npm install`
3. `npm run build`
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the `dist` directory

## Usage

For inspiration, check out the example prompts below.

1. Navigate to any webpage with article content
2. Click the RAGnificent extension icon
3. Type your question about the page content
4. Click "Ask Question" to get an AI-generated answer
5. Use "Reset" to clear the response and start over

## Development

The project uses a modular structure:
- `popup.html/js`: Extension UI and user interaction
- `content.js`: Webpage content processing and AI interaction
- `lib/`: Utility functions and core algorithms
  - `bm25.js`: Search relevance ranking
  - `saxParser.js`: HTML parsing utilities

# Example prompts

RAGnificent works well on example prompts like the following:

## General Comprehension

- What is the central argument or thesis of the web article?
- Could you summarize the key points in the article? 
- What evidence or data does the author provide to support their claims?
- Are there any counterarguments or alternative perspectives discussed?
- What conclusion does the author reach by the end?

## Author's Intent and Perspective 

- What seems to be the author's primary objective in writing this article?
- Does the author show any explicit or implied biases in presenting information?
- What tone does the author use—formal, conversational, critical, or neutral?
- Does the author reference external sources/experts? If so, what are they?

## Information Details

- What key statistics are mentioned in the article?
- What important dates or events are identified?
- What technical terms or jargon are used and what do they mean? 
- Is any new research or breakthrough information discussed?
- What main examples or case studies are included?

## Fact-checking and Critique

- Can claims be verified against provided data?
- Are sources cited and how reliable are they?
- Do any elements seem overstated based on content?
- Is anything unclear or underexplained?

## Contextual and Comparative Analysis

- How does this compare with other articles on the topic?
- Does it build on or refute prior research/consensus?
- What larger trends does it reference or relate to?
- How does it approach the topic differently than others?

## Deeper Insights

- What specific actions/changes are recommended?
- What implications are hinted at but not fully explored?
- How could this affect future developments in the field?

## Engagement and Interaction

- What questions remain unanswered?
- Could this mislead someone unfamiliar with the topic?
- What parts would spark the most debate?
- What other resources would help understand the context?
