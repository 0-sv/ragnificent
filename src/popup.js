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

document.addEventListener("DOMContentLoaded", () => {
  const statusDiv = document.getElementById("status");
  const categoriesDiv = document.getElementById("categories");

  document.getElementById("analyze").addEventListener("click", () => {
    const queryInput = document.getElementById("query");
    const query = queryInput.value.trim();
    
    if (!query) {
      statusDiv.textContent = "Please enter a question first";
      return;
    }

    statusDiv.textContent = "Analyzing content...";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: "analyze",
        query: query 
      }, (response) => {
        if (response && response.success) {
          statusDiv.textContent = "Analysis complete!";

          // Display response text
          categoriesDiv.innerHTML = "";
          const responseDiv = document.createElement("div");
          responseDiv.className = "response-text";
          responseDiv.textContent = response.results || "No response received.";
          categoriesDiv.appendChild(responseDiv);
        } else {
          statusDiv.textContent = "Analysis failed. Please try again.";
        }
      });
    });
  });

  document.getElementById("reset").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "reset" });
    });
  });
});
