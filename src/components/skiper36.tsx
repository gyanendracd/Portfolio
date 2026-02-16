"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TextLoop } from "../../components/motion-primitives/text-loop";
import { TextEffect } from "../../components/motion-primitives/text-effect";

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
  backgroundColor = "#FC0F49",
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
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const pointerRef = useRef<THREE.Vector2 | null>(null);
  const rollOverMeshRef = useRef<THREE.Mesh | null>(null);
  const planeRef = useRef<THREE.Mesh | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  const isShiftDownRef = useRef(false);
  const cubeGeoRef = useRef<THREE.BoxGeometry | null>(null);
  const cubeMaterialRef = useRef<THREE.MeshLambertMaterial | null>(null);
  const animationIdRef = useRef<number | null>(null);

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
        <div className="absolute left-8 top-20 z-10 pl-8 rounded-xl bg-black/10 px-3 py-2 font-mono text-6xl text-[#000000] backdrop-blur-sm">
          <span className="block">Hello I'm</span>
          <span className="block">Gyanendra Pal Singh</span>
        </div>

        <div className="absolute left-8 top-60 z-10 pl-8 rounded-xl bg-black/10 px-3 py-2 font-mono text-3xl text- text-[#000000] backdrop-blur-sm">
          I'm a <TextLoop className='font-mono text-4xl'>
            <span>Software Developer</span>
            <span>3D Artist</span>
          </TextLoop>
        </div>
        <div className="absolute left-8 top-80 z-10 pl-8 rounded-xl bg-black/10 px-3 py-2 font-mono text-3xl text- text-[#000000] backdrop-blur-sm">
          <TextEffect
            per='char'
            delay={0.5}
            variants={{
              container: {
                hidden: {
                  opacity: 0,
                },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              },
              item: {
                hidden: {
                  opacity: 0,
                  rotateX: 90,
                  y: 10,
                },
                visible: {
                  opacity: 1,
                  rotateX: 0,
                  y: 0,
                  transition: {
                    duration: 0.2,
                  },
                },
              },
            }}
          >
            Blending design, development, and 3D creativity
          </TextEffect>
          <TextEffect
            per='char'
            delay={3}
            variants={{
              container: {
                hidden: {
                  opacity: 0,
                },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              },
              item: {
                hidden: {
                  opacity: 0,
                  rotateX: 90,
                  y: 10,
                },
                visible: {
                  opacity: 1,
                  rotateX: 0,
                  y: 0,
                  transition: {
                    duration: 0.2,
                  },
                },
              },
            }}
          >
            to build modern, high-performance digital experiences.
          </TextEffect>
        </div>

      </div>
      <div className="absolute right-8 top-20 z-10 rounded-xl bg-black/10 px-3 py-2 font-mono text-sm text-[#000000] backdrop-blur-sm">
        <strong>Click</strong>: add cube <strong>Shift + Click</strong>: remove
        cube
      </div>


      <div className="absolute top-0 h-full w-full">
        {/* Canvas container */}
        <InteractiveMeshCanvas
          backgroundColor="#FFFFFF"
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

      <div className="pointer-events-none absolute bottom-0 left-0 h-2/3 w-full bg-gradient-to-t from-[#393939] via-[#444444]/50 to-transparent" />
      {/* Footer */}
      <div className="z-90 absolute bottom-6 flex w-full flex-col items-center justify-center gap-5 text-[#a4a4a4]">
        <div className="relative">
          <p className="absolute right-0 top-0 text-right text-sm font-semibold leading-[1.1] tracking-tighter">
            click on the grid to start adding <br />
            blocks to the canvas
          </p>
          <SvgDraw className="w-90 text-[#313131]" />
        </div>
        <p className="max-w-2xl text-center text-sm leading-[1.1]">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores quis
          neque cum nisi iste ipsam doloribus possimus architecto, incidunt
          error, totam itaque exercitationem?
        </p>
      </div>
    </div>
  );
};

export { Skiper36 };

const SvgDraw = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 358 146"
    >
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M7.643 128.876c0 5.422 1.812 14.458 7.247 15.543 5.434 1.084 90.94 9.397 99.636-46.989.178-1.159 3.222-1.084 3.623-.361 2.916 5.256 7.202 24.948-2.174 28.916-11.956 5.06-11.594 8.313-11.956 11.566-.363 3.253 1.811 7.229 6.159 7.229s47.101 2.169 52.898.723c5.797-1.446 5.797-9.036 3.26-13.936-2.536-4.899-12.318-2.53-14.13-7.59-1.811-5.06-1.811-34.86.725-40.643 2.536-5.783 6.159-6.145 9.058-4.699 2.898 1.446 3.985 2.272 6.884 1.968 2.898-.304 2.536-2.69 6.521-2.69 3.986 0 5.073 10.843 15.58 10.12 10.507-.723 13.768-4.7 13.768-10.12 0-5.423 3.623-10.483 9.057-11.206 5.435-.723 13.044 5.783 13.044 11.205s1.087 8.675-1.812 13.735c-2.898 5.06-48.806-8.041-54.709 23.856-4.348 23.494 15.942 29.277 29.347 29.277 13.406 0 23.551-6.867 32.608-8.313 9.058-1.446 9.783 6.506 20.652 6.506 6.543 0 10.328-3.929 12.859-9.579 1.29-2.881 5.923-2.885 6.683.179.811 3.267 1.493 6.051 1.994 8.105a5.01 5.01 0 0 0 4.869 3.825h8.843a10 10 0 0 0 9.602-7.206l3.376-11.601a5.001 5.001 0 0 1 4.801-3.603h1.83a5 5 0 0 1 4.687 3.257l4.699 12.638a10 10 0 0 0 9.373 6.515h6.296a4.98 4.98 0 0 0 4.912-4.047c2.772-14.581 12.184-63.721 13.725-66.797C353.29 71.045 358 64.9 358 60.201c0-4.699-.362-6.506-3.261-8.313-2.898-1.807-23.188-3.253-26.449-1.085-3.26 2.17-3.623 4.338-2.898 7.59.724 3.254 4.348 13.013 4.71 16.266.188 1.685-.694 11.61-1.587 20.79-.324 3.323-4.974 3.671-5.809.438l-6.271-24.266a8 8 0 0 0-7.746-5.998h-6.717a8 8 0 0 0-7.774 6.112l-6.039 24.876c-.78 3.216-5.32 2.973-5.707-.313-1.029-8.73-1.997-18.48-1.625-21.639.725-6.145 7.609-14.458 7.247-17.71-.363-3.254-.363-4.7-5.073-6.146-4.71-1.445-24.275 0-27.536 1.085-.54.18-1.031.538-1.473 1.011-2.302 2.46-6.595 3.877-9.189 1.728-22.44-18.59-51.839-4.876-57.815-.57-4.205 3.03-4.348-1.446-11.594-3.254-7.246-1.807-15.579 3.615-20.289 3.615-4.71 0-1.45-12.29-15.217-9.76-13.768 2.53-23.064 15.543-23.913 9.76C109.816 12.49 82.28-8.836 10.18 3.454c0 0-10.87 2.891-10.145 10.12.724 7.23 2.236 14.453 11.231 14.458 8.996.006 12.681 88.194 5.797 90.001-6.884 1.807-9.42 5.422-9.42 10.843Zm242.388-50.964c-.725 2.169-.363 25.302 0 30 .196 2.546 6.667 2.652 12.152 4.053 1.856.474 4.394-1.544 3.904-3.396-4.412-16.704-9.058-32.84-10.622-33.187-3.26-.723-4.71.361-5.434 2.53Zm-31.159 32.169c-4.348-1.807-13.406 2.53-14.13 6.868-.725 4.337 2.898 5.421 4.71 5.421 1.811 0 7.971-1.084 10.507-4.337 2.536-3.253 3.261-6.145-1.087-7.952ZM86.627 74.243c0-46.21-40.36-46.7-39.492-29.584.868 17.115-4.71 65.258 7.609 61.753 12.319-3.505 31.883 8.226 31.883-32.169Z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};

/**
 * Skiper 36 Canvas_Landing_003 — React
 * Design Inspired by https://tympanus.net/codrops/demos/
 * Code Inspired by https://threejs.org/examples/?q=interactive#webgl_interactive_voxelpainter
 * We respect the original creators. This is an inspired rebuild with our own taste and does not claim any ownership.
 * These animations aren't associated with the tympanus.net . They're independent recreations meant to study interaction design
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Feedback and contributions are welcome.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.in
 * Twitter: https://x.com/Gur__vi
 */
