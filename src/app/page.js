"use client";

import { useRef, useState } from "react";

export default function Home() {
  const [imageSrc, setImageSrc] = useState(null);
  const [algorithmSelected, setAlgorithmSelected] = useState("Floyd-Steinberg");
  // ene deer original nemsen
  const algorithms = ["Bayer 4x4", "Floyd-Steinberg", "Original"];
  const canvasRef = useRef(null);
  const loadedImgRef = useRef(null);

  const pallete = [
    [15, 56, 15],
    [48, 98, 48],
    [139, 172, 15],
    [155, 188, 15],
  ]

  const findClosestColor = (r, g, b, pallete) => {
    let minDistance = Infinity;
    let closestColor = pallete[0];

    for(let i = 0; i < pallete.length; i++) {
      const [pr, pg, pb] = pallete[i];
      const distance = (r-pr) ** 2 + (g-pg) ** 2 + (b-pb) ** 2;

      if(distance < minDistance) {
        minDistance = distance;
        closestColor = pallete[i];
      }
    }
    return closestColor;
  };
  const floydsteinberg = (data, width, height, pallete) => {
    const calculateError = (nx, ny, errR, errG, errB, factor) => {
      if(nx >= 0 && nx < width && ny >= 0 && ny < height) {
        let nIdx = (ny * width + nx) * 4;
        data[nIdx] += errR *factor
        data[nIdx + 1] += errG * factor;
        data[nIdx + 2] += errB * factor;
      }
    }
    for(let y = 0; y < height; y++){
      for(let x = 0; x < width; x++){
        let index = (y * width + x) * 4;
        
        let oldR = data[index];
        let oldG = data[index + 1];
        let oldB = data[index + 2];
        
        const [newR, newG, newB] = findClosestColor(oldR, oldG, oldB, pallete);

        data[index] = newR;
        data[index + 1] = newG;
        data[index + 2] = newB;

        let errR = oldR - newR;
        let errG = oldG - newG;
        let errB = oldB - newB;
        
        calculateError(x+1, y, errR, errG, errB, 7/16);
        calculateError(x-1, y+1, errR, errG, errB, 3/16);
        calculateError(x, y+1, errR, errG, errB, 5/16);
        calculateError(x+1, y+1, errR, errG, errB, 1/16);
      }
    }
  }

  
  const drawCanvas = (img, algorithm) => {
    const canvas = canvasRef.current;
    if(!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = img.width;
    let height = img.height;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0);

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    console.log(data); //look

    if(algorithm == "Floyd-Steinberg"){
      floydsteinberg(data, width, height, pallete);
    }
    ctx.putImageData(imageData, 0, 0);
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        loadedImgRef.current = img;
        drawCanvas(img, algorithmSelected);
        setImageSrc(e.target.result);
      }
      img.src = e.target.result;
    }
    reader.readAsDataURL(file)
  }
  const handleAlgorithmChange = (event) => {
    const value = event.target.value;
    setAlgorithmSelected(value);
    if(loadedImgRef.current) {
      drawCanvas(loadedImgRef.current, value);
    }
  }
  const handleExport = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;

    const link = document.createElement("a");
    link.download = "export.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
  // reset buttonii function
 const handleReset = () => {
  setAlgorithmSelected("Original");
  if(loadedImgRef.current) {
    drawCanvas(loadedImgRef.current, "Original");
  }
 }
  return (
    <div>
      <h1>Posterize</h1>

      <div>
        <label>
          Select image:{" "}
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>
      </div>
      <div>
        <label>
          Algorithm:{" "}
          <select value={algorithmSelected} onChange={handleAlgorithmChange}>
            {algorithms.map((option, index) => (
              <option value={option} key={index}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <canvas ref={canvasRef}></canvas>
      </div>
    <div>
    {imageSrc && <button onClick={handleExport}>export</button>}
    {imageSrc && <button onClick={handleReset}>Reset</button>}
    </div>
    </div>
  )
}