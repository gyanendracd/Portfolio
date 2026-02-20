"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TextLoop } from "../../components/motion-primitives/text-loop";
import FloatingActions from "./FloatingActions";

interface InteractiveMeshCanvasProps {
  className?: string;
  // Canvas props
  backgroundColor?: string;
  textColor?: string;
  // Grid props
  gridSize?: number;
  gridDivisions?: number;
  gridOpacity?: number;
  // Cube props
  cubeSize?: number;
  cubeColor?: string;
  rollOverColor?: string;
  rollOverOpacity?: number;
  // Camera props
  cameraPosition?: { x: number; y: number; z: number };
  // Controls props
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
  // Initial cubes
  initialCubesCount?: number;
}

const InteractiveMeshCanvas = ({
  className = "h-full w-full",
  // Canvas props
  backgroundColor = "#1C1C22",
  textColor = "#7A200B",
  // Grid props
  gridSize = 1000,
  gridDivisions = 20,
  gridOpacity = 0.3,
  // Cube props
  cubeSize = 50,
  cubeColor = "#7A200B",
  rollOverColor = "#7A200B",
  rollOverOpacity = 0.1,
  // Camera props
  cameraPosition = { x: 500, y: 500, z: 800 },
  // Controls props
  enablePan = false,
  enableZoom = true,
  enableRotate = true,
  // Initial cubes
  initialCubesCount = 4,
}: InteractiveMeshCanvasProps) => {
  const containerRef = useRef < HTMLDivElement > (null);
  const rendererRef = useRef < THREE.WebGLRenderer | null > (null);
  const sceneRef = useRef < THREE.Scene | null > (null);
  const cameraRef = useRef < THREE.PerspectiveCamera | null > (null);
  const raycasterRef = useRef < THREE.Raycaster | null > (null);
  const pointerRef = useRef < THREE.Vector2 | null > (null);
  const rollOverMeshRef = useRef < THREE.Mesh | null > (null);
  const planeRef = useRef < THREE.Mesh | null > (null);
  const objectsRef = useRef < THREE.Object3D[] > ([]);
  const isShiftDownRef = useRef(false);
  const cubeGeoRef = useRef < THREE.BoxGeometry | null > (null);
  const cubeMaterialRef = useRef < THREE.MeshLambertMaterial | null > (null);
  const animationIdRef = useRef < number | null > (null);

  // Memoize props to prevent unnecessary re-renders
  const memoizedProps = useMemo(
    () => ({
      backgroundColor,
      textColor,
      gridSize,
      gridDivisions,
      gridOpacity,
      cubeSize,
      cubeColor,
      rollOverColor,
      rollOverOpacity,
      cameraPosition,
      enablePan,
      enableZoom,
      enableRotate,
      initialCubesCount,
    }),
    [
      backgroundColor,
      textColor,
      gridSize,
      gridDivisions,
      gridOpacity,
      cubeSize,
      cubeColor,
      rollOverColor,
      rollOverOpacity,
      cameraPosition,
      enablePan,
      enableZoom,
      enableRotate,
      initialCubesCount,
    ],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any existing renderer elements
    const container = containerRef.current;
    const existingCanvas = container.querySelector("canvas");
    if (existingCanvas) {
      container.removeChild(existingCanvas);
    }

    // Initialize Three.js scene
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    // Roll-over helpers
    const rollOverGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const rollOverMaterial = new THREE.MeshBasicMaterial({
      color: rollOverColor,
      opacity: rollOverOpacity,
      transparent: true,
    });
    const rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    rollOverMesh.visible = false; // Initially invisible
    scene.add(rollOverMesh);

    // Cubes
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMaterial = new THREE.MeshLambertMaterial({
      color: cubeColor,
    });

    // Grid
    const gridHelper = new THREE.GridHelper(
      gridSize,
      gridDivisions,
      // textColor,
      // textColor,
      "#000000", // center lines
      "#777777", // grid lines
    );
    gridHelper.material.opacity = gridOpacity;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Invisible plane for raycasting
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const geometry = new THREE.PlaneGeometry(gridSize, gridSize);
    geometry.rotateX(-Math.PI / 2);

    const plane = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        visible: false,
        transparent: true,
        opacity: 0,
      }),
    );
    scene.add(plane);

    const objects: THREE.Object3D[] = [plane];

    // Lights
    const ambientLight = new THREE.AmbientLight(0x606060, 3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Get container dimensions
    const containerWidth = container.clientWidth || window.innerWidth;
    const containerHeight = container.clientHeight || window.innerHeight;

    renderer.setSize(containerWidth, containerHeight);

    container.appendChild(renderer.domElement);

    // render function for controls and interactions
    const render = () => {
      renderer.render(scene, camera);
    };

    // OrbitControls for click-and-drag rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = enablePan;
    controls.enableZoom = enableZoom;
    controls.enableRotate = enableRotate;
    controls.addEventListener("change", render);

    // Store refs
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    raycasterRef.current = raycaster;
    pointerRef.current = pointer;
    rollOverMeshRef.current = rollOverMesh;
    planeRef.current = plane;
    objectsRef.current = objects;
    cubeGeoRef.current = cubeGeo;
    cubeMaterialRef.current = cubeMaterial;

    // Event handlers
    const onPointerMove = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(objects, false);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        rollOverMesh.position.copy(intersect.point).add(intersect.face!.normal);
        rollOverMesh.position
          .divideScalar(cubeSize)
          .floor()
          .multiplyScalar(cubeSize)
          .addScalar(cubeSize / 2);

        rollOverMesh.visible = true; // Show when hovering over grid
        render();
      } else {
        rollOverMesh.visible = false; // Hide when not hovering over grid
        render();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(objects, false);

      if (intersects.length > 0) {
        const intersect = intersects[0];

        // Delete cube
        if (isShiftDownRef.current) {
          if (intersect.object !== plane) {
            scene.remove(intersect.object);
            objects.splice(objects.indexOf(intersect.object), 1);
          }
        } else {
          // Create cube
          const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
          voxel.position.copy(intersect.point).add(intersect.face!.normal);
          voxel.position
            .divideScalar(cubeSize)
            .floor()
            .multiplyScalar(cubeSize)
            .addScalar(cubeSize / 2);
          scene.add(voxel);
          objects.push(voxel);
        }

        render();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.keyCode === 16) {
        isShiftDownRef.current = true;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.keyCode === 16) {
        isShiftDownRef.current = false;
      }
    };

    const onWindowResize = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      camera.aspect = containerWidth / containerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerWidth, containerHeight);
      render();
    };

    // Add event listeners
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onWindowResize);

    // Add initial cubes at random positions
    for (let i = 0; i < initialCubesCount; i++) {
      const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
      const xIndex = Math.floor(Math.random() * 20) - 10;
      const zIndex = Math.floor(Math.random() * 20) - 10;
      voxel.position.set(
        xIndex * cubeSize + cubeSize / 2,
        cubeSize / 2,
        zIndex * cubeSize + cubeSize / 2,
      );
      scene.add(voxel);
      objects.push(voxel);
    }

    // Initial render
    render();

    // Cleanup function
    return () => {
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onWindowResize);

      // dispose OrbitControls
      controls.dispose();

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      // Remove the renderer element from DOM
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      renderer.dispose();
      cubeGeo.dispose();
      cubeMaterial.dispose();
      rollOverGeo.dispose();
      rollOverMaterial.dispose();
      geometry.dispose();
    };
  }, [memoizedProps]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    />
  );
};

const Skiper36 = () => {
  return (
    <div className="relative flex h-full w-full flex-col justify-end overflow-hidden bg-[#383838] text-[#383838]">
      {/* Instructions */}
      <div>
        <div className="
  absolute left-8 top-20 z-10 pl-6
  rounded-sm
  bg-black/10
  px-3 py-2
  font-mono text-6xl text-[#FFF]
  backdrop-blur-sm
  border border-white/10
  border-l-[5px] border-l-red-700
  shadow-[0_0_20px_rgba(220,38,38,0.15)]
">
          <span className="block">Hello I'm</span>
          <span className="block">Gyanendra Pal Singh</span>
        </div>

        <div className="
  absolute left-8 top-60 z-10 pl-6
  rounded-sm
  bg-black/10
  px-3 py-2
  font-mono text-4xl text-[#FFF]
  backdrop-blur-sm
  border border-white/10
  border-l-[5px] border-l-red-700
  shadow-[0_0_20px_rgba(220,38,38,0.15)]">
          I'm a <span className="mx-2 text-red-600 font-bold text-4xl">|</span><TextLoop className='font-mono text-4xl'>
            <span>Software Developer</span>
            <span>3D Artist</span>
          </TextLoop>
        </div>
      </div>
      <div className="absolute right-8 top-20 z-10 rounded-sm bg-black/10 px-3 py-2 font-mono text-sm text-[#FFD700] backdrop-blur-sm">
        <strong>Click</strong>: add cube <strong>Shift + Click</strong>: remove
        cube
      </div>


      <div className="absolute top-0 h-full w-full ">
        {/* Canvas container */}
        <InteractiveMeshCanvas
          backgroundColor="#141414"
          textColor="#ffffff/50"
          cubeColor="#666666"
          rollOverColor="#000000"
          cubeSize={30}
          gridSize={800}
          initialCubesCount={8}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 h-2/3 w-full" />
      {/* Footer */}
      <div className="z-90 absolute bottom-6 flex w-full flex-col items-center justify-center gap-5 text-[#a4a4a4]">

        <div className="relative">
          <FloatingActions />
        </div>
        <p className="max-w-3xl text-center text-xl leading-[1.1] bg-black/10">
          Blending design, development, and 3D creativity to build modern, high-performance digital experiences.
        </p>
        <p className="max-w-2xl text-center text-sm leading-[1.1]">
          Blending design, development, and 3D creativity <br />
            to build modern, high-performance digital experiences.
        </p>
      </div>
    </div>
  );
};

export { Skiper36 };

