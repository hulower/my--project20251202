import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { getTextParticles } from '../utils/textToPoints';

const ParticleSystem = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('初始化中...');

  // 系統狀態 Ref（避免閉包陷阱）
  const stateRef = useRef({
    handLandmarker: null,
    particles: null,
    targetPositions: null, // Float32Array
    currentPositions: null, // Float32Array
    velocities: null, // Float32Array
    mode: 'float', // 'float' | 'text'
    expansion: 1.0, // 擴散係數
    handDistance: 0, // 雙手距離
  });

  useEffect(() => {
    let scene, camera, renderer, material, geometry, points;
    let animationId;

    // 1. 初始化 Three.js
    const initThree = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 30;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current.appendChild(renderer.domElement);

      // 創建初始粒子 (最多 10000 個)
      const particleCount = 10000;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

        colors[i * 3] = 0.2; // R
        colors[i * 3 + 1] = 0.8; // G
        colors[i * 3 + 2] = 1.0; // B
      }

      geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);

      stateRef.current.particles = points;
      stateRef.current.currentPositions = positions;
      stateRef.current.targetPositions = new Float32Array(positions); // 初始目標就是當前位置
      stateRef.current.velocities = new Float32Array(particleCount * 3).fill(0);
    };

    // 2. 初始化 MediaPipe
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });
        stateRef.current.handLandmarker = handLandmarker;
        setStatus('請允許攝像頭權限...');
        startWebcam();
      } catch (error) {
        console.error(error);
        setStatus('模型加載失敗');
      }
    };

    // 3. 啟動攝像頭
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', () => {
            setLoading(false);
            setStatus('準備就緒，請在鏡頭前展示雙手');
            predict();
          });
        }
      } catch (err) {
        setStatus('無法訪問攝像頭');
      }
    };

    // 4. 手勢檢測與邏輯循環
    let lastVideoTime = -1;
    const predict = () => {
      const video = videoRef.current;
      const landmarker = stateRef.current.handLandmarker;

      if (video && landmarker && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const startTimeMs = performance.now();
        const result = landmarker.detectForVideo(video, startTimeMs);

        processGestures(result);
      }
      requestAnimationFrame(predict);
    };

    // 5. 處理手勢邏輯
    const processGestures = (result) => {
      const hands = result.landmarks;
      
      // 默認行為：漂浮
      let newMode = 'float';
      let newText = '';
      let expansion = 1.0;

      if (hands.length > 0) {
        // 檢測手勢數字 (簡單的指頭計數)
        // 這裡簡化判斷：只看第一隻手
        const hand = hands[0];
        const fingersUp = countFingers(hand);

        if (fingersUp === 1) {
          newMode = 'text';
          newText = '雲智慧';
        } else if (fingersUp === 2) {
          newMode = 'text';
          newText = 'Betsy';
        } else if (fingersUp === 3) {
          newMode = 'text';
          newText = '加油';
        }

        // 檢測雙手距離控制擴散
        if (hands.length === 2) {
          // 取兩隻手腕的距離 (索引 0 是手腕)
          const hand1 = hands[0][0];
          const hand2 = hands[1][0];
          // 簡單的 3D 距離公式 (僅用 x, y)
          const dist = Math.sqrt(
            Math.pow(hand1.x - hand2.x, 2) + Math.pow(hand1.y - hand2.y, 2)
          );
          // 映射距離到擴散係數 (距離 0.2 ~ 0.8 映射到 0.5 ~ 3.0)
          expansion = 0.5 + (dist * 4); 
        }
      }

      // 更新狀態
      if (newMode === 'text' && newText) {
        // 如果文字變了，生成新目標點
        if (stateRef.current.lastText !== newText) {
          const textPoints = getTextParticles(newText, 120);
          updateTargetPositions(textPoints);
          stateRef.current.lastText = newText;
        }
      } else {
        stateRef.current.lastText = null;
        resetTargetPositions(); // 回到隨機漂浮
      }

      stateRef.current.mode = newMode;
      stateRef.current.expansion = expansion;
    };

    // 輔助：計算伸出的手指數
    const countFingers = (landmarks) => {
      const tips = [8, 12, 16, 20]; // 食指、中指、無名指、小指指尖
      const dips = [6, 10, 14, 18]; // 對應的第二關節
      let count = 0;
      
      // 拇指特殊判斷 (x 方向)
      if (landmarks[4].x < landmarks[3].x) count++; // 假設右手，左手可能反過來，這裡簡化

      // 其他四指 (y 方向，指尖比關節高)
      // 注意：MediaPipe y 座標向下為正，所以指尖 y 應該小於關節 y
      for (let i = 0; i < 4; i++) {
        if (landmarks[tips[i]].y < landmarks[dips[i]].y) {
          count++;
        }
      }
      // 修正拇指邏輯較複雜，這裡為演示簡化：只用食指、中指、無名指判定 1, 2, 3
      // 嚴謹邏輯應判斷手掌朝向
      
      // 重新簡易判定：
      // 1: 只有食指伸直
      // 2: 食指 + 中指
      // 3: 食指 + 中指 + 無名指
      const indexUp = landmarks[8].y < landmarks[6].y;
      const middleUp = landmarks[12].y < landmarks[10].y;
      const ringUp = landmarks[16].y < landmarks[14].y;
      const pinkyUp = landmarks[20].y < landmarks[18].y;

      if (indexUp && !middleUp && !ringUp && !pinkyUp) return 1;
      if (indexUp && middleUp && !ringUp && !pinkyUp) return 2;
      if (indexUp && middleUp && ringUp && !pinkyUp) return 3;
      
      return 0;
    };

    const updateTargetPositions = (textPoints) => {
      const count = stateRef.current.currentPositions.length / 3;
      const textCount = textPoints.length / 3;
      
      for (let i = 0; i < count; i++) {
        // 如果粒子多於文字點，則隨機分配到文字點上
        const targetIndex = i % textCount;
        stateRef.current.targetPositions[i * 3] = textPoints[targetIndex * 3];
        stateRef.current.targetPositions[i * 3 + 1] = textPoints[targetIndex * 3 + 1];
        stateRef.current.targetPositions[i * 3 + 2] = textPoints[targetIndex * 3 + 2];
      }
    };

    const resetTargetPositions = () => {
      const count = stateRef.current.currentPositions.length / 3;
      // 設為一個隨機球體
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 15 + Math.random() * 10;
        
        stateRef.current.targetPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        stateRef.current.targetPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        stateRef.current.targetPositions[i * 3 + 2] = r * Math.cos(phi);
      }
    };

    // 6. 渲染循環
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const positions = stateRef.current.particles.geometry.attributes.position.array;
      const targets = stateRef.current.targetPositions;
      const expansion = stateRef.current.expansion;
      
      // 粒子物理模擬
      for (let i = 0; i < positions.length; i += 3) {
        let tx = targets[i];
        let ty = targets[i + 1];
        let tz = targets[i + 2];

        // 應用擴散係數 (如果是文字模式，擴散效果可以是讓字變大)
        if (stateRef.current.mode === 'float') {
           tx *= expansion;
           ty *= expansion;
           tz *= expansion;
        } else {
           tx *= (0.5 + expansion * 0.5); // 文字模式下稍微放大
           ty *= (0.5 + expansion * 0.5);
        }

        // 簡單的緩動跟隨
        positions[i] += (tx - positions[i]) * 0.1;
        positions[i + 1] += (ty - positions[i + 1]) * 0.1;
        positions[i + 2] += (tz - positions[i + 2]) * 0.1;
      }

      stateRef.current.particles.geometry.attributes.position.needsUpdate = true;
      
      // 旋轉場景增加動感
      scene.rotation.y += 0.002;
      
      renderer.render(scene, camera);
    };

    initThree();
    initMediaPipe();
    animate();

    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer) {
        containerRef.current.removeChild(renderer.domElement);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
      {/* 隱藏的 Video 元素用於 MediaPipe 分析 */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
      
      {/* Three.js 容器 */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* UI 提示 */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: '#fff',
        fontFamily: 'sans-serif',
        pointerEvents: 'none'
      }}>
        <h2>互動粒子系統</h2>
        <p>狀態: {status}</p>
        <div style={{ lineHeight: 1.6, background: 'rgba(0,0,0,0.5)', padding: 15, borderRadius: 8 }}>
          <p>👋 <b>雙手張合</b>：控制粒子擴散</p>
          <p>☝️ <b>手勢 1</b>：組成 "雲智慧"</p>
          <p>✌️ <b>手勢 2</b>：組成 "Betsy"</p>
          <p>👌 <b>手勢 3</b>：組成 "加油"</p>
        </div>
      </div>
    </div>
  );
};

export default ParticleSystem;

