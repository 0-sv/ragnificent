# RAGnificent

A Chrome extension that uses on-device AI to provide quick, relevant answers about any webpage's content.

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

## Technical Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Content Processing**: 
  - ReadabilitySAX for content extraction
  - TurndownService for HTML to text conversion
  - Custom BM25 implementation for relevance ranking
- **AI**: Uses the Chrome Extension AI API for on-device processing

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the project directory

## Usage

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

## License

[Add your license information here]
