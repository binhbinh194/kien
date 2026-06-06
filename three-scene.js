/**
 * Three.js 3D Glowing Particle Heart Scene
 */

class Heart3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.heartParticles = null;
        this.rotationGroup = null;
        
        // Interaction states
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0.5 };
        
        this.init();
    }

    init() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // 1. Scene Setup
        this.scene = new THREE.Scene();

        // 2. Camera Setup
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.z = 50;

        // 3. Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // 4. Create Rotation Group
        this.rotationGroup = new THREE.Group();
        this.scene.add(this.rotationGroup);

        // 5. Generate Particle Heart
        this.createHeart();

        // 6. Bind Events
        this.bindEvents();

        // 7. Start Animation Loop
        this.animate();
    }

    createParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        // Glowing circle radial gradient
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 74, 141, 0.8)');
        gradient.addColorStop(0.5, 'rgba(157, 78, 221, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createHeart() {
        const particleCount = 4000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const randoms = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Generate heart points using 3D parametric equations
            // u goes from 0 to PI, v goes from 0 to 2*PI
            const u = Math.PI * Math.random();
            const v = 2 * Math.PI * Math.random();

            // 3D Heart equations:
            // x = 16 * sin^3(u) * sin(v)
            // y = 13 * cos(u) - 5 * cos(2*u) - 2 * cos(3*u) - cos(4*u)
            // z = 16 * sin^3(u) * cos(v)
            
            const sinU = Math.sin(u);
            const x = 16 * Math.pow(sinU, 3) * Math.sin(v);
            const y = 13 * Math.cos(u) - 5 * Math.cos(2*u) - 2 * Math.cos(3*u) - Math.cos(4*u);
            const z = 16 * Math.pow(sinU, 3) * Math.cos(v);

            // Scale factor to fit the container comfortably
            const scale = 0.9;
            positions[i * 3] = x * scale;
            positions[i * 3 + 1] = y * scale;
            positions[i * 3 + 2] = z * scale;

            // Individual size variations
            sizes[i] = 1.0 + Math.random() * 2.5;

            // Random seed for shimmer animations
            randoms[i] = Math.random() * Math.PI * 2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('randomSeed', new THREE.BufferAttribute(randoms, 1));

        // Create custom shader material for glow & pulse control
        const material = new THREE.PointsMaterial({
            size: 1.2,
            map: this.createParticleTexture(),
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.9
        });

        this.heartParticles = new THREE.Points(geometry, material);
        this.rotationGroup.add(this.heartParticles);
    }

    bindEvents() {
        const onStart = (e) => {
            this.isDragging = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            this.previousMousePosition = { x: clientX, y: clientY };
        };

        const onMove = (e) => {
            if (!this.isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const deltaX = clientX - this.previousMousePosition.x;
            const deltaY = clientY - this.previousMousePosition.y;

            this.targetRotation.y += deltaX * 0.007;
            this.targetRotation.x += deltaY * 0.007;

            // Limit X axis rotation to avoid flipping upside down
            this.targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetRotation.x));

            this.previousMousePosition = { x: clientX, y: clientY };
        };

        const onEnd = () => {
            this.isDragging = false;
        };

        // Desktop Events
        this.container.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        // Mobile Events
        this.container.addEventListener('touchstart', onStart);
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onEnd);

        // Resize Event
        window.addEventListener('resize', () => this.onResize());
    }

    onResize() {
        if (!this.container || !this.renderer) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // 1. Slow automatic rotation when not dragging
        if (!this.isDragging) {
            this.targetRotation.y += 0.003;
        }

        // Smoothly interpolate rotation (Lerp)
        this.rotationGroup.rotation.y += (this.targetRotation.y - this.rotationGroup.rotation.y) * 0.1;
        this.rotationGroup.rotation.x += (this.targetRotation.x - this.rotationGroup.rotation.x) * 0.1;

        // 2. Pulse effect (Simulating heartbeat)
        const pulse = 1.0 + Math.sin(time * 3.5) * 0.08;
        this.rotationGroup.scale.set(pulse, pulse, pulse);

        // 3. Shimmer/Wave particles
        if (this.heartParticles) {
            const positions = this.heartParticles.geometry.attributes.position.array;
            const randoms = this.heartParticles.geometry.attributes.randomSeed.array;
            const count = positions.length / 3;

            for (let i = 0; i < count; i++) {
                const indexY = i * 3 + 1;
                // Add a small wave motion along Y axis
                const initialY = positions[indexY];
                positions[indexY] = initialY + Math.sin(time * 2 + randoms[i]) * 0.02;
            }
            this.heartParticles.geometry.attributes.position.needsUpdate = true;
        }

        this.renderer.render(this.scene, this.camera);
    }
}
