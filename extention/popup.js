document.getElementById("uploadBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput");
  const urlInput = document.getElementById("imageUrlInput");
  const status = document.getElementById("status");

  let imageBlob;

  if (fileInput.files.length > 0) {
    imageBlob = fileInput.files[0];
  } else if (urlInput.value.trim() !== "") {
    try {
      const response = await fetch(urlInput.value.trim());
      if (!response.ok) throw new Error("Failed to fetch image from URL.");
      imageBlob = await response.blob();
    } catch (error) {
      status.textContent = "Invalid image URL or fetch failed.";
      return;
    }
  } else {
    status.textContent = "Please upload a file or enter an image URL.";
    return;
  }

  const formData = new FormData();
  formData.append("file", imageBlob, "input.jpg");

  try {
    const res = await fetch("http://localhost:8000/analyze/", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      status.textContent = "Error analyzing image.";
      return;
    }

    const data = await res.json();
    const detected = String(data["Watermark Detected"]).toLowerCase() === "true";
    status.innerHTML = `Watermarked: ${data["Watermark Detected"]}${detected ? `<br>Generator: ${data["Generator"]}` : ''}`;

  } catch (err) {
    console.error(err);
    status.textContent = "Server error.";
  }
});
