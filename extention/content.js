let targetClass = '';
let targetImgElement = '';
let signature = '';

// if current URI ~ chatgpt:
if (window.location.href.includes("chatgpt.com")) {
  console.log("You're on ChatGPT")
  targetClass = 'group/imagegen-image';
  targetImgElement = 'img[alt="Generated image"]'
  signature = 'ChatGPT'
}

//  else set targetclass and targetimgelement to perplexity's
if (window.location.href.includes("perplexity.ai")) {
  console.log("You're on Perplexity")
  targetClass = '@container';
  targetImgElement = 'img[alt="FLUX"]'
  signature = 'Perplexity'
}

console.log("hello1");

const observer = new MutationObserver((mutationsList, observer) => {
  for (let mutation of mutationsList) {
    if (mutation.type === 'childList') {
      const targetDivs = document.getElementsByClassName(targetClass);
      const targetDiv = targetDivs[targetDivs.length - 1];  // get last added
      if (targetDiv) {
        const img = targetDiv.querySelector(targetImgElement);
        if (img && img.src) {
          const imgUrl = img.src;
          downloadImage(imgUrl);  // call async wrapper
        }
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Function to download the image, now correctly marked async
/*async function downloadImage(url) {
  console.log(url)
  const res = await fetch(url, {
       method: "GET"
  })

  const imageBlob = await res.blob()
  console.log(imageBlob)

  const formData = new FormData();
  formData.append("file", imageBlob, "input.png");
  console.log("we are actually here")

  try {
    const res = await fetch("http://localhost:8000/process/", {
      method: "POST",
      body: formData,
    });
    console.log("we are here")
    const wmBlob = await res.blob()
    const wmImageUrl = URL.createObjectURL(wmBlob)
    const imgElement = document.createElement('img')
    imgElement.src = wmImageUrl
    imgElement.alt = "Watermarked Image"
    document.body.appendChild(imgElement)

  } catch (error) {
    console.error(error)
  }

}*/

async function downloadImage(url) {
  console.log(url);

  try {
    const imageResponse = await fetch(url, { method: "GET" });
    const imageBlob = await imageResponse.blob();
    console.log("Blob:", imageBlob);

    const formData = new FormData();
    formData.append("file", imageBlob, "input.png");
    formData.append("signature", signature);
    console.log("we are actually here");

    const backendResponse = await fetch("http://localhost:8000/process/", {
      method: "POST",
      body: formData,
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend error: ${backendResponse.status}`);
    }

    console.log("we are here");

    const wmBlob = await backendResponse.blob();
    const wmImageUrl = URL.createObjectURL(wmBlob);
    console.log("wm blob:", wmBlob)
    const imgElements = document.querySelectorAll(targetImgElement)
    console.log(imgElements)
    const imgElement = imgElements[imgElements.length - 1]
    if (imgElement) {
      const newImgElement = imgElement.cloneNode(true)
      newImgElement.src = wmImageUrl
      newImgElement.alt = "Watermarked Image"
      imgElement.parentNode.replaceChild(newImgElement, imgElement)
    }


    /*const targetDivs = document.getElementsByClassName(targetClass);
    const targetDiv = targetDivs[targetDivs.length - 1];
    if (targetDiv) {
        const img = targetDiv.querySelector('img');
        if (img && img.src) {
          img.src = wmImageUrl;
        }
      }
    const newElement = targetDiv.cloneNode(true); // or false if you don't need deep clone
    targetDiv.parentNode.replaceChild(newElement, targetDiv);*/

  } catch (error) {
    console.error("Something went wrong:", error);
  }


}

