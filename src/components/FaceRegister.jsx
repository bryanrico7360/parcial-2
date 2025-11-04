"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export function FaceRegister({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [message, setMessage] = useState("");

  // 🧠 Carga de modelos
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

    return () => {
      const v = videoRef.current;
      if (v && v.srcObject) v.srcObject.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // 🎥 Activar cámara
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
      console.error("Error al activar la cámara:", err);
      setMessage("❌ No se pudo acceder a la cámara. Revisa los permisos.");
    }
  };

  // 🔍 Detección facial con control estricto de captura
  useEffect(() => {
    if (!modelsReady || !cameraActive || captured) return;

    let hasCaptured = false; // 🔒 evita capturas duplicadas
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

        if (capturing && !hasCaptured) {
          hasCaptured = true;
          setCapturing(false);
          setCaptured(true);
          setMessage("✅ Rostro capturado correctamente");
          onCapture(Array.from(detection.descriptor));
        }
      } else {
        setFaceDetected(false);
        if (!captured) setMessage("Alinea tu rostro frente a la cámara");
      }
    }, 200);

    return () => clearInterval(interval);
  }, [modelsReady, cameraActive, capturing, captured, onCapture]);

  // 📸 Capturar rostro
  const handleCapture = () => {
    if (faceDetected && !captured) {
      setCapturing(true);
      setMessage("Capturando rostro...");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative w-[320px] h-[240px] rounded-md overflow-hidden border border-gray-400">
        {/* Cámara espejo */}
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
        {/* Canvas espejo alineado */}
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

      {/* Mensaje dinámico */}
      <p
        className={`text-sm font-medium ${
          captured
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
        !captured && (
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
