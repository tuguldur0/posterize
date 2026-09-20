"use client";

import { useRef, useState } from "react";

export default function Home() {
  const [imageSrc, setImageSrc] = useState(null);
  const [algorithmSelected, setAlgorithmSelected] = useState("Floyd-Steinberg");
  const [paletteSelected, setPaletteSelected] = useState("Green");
  const [scanlineInterval, setScanlineInterval] = useState(2);
  const [scanlineDarkness, setScanlineDarkness] = useState(0.5);
  // ene deer original nemsen
  const algorithms = ["Bayer 4x4", "Floyd-Steinberg","Atkinson", "Noise", "Original"];
  const [effects, setEffects] = useState({
    scanlines: false,
    chromaticAberration: false,
  });
  const canvasRef = useRef(null);
  const loadedImgRef = useRef(null);
  const palettes = {
    "Green": [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15],
    ],
    "Gray": [
      [25, 25, 25],
      [105, 105, 105],
      [175, 175, 175],
      [235, 235, 235],
    ],
    "Neon": [
      [5, 0, 15],
      [255, 0, 235],
      [0, 255, 255],
      [255, 255 , 255],
    ],
    "Brown": [
      [68, 36, 12],
      [137, 90, 48],
      [202, 156, 110],
      [242, 223, 198],
    ],
    "Red": [
      [15, 0, 0],
      [115, 0, 0],
      [225, 0, 0],
      [255, 140, 140],
    ],
    "Blue": [
      [0, 0, 15],
      [0,0, 115],
      [0, 0, 225],
      [140, 140, 255],
    ]

  };

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
//algorithms
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
  const bayer4x4 = (data, width, height, pallete) => {
    const bayer4x4 = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ]

    for(let y = 0; y < height; y++){
      for (let x = 0; x < width; x++) {
        let index = (y * width + x) * 4;

        const matrix = bayer4x4[y % 4][x % 4];
        const num = (matrix / 16 - 0.5) * 64;

        let r = Math.min(255, Math.max(0, data[index] + num))
        let g = Math.min(255, Math.max(0, data[index + 1] + num))
        let b = Math.min(255, Math.max(0, data[index + 2] + num))
        
        const [newR, newG, newB] = findClosestColor(r, g, b, pallete);

        data[index] = newR;
        data[index + 1] = newG;
        data[index + 2] = newB;
      }
    }
  };

  const atkinson = (data, width, height, pallete) => {
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
  
        calculateError(x+1, y, errR, errG, errB, 1/8);
        calculateError(x+2, y, errR, errG, errB, 1/8);
        calculateError(x-1, y+1, errR, errG, errB, 1/8);
        calculateError(x, y+1, errR, errG, errB, 1/8);
        calculateError(x+1, y+1, errR, errG, errB, 1/8);
        calculateError(x, y+2, errR, errG, errB, 1/8);
      }
    }
  }
  const noise = (data, width, height, pallete, amplificiation = 40) => {
    for(let y = 0; y < height; y++){
      for(let x = 0; x < width; x++){
        let index = (y * width + x) * 4;

        let noise = (Math.random() - 0.5) * 2 * amplificiation;

        let r = data[index] + noise;
        let g = data[index + 1] + noise;
        let b = data[index + 2] + noise;

        const [newR, newG, newB] = findClosestColor(r, g, b, pallete);

        data[index] = newR;
        data[index + 1] = newG;
        data[index + 2] = newB;
      }
    }
  }
  //effects
  const scanlines = (height, width, data, interval = 2, darkness = 0.5) => { //will make interval and darkness changable after frontend
    for(let y = 0; y < height; y++){
      if(y % interval === 0) {
        for(let x=0; x <width; x++ ){
          let index = (y * width + x) * 4;
          data[index] *= darkness; 
          data[index + 1] *= darkness; // g
          data[index + 2] *= darkness; // b
        }
      }
    }
  }
  const chromaticAberration = (height, width, data, movement = 4) => {
    const original = new Uint8ClampedArray(data);

    const getIndex = (x, y) => (y * width + x) * 4;
    const clampX = (x) => Math.min(width-1, Math.max(0,x));

    for(let y = 0; y < height; y++){
      for(let x = 0; x < width; x++){
        const outIndex = getIndex(x, y);

        const rX = clampX(x + movement);
        const rIndex = getIndex(rX, y);

        const bX = clampX(x - movement);
        const bIndex = getIndex(bX, y);

        const gIndex = outIndex;

        data[outIndex] = original[rIndex];
        data[outIndex + 1] = original[gIndex + 1];
        data[outIndex + 2] = original[bIndex + 2];
      }
    }
  }
  const drawCanvas = (img, algorithm, selectedPalette, interval = scanlineInterval, darkness = scanlineDarkness, activeEffects = effects)  => {
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
    const activePalette = palettes[selectedPalette];
    if(algorithm == "Floyd-Steinberg"){
      floydsteinberg(data, width, height, activePalette);
    } else if (algorithm == "Bayer 4x4"){
      bayer4x4(data, width, height, activePalette);
    } else if (algorithm == "Atkinson"){
      atkinson(data, width, height, activePalette);
    } else if (algorithm == "Noise"){
      noise(data, width, height, activePalette)
    }
    if(activeEffects.scanlines){
      scanlines(height, width, data, interval, darkness);
    }
    if(activeEffects.chromaticAberration) chromaticAberration(height, width, data)
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
        drawCanvas(img, algorithmSelected, paletteSelected, scanlineInterval, scanlineDarkness, effects);
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
      drawCanvas(loadedImgRef.current, value, paletteSelected, scanlineInterval,scanlineDarkness, effects);
    }
  }
  // unguu solidog function
  const handlePaletteChange = (event) => {
    const value = event.target.value;
    setPaletteSelected(value);
    if (loadedImgRef.current) {
      drawCanvas(loadedImgRef.current, algorithmSelected, value);
    }
  }
  const handleEffectToggle = (effectName) => {
    const updated = {...effects, [effectName]: !effects[effectName]};
    setEffects(updated);
    if(loadedImgRef.current){
      drawCanvas(loadedImgRef.current, algorithmSelected, paletteSelected, scanlineInterval, scanlineDarkness, updated)
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
    drawCanvas(loadedImgRef.current, "Original", paletteSelected);
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
        <label>
          Palette:{" "}
          <select value={paletteSelected} onChange={handlePaletteChange}>
            {Object.keys(palettes).map((key, index) =>(
              <option value={key} key={index}>{key}</option>
            ))}
          </select>
        </label> 
      </div>
      <div>
        <label>
          ScanLine Gap: {scanlineInterval}
          <input type="range" min="1" max="10" step="1" value={scanlineInterval} onChange={(e) => {
            setScanlineInterval(Number(e.target.value));
          }} onMouseUp={(e) => {
            const val = Number(e.target.value);
            if(loadedImgRef.current) drawCanvas(loadedImgRef.current, algorithmSelected, paletteSelected, val, scanlineDarkness);
          }}/>
        </label>
      </div>
      <div>
        <label>
          Scanline Darkness: {scanlineDarkness} 
          <input type="range" min="0" max="1" step="0.1" value={scanlineDarkness} onChange={(e) => {
            setScanlineDarkness(Number(e.target.value));
          }} onMouseUp={(e) => {
            const val = Number(e.target.value);
            if(loadedImgRef.current) drawCanvas(loadedImgRef.current, algorithmSelected, paletteSelected, scanlineInterval, val);

          }} />
        </label>
      </div>
      <div>
        <label>
          <input type="checkbox" checked={effects.scanlines} onChange={() => handleEffectToggle("scanlines")}/>
          scanlines
        </label>
      </div>
      <div>
        <label>
          <input type="checkbox" checked={effects.chromaticAberration} onChange={() => handleEffectToggle("chromaticAberration")}/>
          Chromatic aberration
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