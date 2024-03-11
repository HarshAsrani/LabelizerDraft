let uploadedHtml = null;
let uploadedTagsJson = null;

// Read and store the uploaded HTML file
document.getElementById('htmlFile').addEventListener('change', function(event) {
    const reader = new FileReader();
    reader.onload = function() {
        uploadedHtml = reader.result;
        // Display the uploaded HTML content
        document.getElementById('htmlDisplay').innerHTML = uploadedHtml;
    };
    reader.readAsText(event.target.files[0]);
});

// Read and store the uploaded tags JSON file
document.getElementById('tagsJsonFile').addEventListener('change', function(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const data = JSON.parse(reader.result);
        
        // Store uploaded data in localStorage
        
        updateStorage(data['xpaths'], data['labels'], data['segmentedTexts'], data['texts'])
        
        // Trigger highlighting based on uploaded data
        highlightBasedOnJson();
    };
    reader.readAsText(event.target.files[0]);
});

// Functionality to download the modified tags JSON
document.getElementById('downloadJson').addEventListener('click', function() {
    // Placeholder for modifications - you would modify `uploadedTagsJson` as per your logic
    const modifiedTagsJson = uploadedTagsJson; // Assume some modifications are done here

    // Convert JSON object to string
    const jsonString = JSON.stringify(modifiedTagsJson);

    // Create a blob with JSON content
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a new anchor element for download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modified-tags.json';
    document.body.appendChild(a); // Required for Firefox
    a.click();
    document.body.removeChild(a);
});


  function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  setStorage('sWidth', document.documentElement.scrollWidth);
  setStorage('sHeight', document.documentElement.scrollHeight);
  
  function updateStorage(xpaths, labels, sTexts, texts){
    print(texts)
    setStorage('texts', texts);
    print(xpaths)
    setStorage('xpaths', xpaths);
    setStorage('labels', labels);
    setStorage('segmentedTexts', sTexts);
    print(sTexts)
  }
  
  function getStorage(){
    texts = JSON.parse(localStorage.getItem('texts'));
    sTexts = JSON.parse(localStorage.getItem('segmentedTexts'));
    xpaths = JSON.parse(localStorage.getItem('xpaths'));
    labels = JSON.parse(localStorage.getItem('labels'));
  
    return [xpaths, labels, sTexts, texts];
  }
  
  function highlightBasedOnJson() {
    // Assuming data is the parsed JSON object directly passed from the upload handler
    const {texts, labels, xpaths, segmentedTexts} = data;
    var hBox = highlightText(
        sequence,
        xpaths.length,
        xpaths
      );

    document.body.appendChild(hBox);
    // Example: Iterate through the xpaths (this part is conceptual and needs actual implementation)
    xpaths.forEach((xpathArray, index) => {
        const label = labels[index];
        const textSegments = segmentedTexts[index];
        
        xpathArray.forEach((xpath, idx) => {
            const elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < elements.snapshotLength; i++) {
                const element = elements.snapshotItem(i);
                // Here you would need to apply the highlight to `element`
                // This is a conceptual step - in practice, you would need to find a way
                // to use `highlightText` or a similar mechanism to apply the highlight
                
                // For demonstration, assuming `highlightText` can be adapted or used here:
                // highlightText(element, label, index, [xpath]);
                // Note: The actual use of highlightText here is simplified and might not work directly as intended
            }
        });
    });
}

  function highlightText(label, idx, xpaths) {  
      const span = document.createElement('span');
      span.classList.add('highlight');
      span.setAttribute('data-label', label);
      span.setAttribute('data-idx', idx);
      span.setAttribute('data-xpaths', JSON.stringify(xpaths));
      span.style.backgroundColor = 'yellow';
      span.style.cursor = 'pointer';
  
      // Wrapping the selected text in the span element
      let contents = selectionRange.extractContents();
      span.appendChild(contents);
      selectionRange.insertNode(span);
  
      // Function to remove highlight
      function removeHighlight() {
          while (span.firstChild) {
              span.parentNode.insertBefore(span.firstChild, span);
          }
          span.parentNode.removeChild(span);
      }
  
      // Toggle highlight selection state
      span.addEventListener('click', function(event) {
          event.stopPropagation(); // Prevent the click from affecting other elements
  
          // Toggle selection visual feedback
          const isSelected = span.getAttribute('data-selected') === 'true';
          if (!isSelected) {
              span.setAttribute('data-selected', 'true');
              span.style.border = '2px solid red';
              
              // Optionally, open a dialog for deletion here or directly call removeHighlight
              if (confirm("Delete this highlight?")) { // Simple confirmation for demonstration
                  removeHighlight();
              } else {
                  // If not deleting, just deselect
                  span.setAttribute('data-selected', 'false');
                  span.style.border = '';
              }
          } else {
              span.setAttribute('data-selected', 'false');
              span.style.border = '';
          }
      });
  
      // Clear the selection after highlighting
      const selection = window.getSelection();
      if (selection) selection.removeAllRanges();
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
  
  function getElementInfo(sel, range) {
      const container = range.commonAncestorContainer;
      const nodeXPaths = [];
      const nodeTexts = [];
      let currSelectCopy = sel.toString().trim();
    
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
    
      function traverse(node) {
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
                  nodeText.length
                );
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
    
      traverse(container);
    
      return { xpaths: nodeXPaths, selectedTexts: nodeTexts };
    }
  
  // Initialize and store
  var texts = [];
  var xpaths = [];
  var labels = [];
  var sTexts = [];
  updateStorage(xpaths, labels, sTexts, texts);
  
  let isMenuOpen = false;
  let mouseX;
  let mouseY;
  let selectedOption = null;
  function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }  
  
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        
        // Extract selection details
        const highlightedText = window.getSelection().toString();
        if (highlightedText) { // Ensure there is text selected
            const sel = window.getSelection();
            const range = sel.getRangeAt(0);
            const xpaths_text = getElementInfo(sel, range);
            const highlightedXpaths = xpaths_text.xpaths;
            const highlightedSegmentedText = xpaths_text.selectedTexts;

            // Call shared logic with extracted details
            processSharedLogic(highlightedText, highlightedXpaths, highlightedSegmentedText);
        }
    }
    else if (event.key === 'p') {
        downloadObjectAsJson(localStorage, 'contract_saved')
      }
      else if ((event.altKey || event.metaKey) && event.key === "a") {
        let XPathsAndTexts = getAllXPathsAndTexts();
        updateStorage(XPathsAndTexts[1], '', XPathsAndTexts[0], '');
        downloadObjectAsJson(localStorage, 'all_contract_text');
      }
      else if ((event.altKey || event.metaKey) && event.key === "0") {
        updateStorage('', '', '', '');
        console.log('ERASED');
      }
});

document.getElementById('tagsJsonFile').addEventListener('change', function(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const data = JSON.parse(reader.result);
        console.log(data)
        // Assuming functions to parse data and extract necessary information are implemented
        // Example call (details would depend on your data parsing logic)
        //processSharedLogic(/* extracted highlightedText */, /* extracted highlightedXpaths */, /* extracted highlightedSegmentedText */);
        var hBox = highlightText(
            sequence,
            xpaths.length,
            xpaths
          );

          labels.push(sequence);
          xpaths.push(highlightedXpaths);
          sTexts.push(highlightedSegmentedText);
          texts.push(highlightedText);
          // c.push([norm(hBox.style.top, 'h'), norm(hBox.style.left, 'w'), norm(hBox.style.width, 'w'), norm(hBox.style.height, 'h')])
          updateStorage(xpaths, labels, sTexts, texts);

          isMenuOpen = false;
          menuWindow.close();
          document.body.appendChild(hBox);
    };
    reader.readAsText(event.target.files[0]);
});

function processSharedLogic(highlightedText, highlightedXpaths, highlightedSegmentedText) {
    // This example assumes the variables `xpaths`, `labels`, `sTexts`, and `texts` are globally accessible for simplicity
    // Ensure you have appropriate logic to handle these as needed

    // Check if there's an existing open menu or dialog and proceed if not
    if (!isMenuOpen) {
        isMenuOpen = true;
        const menuWindow = window.open("", "Dialog Box", "width=700,height=700");
        const dialog = menuWindow.document.createElement("div");
        dialog.style.display = "flex";
        dialog.style.flexDirection = "column";
        dialog.style.justifyContent = "center";
        dialog.style.alignItems = "center";
        menuWindow.document.body.appendChild(dialog);
        const message = menuWindow.document.createElement("p");
        const xpath_text_message = menuWindow.document.createElement("p");
        xpath_text_message.textContent = "XPATHS: " + highlightedXpaths.map(xpath_ => xpath_ + '\n\n');
        message.textContent = "Classes: t, tn, n, st, sn, sst, ... , ssssn. Press SPACE when done; any other key to reset";
        message.style.fontSize = "12px";
        xpath_text_message.style.fontSize = "12px";
        dialog.appendChild(message);
        dialog.appendChild(xpath_text_message);
        
        let sequence = '';
        const allowedKeys = new Set(['t','n','s'])
        const labelTypes = new Set(['t','tn','n','st','sn','sst','ssn','ssst','sssn','ssssn','sssst'])
        function handleKeyDown(event) {
          
          if (allowedKeys.has(event.key)) {
            sequence += event.key;
          }
          else if (event.code === 'Space' && sequence.length > 0 && labelTypes.has(sequence)) {
            var hBox = highlightText(
              sequence,
              xpaths.length,
              xpaths
            );
  
            labels.push(sequence);
            xpaths.push(highlightedXpaths);
            sTexts.push(highlightedSegmentedText);
            texts.push(highlightedText);
            // c.push([norm(hBox.style.top, 'h'), norm(hBox.style.left, 'w'), norm(hBox.style.width, 'w'), norm(hBox.style.height, 'h')])
            updateStorage(xpaths, labels, sTexts, texts);
  
            isMenuOpen = false;
            menuWindow.close();
            document.body.appendChild(hBox);
          }
          // Reset the sequence if user types something wrong
          else {
            sequence = '';
          }
          console.log(sequence);
          const currSeq = menuWindow.document.createElement("p");
          currSeq.textContent = `Curr sequence: ${sequence}`;
          currSeq.style.fontSize = "12px";
          dialog.appendChild(currSeq);
        }
        menuWindow.addEventListener('keydown', handleKeyDown);
        
        menuWindow.addEventListener('unload', function() {
          menuWindow.removeEventListener('keydown', handleKeyDown);
          isMenuOpen = false;
        });
        // Populate menuWindow with necessary elements and information

        // Define and implement the interaction within the menuWindow here
        // For example, setting up event listeners within the menuWindow for handling user input

        // Once done, you can update your storage or perform other actions based on user input
    }
}


  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      const highlightedText = window.getSelection().toString();
      const sel = window.getSelection();
      const range = sel.getRangeAt(0);
      const xpaths_text = getElementInfo(sel, range);
      const highlightedXpaths = xpaths_text.xpaths;
      const highlightedSegmentedText = xpaths_text.selectedTexts;
  
      [xpaths, labels, sTexts, texts] = getStorage();
  
      if (!isMenuOpen){
        isMenuOpen = true;
        mouseX = event.pageX;
        mouseY = event.pageY;
        const menuWindow = window.open("", "Dialog Box", `width=700,height=700,top=${mouseY},left=${mouseX}`);
        const dialog = menuWindow.document.createElement("div");
        dialog.style.display = "flex";
        dialog.style.flexDirection = "column";
        dialog.style.justifyContent = "center";
        dialog.style.alignItems = "center";
        menuWindow.document.body.appendChild(dialog);
        const message = menuWindow.document.createElement("p");
        const xpath_text_message = menuWindow.document.createElement("p");
        xpath_text_message.textContent = "XPATHS: " + highlightedXpaths.map(xpath_ => xpath_ + '\n\n');
        message.textContent = "Classes: t, tn, n, st, sn, sst, ... , ssssn. Press SPACE when done; any other key to reset";
        message.style.fontSize = "12px";
        xpath_text_message.style.fontSize = "12px";
        dialog.appendChild(message);
        dialog.appendChild(xpath_text_message);
        
        let sequence = '';
        const allowedKeys = new Set(['t','n','s'])
        const labelTypes = new Set(['t','tn','n','st','sn','sst','ssn','ssst','sssn','ssssn','sssst'])
        function handleKeyDown(event) {
          
          if (allowedKeys.has(event.key)) {
            sequence += event.key;
          }
          else if (event.code === 'Space' && sequence.length > 0 && labelTypes.has(sequence)) {
            var hBox = highlightText(
              sequence,
              xpaths.length,
              xpaths
            );
  
            labels.push(sequence);
            xpaths.push(highlightedXpaths);
            sTexts.push(highlightedSegmentedText);
            texts.push(highlightedText);
            // c.push([norm(hBox.style.top, 'h'), norm(hBox.style.left, 'w'), norm(hBox.style.width, 'w'), norm(hBox.style.height, 'h')])
            updateStorage(xpaths, labels, sTexts, texts);
  
            isMenuOpen = false;
            menuWindow.close();
            document.body.appendChild(hBox);
          }
          // Reset the sequence if user types something wrong
          else {
            sequence = '';
          }
          console.log(sequence);
          const currSeq = menuWindow.document.createElement("p");
          currSeq.textContent = `Curr sequence: ${sequence}`;
          currSeq.style.fontSize = "12px";
          dialog.appendChild(currSeq);
        }
        menuWindow.addEventListener('keydown', handleKeyDown);
        
        menuWindow.addEventListener('unload', function() {
          menuWindow.removeEventListener('keydown', handleKeyDown);
          isMenuOpen = false;
        });
      }    
    }
    else if (event.key === 'p') {
      downloadObjectAsJson(localStorage, 'contract_saved')
    }
    else if ((event.altKey || event.metaKey) && event.key === "a") {
      let XPathsAndTexts = getAllXPathsAndTexts();
      updateStorage(XPathsAndTexts[1], '', XPathsAndTexts[0], '');
      downloadObjectAsJson(localStorage, 'all_contract_text');
    }
    else if ((event.altKey || event.metaKey) && event.key === "0") {
      updateStorage('', '', '', '');
      console.log('ERASED');
    }
  });
  