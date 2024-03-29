function norm(coor, w) {
    if (w == 'w'){
        return parseFloat(coor) / document.documentElement.scrollWidth;
    }
    return parseFloat(coor) / document.documentElement.scrollHeight;
}
function setStorage(key, value) {
localStorage.setItem(key, JSON.stringify(value));
}
function updateStorage(xpaths, labels, sTexts, texts, c){
    setStorage('texts', texts);
    setStorage('xpaths', xpaths);
    setStorage('labels', labels);
    setStorage('segmentedTexts', sTexts);
    setStorage('c', c);
}

function getStorage(){
    texts = JSON.parse(localStorage.getItem('texts'));
    sTexts = JSON.parse(localStorage.getItem('segmentedTexts'));
    xpaths = JSON.parse(localStorage.getItem('xpaths'));
    labels = JSON.parse(localStorage.getItem('labels'));
    c = JSON.parse(localStorage.getItem('c'));

    return [xpaths, labels, sTexts, texts, c];
}

function removeHBox(hBox) {
    
    // Remove hBox from the DOM
    hBox.remove();
    // Remove text entry from local storage
    [xpaths, labels, sTexts, texts, c] = getStorage();
    const delete_idx = hBox.getAttribute('idx');

    texts[delete_idx] = 'DEL';
    sTexts[delete_idx] = 'DEL';
    xpaths[delete_idx] = 'DEL';
    labels[delete_idx] = 'DEL';
    c[delete_idx] = 'DEL';
    
    updateStorage(xpaths, labels, sTexts, texts, c);
}

function highlightText(selectionRange, label, idx, xpaths) {
    const rect = selectionRange.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const top_ = rect.top + scrollTop;
    const left = rect.left + scrollLeft;
    
    const hBox = document.createElement('div');
    hBox.style.position = 'absolute';
    hBox.style.top = top_ + 'px';
    hBox.style.left = left + 'px';
    hBox.style.width = rect.width + 'px';
    hBox.style.height = rect.height + 'px';
    hBox.style.backgroundColor = 'yellow';
    hBox.style.opacity = '0.5';
    hBox.style.zIndex = '99999';
    
    const labelAttribute = document.createAttribute("label");
    labelAttribute.value = label;
    hBox.setAttributeNode(labelAttribute);

    const idxAttribute = document.createAttribute("idx");
    idxAttribute.value = idx;
    hBox.setAttributeNode(idxAttribute);

    const xpathsAttribute = document.createAttribute("xpaths");
    xpathsAttribute.value = xpaths;
    hBox.setAttributeNode(xpathsAttribute);

    hBox.addEventListener('click', () => {
        const label = hBox.getAttribute('label'); // ###

        // Toggle the selected state of the highlight box only if it is not already selected
        const isSelected = hBox.getAttribute('selected') === 'true';
        if (!isSelected) {
            hBox.setAttribute('selected', 'true');
            hBox.style.border = '2px solid red'; // Add red border when selected

            // Create a dialog box to delete the highlight box
            hBox.dialogBox = window.open("", "Delete Highlight Box", "height=200,width=400");
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.style.margin = '10px';
            deleteButton.addEventListener('click', () => {
                removeHBox(hBox);
                hBox.dialogBox.close();
            });
            hBox.dialogBox.document.body.appendChild(deleteButton);
        }
    });

    // Add event listener to remove red border when de-selected
    document.addEventListener('click', (event) => {
        if (!hBox.contains(event.target)) {
        hBox.setAttribute('selected', 'false');
        hBox.style.border = 'none'; // Remove red border when de-selected
        if (hBox.dialogBox && !hBox.dialogBox.close){ // if dialog box is still open but we select anotherhBox
            hBox.dialogBox.close();
        }
    }
    });
    return hBox;
}

function getAllXPathsAndTexts() {
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.body);
    sel.removeAllRanges();
    sel.addRange(range);
  
    const xpaths_text = getElementInfo(sel, range);
    const highlightedXpaths = xpaths_text.xpaths;
    const highlightedSegmentedText = xpaths_text.selectedTexts;
    
    return [highlightedSegmentedText, highlightedXpaths];
    
}

function getXPath(node) {
    let xpath = "";
    for (; node && node.nodeType == Node.ELEMENT_NODE; node = node.parentNode) {
        let siblings = Array.from(node.parentNode.childNodes).filter(
            (sibling) => sibling.nodeName === node.nodeName
        );
        if (siblings.length > 1) {
            let index = siblings.indexOf(node) + 1;
            xpath = `/${node.nodeName.toLowerCase()}[${index}]${xpath}`;
        } else {
            xpath = `/${node.nodeName.toLowerCase()}${xpath}`;
        }
    }
    return xpath;
}

function traverse(node, currSelectCopy) {
    if (range.intersectsNode(node)) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.trim().length > 0) {
                let nodeXPath = getXPath(node.parentNode);
                let nodeText = node.textContent.trim();
                let startIndex = Math.max(nodeText.indexOf(currSelectCopy), 0);
                let endIndex = Math.min(
                    startIndex + currSelectCopy.length,
                    nodeText.length
                );
                if (startIndex !== -1) {
                    let selectedText = nodeText.substring(startIndex, endIndex);
                    currSelectCopy = currSelectCopy.replace(selectedText, "");
                    nodeTexts.push(selectedText);
                    nodeXPaths.push(nodeXPath);
                }
            }
        } else {
            if (node.childNodes.length > 0) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    traverse(node.childNodes[i]);
                }
            } else {
                if (node.textContent.trim().length > 0) {
                    let nodeXPath = getXPath(node);
                    let nodeText = node.textContent.trim();
                    let startIndex = Math.max(nodeText.indexOf(currSelectCopy), 0);
                    let endIndex = Math.min(
                    startIndex + currSelectCopy.length,
                    nodeText.length);
                    if (startIndex !== -1) {
                        let selectedText = nodeText.substring(startIndex, endIndex);
                        currSelectCopy = currSelectCopy.replace(selectedText, "");
                        nodeTexts.push(selectedText);
                        nodeXPaths.push(nodeXPath);
                    }
                }
            }
        }
    }
}

function getElementInfo(sel, range) {
    const container = range.commonAncestorContainer;
    const nodeXPaths = [];
    const nodeTexts = [];
    let currSelectCopy = sel.toString().trim();

    
    traverse(container, currSelectCopy);

    return { xpaths: nodeXPaths, selectedTexts: nodeTexts };
}
function getAllXPathsAndTexts() {
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.body);
    sel.removeAllRanges();
    sel.addRange(range);
  
    const xpaths_text = getElementInfo(sel, range);
    const highlightedXpaths = xpaths_text.xpaths;
    const highlightedSegmentedText = xpaths_text.selectedTexts;
    
    return [highlightedSegmentedText, highlightedXpaths];
    
}