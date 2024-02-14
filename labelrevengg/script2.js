document.getElementById('upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('viewer').innerHTML = e.target.result;
            // Initialize your labeling script here or call a function to do so
            initializeLabeling();
        };
        reader.readAsText(file);
    }
});

function initializeLabeling() {
    // Adapted script functionalities go here
    // Ensure to scope functionalities to operate within #viewer content
}

class DocumentLabeler {
    constructor() {
        this.texts = [];
        this.xpaths = [];
        this.labels = [];
        this.segmentedTexts = [];
        this.coordinates = [];
        this.viewer = document.getElementById('viewer'); // Assuming an iframe or div for document display

        // Bind event listeners for buttons
        this.bindEventListeners();
    }

    bindEventListeners() {
        document.getElementById('upload').addEventListener('change', this.handleFileUpload.bind(this));
        document.getElementById('highlightBtn').addEventListener('click', this.highlightText.bind(this));
        document.getElementById('downloadLabelsBtn').addEventListener('click', this.downloadLabels.bind(this));
        document.getElementById('downloadAllTextBtn').addEventListener('click', this.downloadAllText.bind(this));
        document.getElementById('eraseAllBtn').addEventListener('click', this.eraseAll.bind(this));
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // For iframe, use srcdoc to set the content
                this.viewer.srcdoc = e.target.result;
                // For div, use innerHTML to set the content
                // this.viewer.innerHTML = e.target.result;

                // Additional initialization if needed
            };
            reader.readAsText(file);
        }
    }

    highlightText() {
        // Adapt the highlightText functionality here, triggered by a button
        // Assuming 'viewer' is either an iframe or a div where the document is displayed
        const viewer = document.getElementById('viewer'); 
        const viewerDoc = viewer.contentDocument || viewer; // Use contentDocument for iframe

        const rect = selectionRange.getBoundingClientRect();
        const scrollTop = viewerDoc.documentElement.scrollTop || viewerDoc.body.scrollTop;
        const scrollLeft = viewerDoc.documentElement.scrollLeft || viewerDoc.body.scrollLeft;
        const top_ = rect.top + scrollTop;
        const left = rect.left + scrollLeft;
        
        const hBox = viewerDoc.createElement('div');
        hBox.style.position = 'absolute';
        hBox.style.top = top_ + 'px';
        hBox.style.left = left + 'px';
        hBox.style.width = rect.width + 'px';
        hBox.style.height = rect.height + 'px';
        hBox.style.backgroundColor = 'yellow';
        hBox.style.opacity = '0.5';
        hBox.style.zIndex = '99999';
        
        const labelAttribute = viewerDoc.createAttribute("label");
        labelAttribute.value = label;
        hBox.setAttributeNode(labelAttribute);

        const idxAttribute = viewerDoc.createAttribute("idx");
        idxAttribute.value = idx;
        hBox.setAttributeNode(idxAttribute);

        const xpathsAttribute = viewerDoc.createAttribute("xpaths");
        xpathsAttribute.value = xpaths;
        hBox.setAttributeNode(xpathsAttribute);

        hBox.addEventListener('click', () => {
            // The rest of your event listener logic here...
        });

        // This part manages the click outside to deselect
        viewerDoc.addEventListener('click', (event) => {
            // Adapted event listener logic here...
        });

        // Append the hBox to the viewer's document body or specific container within the viewer
        viewerDoc.body.appendChild(hBox);

        return hBox;

    }

    downloadLabels() {
        // Adapt the downloading of labels functionality here
    }

    downloadAllText() {
        // Adapt the downloading of all text functionality here
    }

    eraseAll() {
        // Clear stored data and possibly refresh the viewer
        this.texts = [];
        this.xpaths = [];
        this.labels = [];
        this.segmentedTexts = [];
        this.coordinates = [];
        // Refresh the iframe or div content if needed
    }

    // Additional methods for handling highlights, storage, etc.
}

// Initialize the DocumentLabeler once the DOM is fully loaded
window.addEventListener('DOMContentLoaded', (event) => {
    new DocumentLabeler();
});
