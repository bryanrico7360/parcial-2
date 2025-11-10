"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export function FaceLogin({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [recognized, setRecognized] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [message, setMessage] = useState("");

  // 🧠 Cargar modelos
  useEffect(() => {
    async function loadModels() {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsReady(true);
    }
    loadModels();

    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleActivateCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current.play();
          setCameraActive(true);
          setMessage("Alinea tu rostro frente a la cámara");
        };
      }
    } catch (err) {
      console.error("Error al activar cámara:", err);
      setMessage("❌ No se pudo acceder a la cámara. Revisa permisos.");
    }
  };

  useEffect(() => {
    if (!modelsReady || !cameraActive || recognized) return;

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
        faceapi.draw.drawFaceLandmarks(canvas, resized);

if (capturing) {
  setCapturing(false);
  setMessage("Verificando rostro...");
  const embedding = Array.from(detection.descriptor);

  // 🔹 Esperamos la respuesta del backend
  const success = await onCapture(embedding);

  if (success) {
    setRecognized(true);
    setMessage("✅ Rostro reconocido correctamente");
    stopCamera();
  } else {
    setRecognized(false);
    setMessage("❌ Rostro no reconocido. Intenta nuevamente.");
  }
}

      } else {
        setFaceDetected(false);
        if (!recognized) setMessage("Alinea tu rostro frente a la cámara");
      }
    }, 200);

    return () => clearInterval(interval);
  }, [modelsReady, cameraActive, capturing, recognized, onCapture]);

  const handleCapture = () => {
    if (faceDetected) {
      setCapturing(true);
      setMessage("Verificando rostro...");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative w-[320px] h-[240px] rounded-md overflow-hidden border border-gray-400">
        <video
          ref={videoRef}
          width={320}
          height={240}
          muted
          playsInline
          autoPlay
          className={`absolute top-0 left-0 object-cover transform scale-x-[-1] ${
            cameraActive ? "block" : "hidden"
          }`}
        />
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className={`absolute top-0 left-0 transform scale-x-[-1] ${
            cameraActive ? "block" : "hidden"
          }`}
        />
        {!cameraActive && (
          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-600">
            Cámara desactivada
          </div>
        )}
      </div>

      <p
        className={`text-sm font-medium ${
          recognized
            ? "text-green-600"
            : faceDetected
            ? "text-blue-600"
            : "text-gray-600"
        }`}
      >
        {message}
      </p>

      {!cameraActive ? (
        <button
          onClick={handleActivateCamera}
          disabled={!modelsReady}
          className={`px-4 py-1.5 rounded-md text-white font-medium transition ${
            modelsReady
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Activar cámara
        </button>
      ) : (
        !recognized && (
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
        )
      )}
    </div>
  );
}
