"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [imageSrc, setImageSrc] = useState(null);
  const [algorithmSelected, setAlgorithmSelected] = useState("Original");
  const [paletteSelected, setPaletteSelected] = useState("Green");
  const [dependentBackground, setDependentBackground] =
    useState("bg-[#DCE4F3]");
  const [dependentTextColor, setDependentTextColor] =
    useState("text-[#0F380F]");
  const [scanlineInterval, setScanlineInterval] = useState(2);
  const [scanlineDarkness, setScanlineDarkness] = useState(0.5);
  const [isDefault, setIsDefault] = useState(false);
  const [dependentAccentColor, setDependentAccentColor] =
    useState("accent-[#0F380F]");
  const [swappedBackground, setSwappedBackground] =
    useState("hover:bg-[#0F380F]");
  const [swappedTextColor, setSwappedTextColor] = useState(
    "hover:text-[#DCE4F3]",
  );
  const [chromaticSlider, setChromaticSlider] = useState(4);
  const [noiseAmplitude, setNoiseAmplitude] = useState(40);
  // ene deer original nemsen
  const algorithms = [
    "Bayer 4x4",
    "Floyd-Steinberg",
    "Atkinson",
    "Noise",
    "Original",
  ];
  const [effects, setEffects] = useState({
    scanlines: false,
    chromaticAberration: false,
    invert: false,
  });
  const canvasRef = useRef(null);
  const loadedImgRef = useRef(null);
  const palettes = {
    Green: [
      [15, 56, 15],
      [48, 98, 48],
      [139, 172, 15],
      [155, 188, 15],
    ],
    Gray: [
      [25, 25, 25],
      [105, 105, 105],
      [175, 175, 175],
      [235, 235, 235],
    ],
    Neon: [
      [5, 0, 15],
      [255, 0, 235],
      [0, 255, 255],
      [255, 255, 255],
    ],
    Brown: [
      [68, 36, 12],
      [137, 90, 48],
      [202, 156, 110],
      [242, 223, 198],
    ],
    Red: [
      [15, 0, 0],
      [115, 0, 0],
      [225, 0, 0],
      [255, 140, 140],
    ],
    Blue: [
      [0, 0, 15],
      [0, 0, 115],
      [0, 0, 225],
      [140, 140, 255],
    ],
  };

  //before and after toggle
  const handleDefault = () => {
    if (isDefault === true) {
      setIsDefault(false);
      drawCanvas(loadedImgRef.current, algorithmSelected, paletteSelected);
    } else if (algorithmSelected === "Original") {
      return;
    } else {
      drawCanvas(loadedImgRef.current, "Original");
      setIsDefault(true);
    }
    console.log(isDefault);
  };

  //dependent backgroundcolor
  const changeBackground = () => {
    if (algorithmSelected === "Original") {
      setDependentBackground("bg-[#DCE4F3]");
      setSwappedTextColor("hover:text-[#DCE4F3]");
    }
    if (algorithmSelected != "Original") {
      if (paletteSelected === "Green") {
        setDependentBackground("bg-[#8BAC0F]");
        setSwappedTextColor("hover:text-[#8BAC0F]");
      }
      if (paletteSelected === "Gray") {
        setDependentBackground("bg-[#343434]");
        setSwappedTextColor("hover:text-[#343434]");
      }
      if (paletteSelected === "Neon") {
        setDependentBackground("bg-[#ff3864]");
        setSwappedTextColor("hover:text-[#ff3864]");
      }
      if (paletteSelected === "Brown") {
        setDependentBackground("bg-[#895a30]");
        setSwappedTextColor("hover:text-[#895a30]");
      }
      if (paletteSelected === "Red") {
        setDependentBackground("bg-[#700000]");
        setSwappedTextColor("hover:text-[#700000]");
      }
      if (paletteSelected === "Blue") {
        setDependentBackground("bg-[#00004b]");
        setSwappedTextColor("hover:text-[#00004b]");
      }
    }
  };
  const changeTextColor = () => {
    if (algorithmSelected === "Original") {
      setDependentTextColor("text-blue-700");
      setDependentAccentColor("accent-blue-700");
      setSwappedBackground("hover:bg-blue-700");
    }
    if (algorithmSelected != "Original") {
      if (paletteSelected === "Green") {
        setDependentTextColor("text-[#0F380F]");
        setDependentAccentColor("accent-[#0F380F]");
        setSwappedBackground("hover:bg-[#0F380F]");
      }
      if (paletteSelected === "Gray") {
        setDependentTextColor("text-gray-400");
        setDependentAccentColor("accent-gray-400");
        setSwappedBackground("hover:bg-gray-400");
      }
      if (paletteSelected === "Neon") {
        setDependentTextColor("text-cyan-500");
        setDependentAccentColor("accent-cyan-500");
        setSwappedBackground("hover:bg-cyan-500");
      }
      if (paletteSelected === "Brown") {
        setDependentTextColor("text-gray-300");
        setDependentAccentColor("accent-gray-300");
        setSwappedBackground("hover:bg-gray-300");
      }
      if (paletteSelected === "Red") {
        setDependentTextColor("text-[#ff3864]");
        setDependentAccentColor("accent-[#ff3864]");
        setSwappedBackground("hover:bg-[#ff3864]");
      }
      if (paletteSelected === "Blue") {
        setDependentTextColor("text-[#1212b2]");
        setDependentAccentColor("accent-[#1212b2]");
        setSwappedBackground("hover:bg-[#1212b2]");
      }
    }
  };
  useEffect(() => {
    changeBackground();
    changeTextColor();
  }, [paletteSelected, algorithmSelected]);

  const findClosestColor = (r, g, b, pallete) => {
    let minDistance = Infinity;
    let closestColor = pallete[0];

    for (let i = 0; i < pallete.length; i++) {
      const [pr, pg, pb] = pallete[i];
      const distance = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = pallete[i];
      }
    }
    return closestColor;
  };
  //algorithms
  const floydsteinberg = (data, width, height, pallete) => {
    const calculateError = (nx, ny, errR, errG, errB, factor) => {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        let nIdx = (ny * width + nx) * 4;
        data[nIdx] += errR * factor;
        data[nIdx + 1] += errG * factor;
        data[nIdx + 2] += errB * factor;
      }
    };
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
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

        calculateError(x + 1, y, errR, errG, errB, 7 / 16);
        calculateError(x - 1, y + 1, errR, errG, errB, 3 / 16);
        calculateError(x, y + 1, errR, errG, errB, 5 / 16);
        calculateError(x + 1, y + 1, errR, errG, errB, 1 / 16);
      }
    }
  };
  const bayer4x4 = (data, width, height, pallete) => {
    const bayer4x4 = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let index = (y * width + x) * 4;

        const matrix = bayer4x4[y % 4][x % 4];
        const num = (matrix / 16 - 0.5) * 64;

        let r = Math.min(255, Math.max(0, data[index] + num));
        let g = Math.min(255, Math.max(0, data[index + 1] + num));
        let b = Math.min(255, Math.max(0, data[index + 2] + num));

        const [newR, newG, newB] = findClosestColor(r, g, b, pallete);

        data[index] = newR;
        data[index + 1] = newG;
        data[index + 2] = newB;
      }
    }
  };

  const atkinson = (data, width, height, pallete) => {
    const calculateError = (nx, ny, errR, errG, errB, factor) => {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        let nIdx = (ny * width + nx) * 4;
        data[nIdx] += errR * factor;
        data[nIdx + 1] += errG * factor;
        data[nIdx + 2] += errB * factor;
      }
    };
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
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

        calculateError(x + 1, y, errR, errG, errB, 1 / 8);
        calculateError(x + 2, y, errR, errG, errB, 1 / 8);
        calculateError(x - 1, y + 1, errR, errG, errB, 1 / 8);
        calculateError(x, y + 1, errR, errG, errB, 1 / 8);
        calculateError(x + 1, y + 1, errR, errG, errB, 1 / 8);
        calculateError(x, y + 2, errR, errG, errB, 1 / 8);
      }
    }
  };
  const noise = (data, width, height, pallete, amplificiation = 40) => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
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
  };
  //effects
  const scanlines = (height, width, data, interval = 2, darkness = 0.5) => {
    //will make interval and darkness changable after frontend
    for (let y = 0; y < height; y++) {
      if (y % interval === 0) {
        for (let x = 0; x < width; x++) {
          let index = (y * width + x) * 4;
          data[index] *= darkness;
          data[index + 1] *= darkness; // g
          data[index + 2] *= darkness; // b
        }
      }
    }
  };
  const chromaticAberration = (height, width, data, movement = 4) => {
    const original = new Uint8ClampedArray(data);

    const getIndex = (x, y) => (y * width + x) * 4;
    const clampX = (x) => Math.min(width - 1, Math.max(0, x));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
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
  };
  const invert = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
  };
  const drawCanvas = (
    img,
    algorithm,
    selectedPalette,
    interval = scanlineInterval,
    darkness = scanlineDarkness,
    activeEffects = effects,
    movement = chromaticSlider,
    amplitude = noiseAmplitude,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = img.width;
    let height = img.height;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0);
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const activePalette = palettes[selectedPalette];
    if (activeEffects.invert) invert(data);
    if (algorithm == "Floyd-Steinberg") {
      floydsteinberg(data, width, height, activePalette);
    } else if (algorithm == "Bayer 4x4") {
      bayer4x4(data, width, height, activePalette);
    } else if (algorithm == "Atkinson") {
      atkinson(data, width, height, activePalette);
    } else if (algorithm == "Noise") {
      noise(data, width, height, activePalette, amplitude);
    }
    if (activeEffects.scanlines) {
      scanlines(height, width, data, interval, darkness);
    }
    if (activeEffects.chromaticAberration)
      chromaticAberration(height, width, data, movement);
    ctx.putImageData(imageData, 0, 0);
  };
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        loadedImgRef.current = img;
        drawCanvas(
          img,
          algorithmSelected,
          paletteSelected,
          scanlineInterval,
          scanlineDarkness,
          effects,
          chromaticSlider,
        );
        setImageSrc(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };
  const handleAlgorithmChange = (event) => {
    const value = event.target.value;
    setAlgorithmSelected(value);
    if (loadedImgRef.current) {
      drawCanvas(
        loadedImgRef.current,
        value,
        paletteSelected,
        scanlineInterval,
        scanlineDarkness,
        effects,
      );
    }
  };
  // unguu solidog function
  const handlePaletteChange = (event) => {
    const value = event.target.value;
    setPaletteSelected(value);
    if (loadedImgRef.current) {
      drawCanvas(loadedImgRef.current, algorithmSelected, value);
    }
  };
  const handleEffectToggle = (effectName) => {
    const updated = { ...effects, [effectName]: !effects[effectName] };
    setEffects(updated);
    if (loadedImgRef.current) {
      drawCanvas(
        loadedImgRef.current,
        algorithmSelected,
        paletteSelected,
        scanlineInterval,
        scanlineDarkness,
        updated,
      );
    }
  };
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "export.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  // reset buttonii function
  const handleReset = () => {
    setAlgorithmSelected("Original");
    if (loadedImgRef.current) {
      drawCanvas(loadedImgRef.current, "Original", paletteSelected);
    }
  };
  return (
    <div
      className={`${dependentBackground} ${dependentTextColor} w-screen min-h-screen transition-all duration-100`}
    >
      <div>
        <h1 className="font-mono font-bold text-5xl p-10">Posterizer</h1>
      </div>
      <div className="p-10">
        <div className={`bg-gray-400 w-5xl m-5 box-border`}>
          <canvas className="w-5xl" ref={canvasRef}></canvas>
        </div>
        <div className=" flex border-4 pt-5 flex-col p-5 gap-2.5 text-2xl justify-between w-3xl fixed right-0 top-0 h-screen">
          <div className="flex flex-col gap-5">
            <div>
              <label className="flex flex-col gap-2">
                Image{" "}
                <input
                  className={`border-2 hover:cursor-pointer hover:opacity-80`}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div>
              <label className="flex flex-col gap-2">
                Algorithm:{" "}
                <select
                  className={` border-2 hover:cursor-pointer hover:opacity-80 ${dependentBackground} ${dependentTextColor}`}
                  value={algorithmSelected}
                  onChange={handleAlgorithmChange}
                >
                  {algorithms.map((option, index) => (
                    <option value={option} key={index}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              {algorithmSelected != "Original" && (
                <label className="flex flex-col gap-2">
                  Palette:{" "}
                  <select
                    className={`${dependentBackground} ${dependentTextColor} hover:cursor-pointer hover:opacity-80 border-2`}
                    value={paletteSelected}
                    onChange={handlePaletteChange}
                  >
                    {Object.keys(palettes).map((key, index) => (
                      <option className="border-8" value={key} key={index}>
                        {key}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </div>
          <div className="flex gap-3 p-3 justify-between items-center flex-wrap">
            <div>
              <label className="flex gap-2 items-center">
                <input
                  className={`${dependentAccentColor} hover:cursor-pointer w-5 h-5`}
                  type="checkbox"
                  checked={effects.scanlines}
                  onChange={() => handleEffectToggle("scanlines")}
                />
                Scanlines
              </label>
            </div>
            <div>
              <label className="flex gap-2 items-center">
                <input
                  className={`${dependentAccentColor} hover:cursor-pointer w-5 h-5`}
                  type="checkbox"
                  checked={effects.chromaticAberration}
                  onChange={() => handleEffectToggle("chromaticAberration")}
                />
                Chromatic Aberration
              </label>
            </div>
            <div>
              <label className="flex gap-2 items-center">
                <input
                  className={`${dependentAccentColor} hover:cursor-pointer w-5 h-5`}
                  type="checkbox"
                  checked={effects.invert}
                  onChange={() => handleEffectToggle("invert")}
                />
                Invert
              </label>
            </div>
          </div>
          <div>
            <label className="flex flex-col">
              ScanLine Gap: {scanlineInterval}
              <input
                className={`${dependentAccentColor}`}
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={scanlineInterval}
                onChange={(e) => {
                  setScanlineInterval(Number(e.target.value));
                }}
                onMouseUp={(e) => {
                  const val = Number(e.target.value);
                  if (loadedImgRef.current)
                    drawCanvas(
                      loadedImgRef.current,
                      algorithmSelected,
                      paletteSelected,
                      val,
                      scanlineDarkness,
                    );
                }}
              />
            </label>
          </div>
          <div>
            <label className="flex flex-col">
              Scanline Darkness: {scanlineDarkness}
              <input
                className={`${dependentAccentColor}`}
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={scanlineDarkness}
                onChange={(e) => {
                  setScanlineDarkness(Number(e.target.value));
                }}
                onMouseUp={(e) => {
                  const val = Number(e.target.value);
                  if (loadedImgRef.current)
                    drawCanvas(
                      loadedImgRef.current,
                      algorithmSelected,
                      paletteSelected,
                      scanlineInterval,
                      val,
                    );
                }}
              />
            </label>
          </div>
          <div>
            <label className="flex flex-col">
              Chromatic Aberration Shift: {chromaticSlider}
              <input
                className={`${dependentAccentColor}`}
                type="range"
                min="1"
                max="20"
                step="1"
                value={chromaticSlider}
                onChange={(e) => {
                  setChromaticSlider(Number(e.target.value));
                }}
                onMouseUp={(e) => {
                  const val = Number(e.target.value);
                  if (loadedImgRef.current)
                    drawCanvas(
                      loadedImgRef.current,
                      algorithmSelected,
                      paletteSelected,
                      scanlineInterval,
                      scanlineDarkness,
                      effects,
                      val,
                      noiseAmplitude,
                    );
                }}
              />
            </label>
          </div>
          <div>
            <label className="flex flex-col">
              noise amplitude: {noiseAmplitude}
              <input
                className={`${dependentAccentColor}`}
                type="range"
                min="0"
                max="100"
                step="1"
                value={noiseAmplitude}
                onChange={(e) => {
                  setNoiseAmplitude(Number(e.target.value));
                }}
                onMouseUp={(e) => {
                  const val = Number(e.target.value);
                  if (loadedImgRef.current) {
                    drawCanvas(
                      loadedImgRef.current,
                      algorithmSelected,
                      paletteSelected,
                      scanlineInterval,
                      scanlineDarkness,
                      effects,
                      chromaticSlider,
                      val,
                    );
                  }
                }}
              />
            </label>
          </div>

          <div className="flex flex-col text-4xl gap-5">
            {imageSrc && (
              <button
                className={`border-4 hover:cursor-pointer ${swappedBackground} ${swappedTextColor} transition-all duration-300 hover:p-2`}
                onClick={handleDefault}
              >
                {isDefault === true || algorithmSelected === "Original"
                  ? "Before"
                  : "After"}
              </button>
            )}
            {imageSrc && (
              <button
                className={`border-4 hover:cursor-pointer ${swappedBackground} ${swappedTextColor} transition-all duration-300 hover:p-2`}
                onClick={handleReset}
              >
                Reset
              </button>
            )}
            {imageSrc && (
              <button
                className={`border-4 hover:cursor-pointer ${swappedBackground} ${swappedTextColor} transition-all duration-300 hover:p-2`}
                onClick={handleExport}
              >
                Export
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
