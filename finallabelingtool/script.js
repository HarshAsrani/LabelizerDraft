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
        uploadedTagsJson = JSON.parse(reader.result);
        console.log('Tags JSON content:', uploadedTagsJson);
        // Implement highlighting or manipulation based on tags here
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