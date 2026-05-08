export async function mountThreePreview(container: HTMLElement): Promise<() => void> {
  const THREE = await import('three');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
  const material = new THREE.MeshStandardMaterial({ color: '#1d9a8a', roughness: 0.55 });
  const cube = new THREE.Mesh(geometry, material);
  const light = new THREE.DirectionalLight('#fff5cf', 2.2);
  let frame = 0;
  let disposed = false;

  scene.add(cube);
  scene.add(light);
  light.position.set(2, 3, 4);
  camera.position.z = 4;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.replaceChildren(renderer.domElement);

  const resizeObserver = new ResizeObserver(() => {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  });

  resizeObserver.observe(container);

  const animate = () => {
    if (disposed) {
      return;
    }
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.014;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(animate);
  };

  animate();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    container.replaceChildren();
  };
}
