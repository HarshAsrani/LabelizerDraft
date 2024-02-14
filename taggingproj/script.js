document.addEventListener('DOMContentLoaded', function() {
    loadTagsFromStorage(); // Load previously saved tags when the page loads

    document.getElementById('uploadHtml').addEventListener('change', function(event) {
        loadHtmlFile(event.target.files[0]);
    });

    document.getElementById('downloadHtml').addEventListener('click', function() {
        downloadModifiedHtml();
    });

    document.getElementById('downloadTags').addEventListener('click', function() {
        downloadTagsAsJson();
    });

    document.getElementById('downloadXpaths').addEventListener('click', function() {
        downloadCompleteDOMxPathsWithTags();
    });

    document.getElementById('downloadDOM').addEventListener('click', function() {
        downloadDOMAsFile();
    });

    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            handleTextSelection();
        }
    });
    
});

function getXPathForElement(element) {
    const paths = [];
    for (; element && element.nodeType == Node.ELEMENT_NODE; element = element.parentNode) {
        let index = 0;
        for (let sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
            if (sibling.nodeType == Document.ELEMENT_NODE && sibling.nodeName == element.nodeName) index++;
        }
        const tagName = element.nodeName.toLowerCase();
        const pathIndex = (index ? "[" + (index+1) + "]" : "");
        paths.unshift(tagName + pathIndex);
    }
    return paths.length ? "/" + paths.join("/") : null;
}

function handleTextSelection() {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
        const tag = prompt("Enter tag for selected text:", "");
        if (tag) {
            const selectedText = selection.toString();
            saveTag(selectedText, tag);
            highlightText(selection, tag); // Optionally highlight the text
        }
    }
}

function saveTag(text, tag) {
    const tags = JSON.parse(localStorage.getItem('tags')) || [];
    tags.push({ text, tag });
    localStorage.setItem('tags', JSON.stringify(tags));
}

function loadTagsFromStorage() {
    const tags = JSON.parse(localStorage.getItem('tags')) || [];
    tags.forEach(tagInfo => {
        console.log(`Loaded tag: ${tagInfo.tag} for text: "${tagInfo.text}" with XPath: "${tagInfo.xpath}"`);
    });
}

function generateDOMXPathStructure(element, path = '') {
    if (!element) {
        return [];
    }
    const xPath = `${path}/${element.tagName}` + (element.id ? `[@id="${element.id}"]` : '');
    let structure = [{ path: xPath, text: element.textContent.trim(), tag: null }];

    Array.from(element.children).forEach(child => {
        structure = structure.concat(generateDOMXPathStructure(child, xPath));
    });

    return structure;
}

function downloadCompleteDOMxPathsWithTags() {
    const contentElement = document.getElementById('content');
    let domStructure = generateDOMXPathStructure(contentElement);
    
    // Associate tags with their xPaths
    const tags = JSON.parse(localStorage.getItem('tags')) || [];
    tags.forEach(tag => {
        const matchingElement = domStructure.find(element => element.path === tag.xpath);
        if (matchingElement) {
            matchingElement.tag = tag.tag;
        }
    });

    // Filter out elements without significant text if desired
    domStructure = domStructure.filter(el => el.text.length > 0 || el.tag);

    const blob = new Blob([JSON.stringify(domStructure, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'complete_dom_with_tags.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(href);
}

function downloadXpathsWithTags() {
    const tags = localStorage.getItem('tags');
    if (tags) {
        const filename = 'xpaths_with_tags.json';
        const blob = new Blob([tags], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(href);
    } else {
        alert('No tags to download.');
    }
}

function highlightText(selection, tag) {
    // This function should create a visual highlight over the selected text.
    // For simplicity, this example will just log the action.
    console.log(`Would highlight "${selection.toString()}" with tag: ${tag}`);
}

function downloadTagsAsJson() {
    const tags = localStorage.getItem('tags');
    if (tags) {
        const filename = 'tags.json';
        const blob = new Blob([tags], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(href);
    } else {
        alert('No tags to download.');
    }
}

function downloadDOMAsFile() {
    const uploadedDOM = window.uploadedDOM;
    if (!uploadedDOM) {
        alert('No HTML uploaded yet');
        return;
    }

    // Serialize the DOM tree to a string
    const serializedDOM = new XMLSerializer().serializeToString(uploadedDOM);

    // Create a blob from the serialized DOM
    const blob = new Blob([serializedDOM], { type: 'text/html' });

    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'uploaded_dom.html';
    link.click();

    // Clean up
    URL.revokeObjectURL(link.href);
}

function loadHtmlFile(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const htmlContent = event.target.result;

        // Parse HTML into DOM tree
        const parser = new DOMParser();
        const dom = parser.parseFromString(htmlContent, 'text/html');

        // Store the DOM tree in the global variable for later use
        window.uploadedDOM = dom;

        // Set the HTML content to the 'content' element
        document.getElementById('content').innerHTML = htmlContent;
    };
    reader.readAsText(file);
}

function downloadModifiedHtml() {
    const content = document.getElementById('content').innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'modified_document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(href);
}
