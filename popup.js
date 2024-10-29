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

document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const categoriesDiv = document.getElementById('categories');

    document.getElementById('analyze').addEventListener('click', () => {
        statusDiv.textContent = 'Analyzing content...';
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'analyze'}, response => {
                if (response && response.success) {
                    statusDiv.textContent = 'Analysis complete!';

                    // Display categories
                    categoriesDiv.innerHTML = '';
                    Object.entries(response.categories).forEach(([category, data], index) => {
                        const div = document.createElement('div');
                        div.className = 'category';

                        const colorPreview = document.createElement('span');
                        colorPreview.className = 'color-preview';
                        colorPreview.style.backgroundColor = colors[index % colors.length];

                        const label = document.createElement('span');
                        label.textContent = category;

                        div.appendChild(colorPreview);
                        div.appendChild(label);
                        categoriesDiv.appendChild(div);
                    });
                } else {
                    statusDiv.textContent = 'Analysis failed. Please try again.';
                }
            });
        });
    });

    document.getElementById('reset').addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'reset'});
        });
    });
});