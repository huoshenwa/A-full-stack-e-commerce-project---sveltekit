<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import gsap from 'gsap';

  // Svelte 5 Props
  let { item, scale = 18, isActive } = $props<{
    item: { color: string[] };
    scale?: number;
    isActive: boolean;
  }>();

  let container: HTMLDivElement;
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let controls: OrbitControls;
  let model: THREE.Group | null = null;
  let wrapper: THREE.Group | null = null;
  let isLoading = $state(true);

  const excludedMaterials = [
    "zFdeDaGNRwzccye", "ujsvqBWRMnqdwPx", "hUlRcbieVuIiOXG", "jlzuBkUzuJqgiAK", "xNrofRCqOXXHVZt"
  ];

  const updateColor = () => {
    if (!model) return;
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat && mat.name && !excludedMaterials.includes(mat.name)) {
          gsap.to(mat.color, {
            r: new THREE.Color(item.color[0]).r,
            g: new THREE.Color(item.color[0]).g,
            b: new THREE.Color(item.color[0]).b,
            duration: 0.8,
            ease: "power2.out"
          });
        }
      }
    });
  };

  // 视角重置逻辑：与外部滑动动画（1.8s）完美同步
  const resetView = () => {
    if (!camera || !controls) return;
    
    // 停止之前的动画，防止冲突
    gsap.killTweensOf([camera.position, controls.target]);
    
    // 重置相机位置
    gsap.to(camera.position, {
      x: 0, y: 0, z: 5,
      duration: 1.8,
      ease: "power4.inOut"
    });
    
    // 重置控制目标中心，确保一边位移一边修正角度
    gsap.to(controls.target, {
      x: 0, y: 0, z: 0,
      duration: 1.8,
      ease: "power4.inOut",
      onUpdate: () => { controls.update() }
    });
  };

  $effect(() => {
    if (item && model) updateColor();
  });

  // 核心交互：当模型进入激活状态时，立即开始回归初始角度
  $effect(() => {
    if (isActive) {
      resetView();
    }
  });

  onMount(() => {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;

    /** 高级布光方案 **/
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    // 主光：强调钛金属质感
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    // 轮廓光：勾勒工业设计线条
    const rimLight = new THREE.SpotLight(0xffffff, 6);
    rimLight.position.set(-5, 5, -8);
    rimLight.angle = Math.PI / 6;
    rimLight.penumbra = 0.8;
    scene.add(rimLight);

    // 反向补光：增强暗部细节
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(-6, -2, 5);
    scene.add(fillLight);

    // 底部点光
    const softPoint = new THREE.PointLight(0xffffff, 1.5);
    softPoint.position.set(0, -6, 2);
    scene.add(softPoint);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load('/models/scene.glb', (gltf) => {
      model = gltf.scene;
      
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      
      wrapper = new THREE.Group();
      wrapper.add(model);
      wrapper.scale.set(scale, scale, scale);
      
      // 将模型垂直位置微调，确保位于标题下方且在调色板之上
      wrapper.position.y = 0.1; 
      
      scene.add(wrapper);
      updateColor();
      isLoading = false;
    });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      dracoLoader.dispose();
    };
  });
</script>

<div class="w-full h-full relative">
  <div bind:this={container} class="w-full h-full"></div>
  {#if isLoading}
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="w-10 h-10 border-2 border-white/5 border-t-white/50 rounded-full animate-spin"></div>
    </div>
  {/if}
</div>