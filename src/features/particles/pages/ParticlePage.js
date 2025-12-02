import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { getTextParticles } from '../utils/textToPoints';

// 粒子總數
const PARTICLE_COUNT = 2000;
// 文字配置
const TEXT_MAP = {
  1: '林黛玉',
  2: 'Betsy',
  3: '贾宝玉',
};

function ParticlePage() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // 用於存儲 Three.js 的對象
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);
  
  // 狀態管理
  const [gesture, setGesture] = useState(1);
  const [pinchDistance, setPinchDistance] = useState(1); // 1 為正常大小
  const [status, setStatus] = useState('正在加載模型...');

  // 目標位置緩衝區（粒子要飛去的地方）
  const targetPositionsRef = useRef(new Float32Array(PARTICLE_COUNT * 3));

  // 初始化 Three.js 場景
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    // 增加一點霧氣效果
    scene.fog = new THREE.FogExp2(0x050505, 0.02);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // 4. Particles (BufferGeometry)
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    // 初始隨機位置
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      // 初始青色
      colors[i * 3] = 0.1;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 0.9;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 存入 Ref
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    particlesRef.current = particles;

    // 初始化第一個文字的目標位置
    updateTargetText(1);

    // 動畫循環
    const animate = () => {
      requestAnimationFrame(animate);
      
      // 粒子平滑移動邏輯
      const positions = particles.geometry.attributes.position.array;
      const target = targetPositionsRef.current;
      
      // 从 Ref 中读取当前的扩散系数（根据手势动态变化）
      const currentScale = pinchDistanceRef.current || 1;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const tx = target[i * 3] * currentScale;
        const ty = target[i * 3 + 1] * currentScale;
        const tz = target[i * 3 + 2] * currentScale;

        // Lerp (Linear Interpolation) - 讓粒子慢慢飛過去
        positions[i * 3] += (tx - positions[i * 3]) * 0.08;
        positions[i * 3 + 1] += (ty - positions[i * 3 + 1]) * 0.08;
        positions[i * 3 + 2] += (tz - positions[i * 3 + 2]) * 0.08;
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      
      // 讓粒子群整體緩慢旋轉
      particles.rotation.y += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // 處理窗口大小調整
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
    };
  }, []); // 空依賴數組，只初始化一次

  // 使用 Ref 來追蹤 pinchDistance，以便在 animate 循環中讀取最新值
  const pinchDistanceRef = useRef(1);
  useEffect(() => {
    pinchDistanceRef.current = pinchDistance;
  }, [pinchDistance]);

  // 當手勢變化時，更新目標文字
  useEffect(() => {
    updateTargetText(gesture);
  }, [gesture]);

  const updateTargetText = (gestureId) => {
    const text = TEXT_MAP[gestureId] || TEXT_MAP[1];
    const newTargets = getTextParticles(text, 120);
    
    // 如果文字像素点少于粒子数，循环复用；如果多于粒子数，只取前面部分
    const textPointCount = newTargets.length / 3; // 文字有多少个点
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 循环使用文字点（避免越界）
      const targetIndex = i % textPointCount;
      targetPositionsRef.current[i * 3] = newTargets[targetIndex * 3] || 0;
      targetPositionsRef.current[i * 3 + 1] = newTargets[targetIndex * 3 + 1] || 0;
      targetPositionsRef.current[i * 3 + 2] = newTargets[targetIndex * 3 + 2] || 0;
    }
  };

  // 初始化 MediaPipe
  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    if (
      typeof  window !== 'undefined' &&
      videoRef.current
    ) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start().then(() => setStatus('攝像頭已啟動，請舉起手'));
    }
  }, []);

  // 手勢識別核心邏輯
  const onResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    // 繪製輔助線（可選，為了調試）
    const ctx = canvasRef.current.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      // 畫出手部骨架
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
      drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1 });

      // 1. 檢測張合（拇指指尖 4 和 食指指尖 8 的距離）
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const distance = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) + 
        Math.pow(thumbTip.y - indexTip.y, 2)
      );
      
      // 映射距离到缩放系数 (距离通常在 0.05 到 0.3 之间)
      // 我们希望张开时(0.3) scale=1.5，合拢时(0.05) scale=0.2
      let scale = (distance - 0.05) * 5; 
      if (scale < 0.2) scale = 0.2;
      if (scale > 2.5) scale = 2.5;
      setPinchDistance(scale);

      // 2. 檢測手勢 (1, 2, 3)
      // 簡單算法：判斷指尖是否高於指關節 (y 坐標更小)
      const isIndexUp = landmarks[8].y < landmarks[6].y;
      const isMiddleUp = landmarks[12].y < landmarks[10].y;
      const isRingUp = landmarks[16].y < landmarks[14].y;
      const isPinkyUp = landmarks[20].y < landmarks[18].y;

      let count = 0;
      if (isIndexUp) count++;
      if (isMiddleUp) count++;
      if (isRingUp) count++;
      if (isPinkyUp) count++;

      // 映射手指數量到特定文字
      if (count === 1) setGesture(1); // 食指 -> 雲智慧
      else if (count === 2) setGesture(2); // 剪刀手 -> Betsy
      else if (count >= 3) setGesture(3); // 三指 -> 加油
    }
    ctx.restore();
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Three.js 容器 */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* 狀態提示 */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: '#00ffff',
        background: 'rgba(0,0,0,0.6)',
        padding: '1rem',
        borderRadius: 8,
        pointerEvents: 'none',
        fontFamily: 'monospace'
      }}>
        <h3>交互式粒子系統</h3>
        <p>状态: {status}</p>
        <p>当前手势: {gesture} ({TEXT_MAP[gesture]})</p>
        <p>扩散系数: {pinchDistance.toFixed(2)}</p>
        <small>
          1. 举起 1/2/3 根手指切换文字<br/>
          2. 拇指食指张合控制粒子缩放
        </small>
      </div>

      {/* 隱藏的 Video 元素 (MediaPipe 需要) */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
      />

      {/* 調試用 Canvas (顯示攝像頭畫面，放在右下角) */}
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 160,
          height: 120,
          border: '2px solid #333',
          borderRadius: 8,
          opacity: 0.7
        }}
      />
    </div>
  );
}

export default ParticlePage;

