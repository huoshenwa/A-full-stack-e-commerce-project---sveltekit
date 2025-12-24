<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; //加载 GLB/GLTF 格式 3D 模型的加载器
	import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'; //DRACO 压缩格式解码器，用于加载压缩后的 GLB 模型
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; //轨道控制器
	import gsap from 'gsap';

	let {
		item,
		scale = 18,
		isActive
	} = $props<{
		item: { color: string[] };
		scale?: number;
		isActive: boolean;
	}>();

	let container: HTMLDivElement;
	let renderer: THREE.WebGLRenderer; //WebGL 渲染器
	let scene: THREE.Scene; //场景容器
	let camera: THREE.PerspectiveCamera;
	let controls: OrbitControls;
	let model: THREE.Group | null = null; //加载后的 3D 模型对象
	let wrapper: THREE.Group | null = null; // 模型包装组
	let isLoading = $state(true); // 标记模型是否正在加载（控制加载动画显示 / 隐藏）
	//定义不需要更新颜色的材质名称列表（3D 建模时给特定材质命名，避免这些材质被颜色动画修改）
	const excludedMaterials = [
		'zFdeDaGNRwzccye',
		'ujsvqBWRMnqdwPx',
		'hUlRcbieVuIiOXG',
		'jlzuBkUzuJqgiAK',
		'xNrofRCqOXXHVZt'
	];

	const updateColor = () => {
		if (!model) return; // 模型未加载则退出
		model.traverse((child) => {
			// 递归遍历模型所有子对象
			if (child instanceof THREE.Mesh) {
				const mat = child.material as THREE.MeshStandardMaterial;
				// 材质存在 + 有名称 + 不在排除列表中 → 执行颜色动画
				if (mat && mat.name && !excludedMaterials.includes(mat.name)) {
					gsap.to(mat.color, {
						r: new THREE.Color(item.color[0]).r,
						g: new THREE.Color(item.color[0]).g,
						b: new THREE.Color(item.color[0]).b,
						duration: 0.8,
						ease: 'power2.out'
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
			x: 0,
			y: 0,
			z: 5,
			duration: 0.1,
			ease: 'power4.inOut'
		});

		// 重置控制目标中心，确保一边位移一边修正角度
		gsap.to(controls.target, {
			x: 0,
			y: 0,
			z: 0,
			duration: 0.5,
			ease: 'power4.inOut',
			onUpdate: () => {
				controls.update();
			}
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

		camera = new THREE.PerspectiveCamera(
			40, // 视场角（FOV）：越大看到的范围越广
			container.clientWidth / container.clientHeight, // 宽高比（与容器一致）
			0.1, // 近裁剪面（小于该距离的对象不可见）
			1000 // 远裁剪面（大于该距离的对象不可见）
		);
		camera.position.set(0, 0, 5);

		// 3. 创建WebGL渲染器
		renderer = new THREE.WebGLRenderer({
			antialias: true, // 开启抗锯齿（边缘更平滑）
			alpha: true // 背景透明（避免遮挡页面其他元素）
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 设置像素比（限制为2，避免性能损耗）
		renderer.setSize(container.clientWidth, container.clientHeight); // 渲染器尺寸与容器一致
		// 色调映射（模拟真实胶片的曝光效果，增强视觉质感）
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 2.3; // 曝光度（数值越大越亮）
		container.appendChild(renderer.domElement); // 将渲染器的Canvas添加到容器

		// 初始化轨道控制器
		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true; // 开启阻尼（拖拽后有惯性，更自然）
		controls.dampingFactor = 0.05; // 阻尼系数（越小惯性越强）
		controls.enableZoom = false; // 禁用缩放
		controls.enablePan = false; // 禁用平移（仅保留旋转）

		/** 高级布光方案 **/
		// 环境光：均匀照亮场景，避免纯黑（强度0.2）
		scene.add(new THREE.AmbientLight(0xffffff, 0.2));

		// 主光（平行光）：模拟太阳光，强调金属质感（强度3.5）
		const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
		keyLight.position.set(5, 8, 6); // 光源位置（右、上、前）
		scene.add(keyLight);

		// 轮廓光（聚光灯）：勾勒模型线条，增强立体感（强度6）
		const rimLight = new THREE.SpotLight(0xffffff, 6);
		rimLight.position.set(-5, 5, -8); // 光源位置（左、上、后）
		rimLight.angle = Math.PI / 6; // 光照角度（30度）
		rimLight.penumbra = 0.8; // 半影（边缘模糊度）
		scene.add(rimLight);

		// 反向补光（平行光）：照亮暗部，增强细节（强度1.0）
		const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
		fillLight.position.set(-6, -2, 5); // 光源位置（下、前）
		scene.add(fillLight);

		// 底部点光：补充底部照明，避免模型底部过暗（强度1.5）
		const softPoint = new THREE.PointLight(0xffffff, 1.5);
		softPoint.position.set(0, -6, 2); // 光源位置（下、前）
		scene.add(softPoint);

		// 初始化DRACO解码器（加载压缩模型）
		const dracoLoader = new DRACOLoader();
		// 设置DRACO解码器CDN路径
		// dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
		dracoLoader.setDecoderPath(
			'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/'
		);
		//初始化GLTF加载器并关联DRACO解码器
		const loader = new GLTFLoader();
		loader.setDRACOLoader(dracoLoader);

		// 加载3D模型（GLB格式）
		loader.load('/models/scene.glb', (gltf) => {
			model = gltf.scene; // 获取模型的根场景对象

			// 计算模型包围盒，居中模型（避免模型偏移）
			const box = new THREE.Box3().setFromObject(model); // 计算模型的轴对齐包围盒
			const center = box.getCenter(new THREE.Vector3()); // 获取包围盒中心
			model.position.sub(center); // 模型位置减去中心，使模型中心对齐原点
			// 创建模型包装组（统一缩放/位移）
			wrapper = new THREE.Group();
			wrapper.add(model); // 将模型添加到包装组
			wrapper.scale.set(scale, scale, scale); // 设置缩放比例（外部传入或默认18）
			wrapper.position.y = 0.1; // 垂直微调，确保模型位置符合UI设计

			scene.add(wrapper); // 将包装组添加到场景
			updateColor(); // 加载完成后立即更新颜色
			isLoading = false; // 标记加载完成，隐藏加载动画
		});

		// 8. 动画循环（requestAnimationFrame）
		const animate = () => {
			requestAnimationFrame(animate); // 浏览器刷新率同步的循环
			controls.update(); // 每一帧更新控制器（阻尼效果需要）
			renderer.render(scene, camera); // 渲染场景（相机视角 → Canvas）
		};
		animate(); // 启动动画循环

		// 9. 窗口大小调整处理
		const handleResize = () => {
			camera.aspect = container.clientWidth / container.clientHeight; // 更新相机宽高比
			camera.updateProjectionMatrix(); // 更新相机投影矩阵（宽高比变化必须执行）
			renderer.setSize(container.clientWidth, container.clientHeight); // 更新渲染器尺寸
		};
		window.addEventListener('resize', handleResize); // 监听窗口resize事件

		return () => {
			window.removeEventListener('resize', handleResize);
			renderer.dispose(); // 释放渲染器资源（避免内存泄漏）
			dracoLoader.dispose(); // 释放DRACO解码器资源
		};
	});
</script>

<div class="w-full h-full relative">
	<div bind:this={container} class="w-full h-full"></div>
	{#if isLoading}
		<div class="absolute inset-0 flex items-center justify-center">
			<div
				class="w-10 h-10 border-2 border-white/5 border-t-white/50 rounded-full animate-spin"
			></div>
		</div>
	{/if}
</div>
