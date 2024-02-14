import gradio as gr

def process_html(file_path, tags):
    # Placeholder function to process the HTML file and tags
    # For demonstration, it just returns a text statement
    # You would replace this with your actual processing logic
    return f"Processed HTML file {file_path.name} with tags: {tags}"

app = gr.Interface(
    fn=process_html,
    inputs=[
        gr.input.File(label="Upload HTML File"),
        gr.input.Textbox(label="Enter Tags (comma-separated)"),
    ],
    outputs="text"
)

if __name__ == "__main__":
    app.launch()
