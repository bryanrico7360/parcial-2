"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { motion } from "framer-motion";

export function FaceRegister({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState(false);
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
    } catch {
      setMessage("❌ No se pudo acceder a la cámara. Revisa los permisos.");
    }
  };

  useEffect(() => {
    if (!modelsReady || !cameraActive || captured) return;

    let hasCaptured = false;
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
          if (detection.descriptor) {
            hasCaptured = true;
            setCapturing(false);
            setCaptured(true);
            setMessage("✅ Rostro capturado correctamente");
            onCapture(Array.from(detection.descriptor));
            stopCamera();
          } else {
            setMessage("⚠ No se pudo capturar el rostro. Intenta nuevamente.");
          }
        }
      } else {
        setFaceDetected(false);
        if (!captured) setMessage("Alinea tu rostro frente a la cámara");
      }
    }, 200);

    return () => clearInterval(interval);
  }, [modelsReady, cameraActive, capturing, captured, onCapture]);

  const handleCapture = () => {
    if (faceDetected && !captured) {
      setCapturing(true);
      setMessage("Capturando rostro...");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative w-[320px] h-[240px] rounded-md overflow-hidden border border-gray-400 shadow-md">
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
        className={`text-sm font-medium text-center ${
          captured
            ? "text-green-600"
            : faceDetected
            ? "text-blue-600"
            : "text-gray-600"
        }`}
      >
        {message}
      </p>

      {/* 🎨 Botones con animación y estilo unificado */}
      {!cameraActive ? (
        <motion.button
          onClick={handleActivateCamera}
          disabled={!modelsReady}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-xl font-semibold shadow-md text-white transition cursor-pointer ${
            modelsReady
              ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:brightness-110"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Activar cámara
        </motion.button>
      ) : (
        !captured && (
          <motion.button
            onClick={handleCapture}
            disabled={!faceDetected}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-xl font-semibold shadow-md text-white transition cursor-pointer ${
              faceDetected
                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:brightness-110"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Capturar rostro
          </motion.button>
        )
      )}
    </div>
  );
}
