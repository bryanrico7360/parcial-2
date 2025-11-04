"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export function FaceRegister({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadModels() {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      if (!mounted) return;
      setLoaded(true);
      startCamera();
    }

    loadModels();

    // cleanup
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const v = videoRef.current;
      if (v && v.srcObject) {
        v.srcObject.getTracks().forEach((t) => t.stop());
        v.srcObject = null;
      }
      window.removeEventListener("resize", adjustCanvasSize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = videoRef.current;
      if (!video) return;

      if (video.srcObject !== stream) video.srcObject = stream;

      // Manejo de AbortError
      try {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === "function") {
          await playPromise.catch((err) => {
            if (err.name !== "AbortError") console.error("video.play error:", err);
          });
        }
      } catch (err) {
        if (err.name !== "AbortError") console.error("video.play error:", err);
      }

      video.onloadedmetadata = () => {
        adjustCanvasSize();
        runDetectionLoop();
      };

      window.addEventListener("resize", adjustCanvasSize);
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      alert("No se pudo acceder a la cámara. Revisa permisos.");
    }
  };

  const adjustCanvasSize = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const rect = video.getBoundingClientRect();
    const displayWidth = Math.round(rect.width);
    const displayHeight = Math.round(rect.height);

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    faceapi.matchDimensions(canvas, { width: displayWidth, height: displayHeight });
  };

  const runDetectionLoop = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const rect = video.getBoundingClientRect();
    const displaySize = { width: Math.round(rect.width), height: Math.round(rect.height) };

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    const resized = faceapi.resizeResults(detections, displaySize);

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceLandmarks(canvas, resized);

    rafRef.current = requestAnimationFrame(runDetectionLoop);
  };

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video) return;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert("No se detectó ningún rostro, intenta de nuevo.");
      return;
    }

    onCapture(Array.from(detection.descriptor));
  };

  return (
    <div className="flex flex-col items-center space-y-3 relative">
      <div className="relative rounded-md overflow-hidden" style={{ width: 320, height: 240 }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            transform: "scaleX(-1)",
            objectFit: "cover",
            display: "block",
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 rounded-md"
          style={{ transform: "scaleX(-1)", pointerEvents: "none" }}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          adjustCanvasSize();
          handleCapture();
        }}
        disabled={!loaded}
        className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Capturar rostro
      </button>
    </div>
  );
}
