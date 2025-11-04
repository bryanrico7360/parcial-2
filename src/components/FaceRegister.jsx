"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export function FaceRegister({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    async function setup() {
      const MODEL_URL = "/models";

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setReady(true);
    }

    setup();
  }, []);

  useEffect(() => {
    if (!ready || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: 320, height: 240 };

    faceapi.matchDimensions(canvas, displaySize);

    const interval = setInterval(async () => {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {
        setFaceDetected(true);
        const resized = faceapi.resizeResults(detection, displaySize);

        // 🟢 Solo dibuja puntos del rostro (sin recuadro ni número)
        faceapi.draw.drawFaceLandmarks(canvas, resized);

        if (capturing) {
          onCapture(Array.from(detection.descriptor));
          setCapturing(false);
          alert("✅ Rostro capturado correctamente");
        }
      } else {
        setFaceDetected(false);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [ready, capturing, onCapture]);

  const handleCapture = () => {
    setCapturing(true);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-[320px] h-[240px] rounded-md overflow-hidden border border-gray-400">
        {/* 🎥 Cámara espejo */}
        <video
          ref={videoRef}
          width={320}
          height={240}
          muted
          autoPlay
          className="absolute top-0 left-0 object-cover transform scale-x-[-1]"
        />
        {/* 🟩 Canvas también en espejo (alineado con video) */}
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="absolute top-0 left-0 transform scale-x-[-1]"
        />
      </div>

      <p
        className={`text-sm ${
          faceDetected ? "text-green-600" : "text-gray-500"
        }`}
      >
        {faceDetected
          ? "Rostro detectado — listo para capturar"
          : "Alinea tu rostro frente a la cámara"}
      </p>

      <button
        onClick={handleCapture}
        disabled={!faceDetected}
        className={`px-4 py-1.5 rounded-md text-white font-medium transition ${
          faceDetected
            ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Capturar rostro
      </button>
    </div>
  );
}
