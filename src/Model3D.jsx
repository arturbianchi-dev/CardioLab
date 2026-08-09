import React, { Suspense, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';

const ASSETS = {
  heart: 'https://ccf-ontology.hubmapconsortium.org/objects/v1.2/VH_M_Heart.glb',
  lungs: 'https://ccf-ontology.hubmapconsortium.org/objects/v1.2/VH_M_Lung.glb',
  liver: 'https://ccf-ontology.hubmapconsortium.org/objects/v1.2/VH_M_Liver.glb',
  spleen: 'https://ccf-ontology.hubmapconsortium.org/objects/v1.2/VH_M_Spleen.glb',
  vasculature: 'https://ccf-ontology.hubmapconsortium.org/objects/v1.2/VH_M_Blood_Vasculature.glb',
};

function prepare(scene, targetHeight, opacity = 1) {
  const clone = scene.clone(true);
  clone.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    if (o.material) {
      o.material = o.material.clone();
      o.material.roughness = 0.58;
      o.material.metalness = 0.01;
      o.material.transparent = opacity < 1;
      o.material.opacity = opacity;
      if (opacity < 1) o.material.depthWrite = false;
    }
  });
  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = targetHeight / Math.max(size.y, 0.001);
  clone.position.sub(center);
  clone.scale.setScalar(scale);
  return clone;
}

function ReferenceAsset({ url, targetHeight, position, opacity = 1, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(url);
  const fitted = useMemo(() => prepare(scene, targetHeight, opacity), [scene, targetHeight, opacity]);
  fitted.position.set(...position);
  fitted.rotation.set(...rotation);
  return <primitive object={fitted} />;
}

function HeartMotion({ hr, playing }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const cycle = ((state.clock.elapsedTime * hr) / 60) % 1;
    const systole = cycle < 0.38 ? Math.sin((cycle / 0.38) * Math.PI) : 0;
    const active = playing ? systole : 0;
    ref.current.scale.set(1 + active * 0.04, 1 - active * 0.045, 1 + active * 0.035);
    ref.current.rotation.z = -0.035 * active;
  });
  return <group ref={ref}><ReferenceAsset url={ASSETS.heart} targetHeight={2.05} position={[0, 0.12, 0.28]} /></group>;
}

const ROUTES = [
  [[0, 0.2, 0.55], [0, 1.35, 0.55], [0.65, 1.85, 0.55], [1.15, 1.1, 0.55], [1.05, 0.05, 0.55], [0.6, -0.9, 0.55]],
  [[0, 0.2, 0.55], [0, 1.35, 0.55], [-0.65, 1.85, 0.55], [-1.15, 1.1, 0.55], [-1.05, 0.05, 0.55], [-0.6, -0.9, 0.55]],
  [[0.6, -0.9, -0.05], [0.9, -1.35, -0.05], [0.55, -1.95, -0.05], [0, -1.45, -0.05], [0, 0.2, -0.05]],
  [[-0.6, -0.9, -0.05], [-0.9, -1.35, -0.05], [-0.55, -1.95, -0.05], [0, -1.45, -0.05], [0, 0.2, -0.05]],
  [[0.15, 0.25, 0.35], [0.85, 0.75, 0.35], [1.15, 1.0, 0.35], [0.65, 1.35, 0.35], [0.15, 0.55, 0.35]],
  [[-0.15, 0.25, 0.35], [-0.85, 0.75, 0.35], [-1.15, 1.0, 0.35], [-0.65, 1.35, 0.35], [-0.15, 0.55, 0.35]],
];

function FlowNetwork({ playing, speed }) {
  const refs = useRef([]);
  const curves = useMemo(() => ROUTES.map((r) => new THREE.CatmullRomCurve3(r.map((p) => new THREE.Vector3(...p)), false, 'centripetal', 0.35)), []);
  const particles = useMemo(() => Array.from({ length: 120 }, (_, i) => ({ route: i % curves.length, t: (i / 120) % 1, phase: (i * 0.37) % 1 })), [curves]);
  useFrame((_, dt) => {
    if (!playing) return;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const q = particles[i];
      q.t = (q.t + dt * 0.105 * speed * (0.85 + q.phase * 0.25)) % 1;
      mesh.position.copy(curves[q.route].getPointAt(q.t));
    });
  });
  return <group>{particles.map((q, i) => <mesh key={i} ref={(m) => { refs.current[i] = m; }}><sphereGeometry args={[0.022, 8, 8]} /><meshBasicMaterial color={q.route < 2 || q.route >= 4 ? '#ef6671' : '#5e9cff'} toneMapped={false} /></mesh>)}</group>;
}

function Anatomy3D({ hr, playing }) {
  const speed = Math.max(0.45, Math.min(2.1, hr / 72));
  return <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
    <color attach="background" args={['#030912']} /><fog attach="fog" args={['#030912', 7, 14]} />
    <PerspectiveCamera makeDefault position={[0, 0.15, 7]} fov={38} />
    <ambientLight intensity={0.95} /><hemisphereLight intensity={1.15} groundColor="#06111b" skyColor="#b9d8e6" />
    <directionalLight position={[4, 6, 5]} intensity={2.6} castShadow /><directionalLight position={[-4, 2, 3]} intensity={1.1} color="#77dcbc" /><pointLight position={[0, 0, 4]} intensity={1} color="#9ac7ff" />
    <Suspense fallback={null}>
      <ReferenceAsset url={ASSETS.vasculature} targetHeight={6.3} position={[0, 0.1, -0.25]} opacity={0.2} />
      <ReferenceAsset url={ASSETS.lungs} targetHeight={3.15} position={[0, 0.9, 0.02]} opacity={0.78} />
      <HeartMotion hr={hr} playing={playing} />
      <ReferenceAsset url={ASSETS.liver} targetHeight={1.72} position={[0.04, -1.16, 0.06]} opacity={0.88} />
      <ReferenceAsset url={ASSETS.spleen} targetHeight={1.14} position={[-0.84, -0.96, 0.06]} opacity={0.9} />
      <FlowNetwork playing={playing} speed={speed} />
    </Suspense>
    <OrbitControls enablePan={false} minDistance={4.2} maxDistance={10.5} target={[0, 0, 0]} enableDamping dampingFactor={0.075} rotateSpeed={0.55} zoomSpeed={0.65} />
  </Canvas>;
}

function FlowDot({ path, color, duration, delay }) {
  return <circle r="5" fill={color} filter="url(#glow)"><animateMotion dur={duration} begin={delay} repeatCount="indefinite" path={path} /></circle>;
}

function ClinicalMap({ hr, playing, params }) {
  const beat = `${Math.max(0.34, 60 / Math.max(hr, 30))}s`;
  const co = params?.co ?? 5;
  const ef = params?.ef ?? 58;
  const map = params?.map ?? 90;
  const pap = params?.papMean ?? 15;
  const sv = params?.sv ?? 70;
  const congestion = Math.max(0, Math.min(100, (pap - 15) * 4));
  const animation = playing ? 'running' : 'paused';
  return <div className="clinical-map" style={{ '--beat': beat, '--flow-speed': `${Math.max(0.55, 5 / Math.max(co, 1))}s`, '--anim': animation }}>
    <svg viewBox="0 0 900 620" preserveAspectRatio="xMidYMid meet" aria-label="Mapa clínico animado da circulação cardiovascular">
      <defs>
        <radialGradient id="heartDepth"><stop offset="0" stopColor="#f47b80"/><stop offset="0.55" stopColor="#c73e54"/><stop offset="1" stopColor="#72243d"/></radialGradient>
        <linearGradient id="lungDepth" x1="0" x2="1"><stop stopColor="#9bcdd6"/><stop offset="1" stopColor="#466f82"/></linearGradient>
        <linearGradient id="liverDepth" x1="0" x2="1"><stop stopColor="#b86d4b"/><stop offset="1" stopColor="#633d32"/></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="2.8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="soft"><feGaussianBlur stdDeviation="12"/></filter>
      </defs>
      <rect width="900" height="620" fill="#f7f2f1" opacity="0.025"/>
      <ellipse cx="450" cy="305" rx="300" ry="260" fill="#5bb4c7" opacity="0.035" filter="url(#soft)"/>

      <text x="450" y="32" textAnchor="middle" className="map-title">CIRCULAÇÃO CARDIOVASCULAR · MODELO FISIOLÓGICO EM TEMPO REAL</text>
      <text x="450" y="53" textAnchor="middle" className="map-subtitle">PAPm {pap.toFixed(0)} mmHg · FC {hr} bpm · DC {co.toFixed(1)} L/min</text>

      <path d="M185 135 C125 150 112 235 132 345 C145 415 185 435 235 420 C265 410 276 365 270 280 C264 205 242 144 185 135Z" fill="url(#lungDepth)" opacity="0.86" stroke="#8bbbc6" strokeWidth="2"/>
      <path d="M715 135 C775 150 788 235 768 345 C755 415 715 435 665 420 C635 410 624 365 630 280 C636 205 658 144 715 135Z" fill="url(#lungDepth)" opacity="0.86" stroke="#8bbbc6" strokeWidth="2"/>
      <path d="M205 175 C180 240 180 330 205 395 M695 175 C720 240 720 330 695 395" fill="none" stroke="#b9e2e7" strokeWidth="1.5" opacity="0.55"/>
      <text x="175" y="112" className="map-label">PULMÕES</text><text x="725" y="112" textAnchor="end" className="map-label">PULMÕES</text>

      <path d="M390 150 C350 100 315 92 270 105" fill="none" stroke="#365eaa" strokeWidth="18" strokeLinecap="round" opacity="0.95"/>
      <path d="M510 150 C550 100 585 92 630 105" fill="none" stroke="#d52f49" strokeWidth="18" strokeLinecap="round" opacity="0.95"/>
      <path d="M390 150 C350 100 315 92 270 105" fill="none" stroke="#6b92d0" strokeWidth="4" strokeLinecap="round"/>
      <path d="M510 150 C550 100 585 92 630 105" fill="none" stroke="#f16b78" strokeWidth="4" strokeLinecap="round"/>
      <text x="260" y="90" className="map-vessel">ARTÉRIA PULMONAR</text><text x="640" y="90" textAnchor="end" className="map-vessel">VEIAS PULMONARES</text>

      <path d="M350 215 C300 185 275 150 290 105 C302 68 345 70 372 94" fill="none" stroke="#d6334d" strokeWidth="24" strokeLinecap="round"/>
      <path d="M550 215 C600 185 625 150 610 105 C598 68 555 70 528 94" fill="none" stroke="#d6334d" strokeWidth="24" strokeLinecap="round"/>
      <path d="M365 205 C345 130 395 80 450 90 C505 80 555 130 535 205" fill="none" stroke="#c9324b" strokeWidth="23" strokeLinecap="round"/>
      <path d="M450 78 L450 198" fill="none" stroke="#dc3850" strokeWidth="20" strokeLinecap="round"/>
      <text x="450" y="67" textAnchor="middle" className="map-vessel">AORTA</text>

      <g className="heart-beat" style={{ animationPlayState: animation, transformOrigin: '450px 295px' }}>
        <path d="M450 255 C410 205 330 220 330 285 C330 355 400 407 450 445 C500 407 570 355 570 285 C570 220 490 205 450 255Z" fill="url(#heartDepth)" stroke="#8f2942" strokeWidth="3"/>
        <path d="M450 255 C425 225 388 220 365 235 C345 248 345 280 360 300 C375 320 400 335 450 365Z" fill="#4a67a1" opacity="0.95"/>
        <path d="M450 255 C475 225 512 220 535 235 C555 248 555 280 540 300 C525 320 500 335 450 365Z" fill="#e15b66" opacity="0.95"/>
        <path d="M450 270 L450 405" stroke="#f1d6d1" strokeWidth="3" opacity="0.7"/>
        <path d="M392 305 C405 292 425 292 438 305" fill="none" stroke="#d9e3ef" strokeWidth="5" strokeLinecap="round"/>
        <path d="M462 305 C475 292 495 292 508 305" fill="none" stroke="#ffe1a1" strokeWidth="5" strokeLinecap="round"/>
        <text x="385" y="292" textAnchor="middle" className="chamber">AD</text><text x="515" y="292" textAnchor="middle" className="chamber">AE</text>
        <text x="395" y="350" textAnchor="middle" className="chamber">VD</text><text x="505" y="350" textAnchor="middle" className="chamber">VE</text>
        <text x="450" y="327" textAnchor="middle" className="septum">SEPTO</text>
      </g>
      <circle cx="450" cy="315" r="6" fill="#ffe15b" filter="url(#glow)"/>
      <text x="450" y="380" textAnchor="middle" className="heart-readout">{hr} bpm</text>
      <text x="450" y="400" textAnchor="middle" className="heart-secondary">FE {ef.toFixed(0)}% · VS {sv.toFixed(0)} mL</text>

      <path d="M350 285 C300 330 270 395 280 515" fill="none" stroke="#355eaa" strokeWidth="15" strokeLinecap="round"/>
      <path d="M550 285 C600 330 630 395 620 515" fill="none" stroke="#c52f49" strokeWidth="15" strokeLinecap="round"/>
      <path d="M280 515 C315 530 350 530 380 510" fill="none" stroke="#355eaa" strokeWidth="15" strokeLinecap="round"/>
      <path d="M620 515 C585 530 550 530 520 510" fill="none" stroke="#c52f49" strokeWidth="15" strokeLinecap="round"/>
      <text x="260" y="550" className="map-vessel">RETORNO VENOSO</text><text x="640" y="550" textAnchor="end" className="map-vessel">CIRCULAÇÃO SISTÊMICA</text>

      <path d="M330 405 C300 425 290 445 305 468 C330 493 370 492 405 472 C425 460 420 440 390 430Z" fill="url(#liverDepth)" stroke="#9a5941" strokeWidth="2"/>
      <text x="355" y="452" textAnchor="middle" className="organ-label">FÍGADO</text><text x="355" y="469" textAnchor="middle" className="organ-small">congestão {congestion.toFixed(0)}%</text>
      <path d="M555 425 C535 415 515 430 520 455 C525 480 555 490 575 470 C590 455 580 435 555 425Z" fill="#864b82" stroke="#a9679f" strokeWidth="2"/>
      <text x="555" y="457" textAnchor="middle" className="organ-label">BAÇO</text>

      <path d="M150 520 H750" stroke="#7b92a1" strokeWidth="2" strokeDasharray="5 7" opacity="0.35"/>
      <rect x="330" y="530" width="240" height="52" rx="26" fill="#162b38" stroke="#335365"/>
      <text x="450" y="552" textAnchor="middle" className="bottom-title">PERFUSÃO SISTÊMICA</text>
      <text x="450" y="570" textAnchor="middle" className="bottom-value">MAP {map.toFixed(0)} mmHg · FLUXO {co.toFixed(1)} L/min</text>

      <g className="flow-particles">
        <FlowDot path="M350 215 C300 185 275 150 290 105" color="#ef6671" duration="2.8s" delay="0s"/>
        <FlowDot path="M535 205 C555 130 505 80 450 90" color="#ef6671" duration="3s" delay="-.8s"/>
        <FlowDot path="M550 285 C600 330 630 395 620 515" color="#ef6671" duration="2.6s" delay="-.3s"/>
        <FlowDot path="M280 515 C270 395 300 330 350 285" color="#63a6ff" duration="3.1s" delay="-.9s"/>
        <FlowDot path="M390 150 C350 100 315 92 270 105" color="#63a6ff" duration="2.4s" delay="-.4s"/>
        <FlowDot path="M510 150 C550 100 585 92 630 105" color="#ef6671" duration="2.5s" delay="-.6s"/>
      </g>
    </svg>
    <div className="map-legend"><span className="map-dot arterial"/> arterial <span className="map-dot venous"/> venous <span className="map-dot valve"/> valves <span className="map-dot active"/> animated</div>
  </div>;
}

export default function Model3D({ hr, playing, params }) {
  const [mode, setMode] = useState('clinical');
  return <div className="model-canvas">
    <div className="anatomy-mode-switch"><button className={mode === 'clinical' ? 'active' : ''} onClick={() => setMode('clinical')}>CLINICAL FLOW MAP</button><button className={mode === '3d' ? 'active' : ''} onClick={() => setMode('3d')}>3D ANATOMY</button></div>
    {mode === 'clinical' ? <ClinicalMap hr={hr} playing={playing} params={params} /> : <Anatomy3D hr={hr} playing={playing} />}
    <div className="anatomy-badge">REFERENCE ANATOMY · VISIBLE HUMAN / HuBMAP</div>
    <div className="anatomy-hint">{mode === '3d' ? 'DRAG TO ROTATE · SCROLL TO ZOOM' : 'CLINICAL FLOW VIEW · SYNCHRONIZED TO CURRENT PHYSIOLOGY'}</div>
  </div>;
}

Object.values(ASSETS).forEach((url) => useGLTF.preload(url));
