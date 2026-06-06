/**
 * Main Application Logic for Birthday Website
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGER ---
    const state = {
        currentLevel: 1,
        unlockedLevels: [1],
        clickedCarouselCards: new Set(),
        flippedMagicCards: new Set(),
        musicPlaying: false,
        totalSteps: 5
    };

    // --- DOM ELEMENTS ---
    const dom = {
        loadingScreen: document.getElementById('loading-screen'),
        loadingProgress: document.getElementById('loading-progress'),
        loadingText: document.getElementById('loading-text'),
        audioControl: document.getElementById('audio-control'),
        bgMusic: document.getElementById('bg-music'),
        loveHeader: document.getElementById('love-header'),
        steps: document.querySelectorAll('.step'),
        
        // Sections
        secUnlock: document.getElementById('sec-unlock'),
        secCarousel: document.getElementById('sec-carousel'),
        secLetter: document.getElementById('sec-letter'),
        secWishes: document.getElementById('sec-wishes'),
        secFinale: document.getElementById('sec-finale'),
        
        // Interactive Elements
        giftBoxScene: document.querySelector('.gift-box-scene'),
        giftBox: document.getElementById('interactive-gift-box'),
        passcodeInput: document.getElementById('passcode-input'),
        btnUnlock: document.getElementById('btn-unlock'),
        errorMessage: document.getElementById('error-message'),
        quizOpts: document.querySelectorAll('.quiz-opt'),
        togglePasscodeBtn: document.getElementById('toggle-passcode-input'),
        manualPasscodeGroup: document.getElementById('manual-passcode-group'),
        
        // Carousel
        carousel: document.getElementById('memory-carousel'),
        carouselCards: document.querySelectorAll('.carousel-card'),
        carouselDescBox: document.getElementById('carousel-desc-box'),
        btnToEnvelope: document.getElementById('btn-to-envelope'),
        
        // Letter
        envelope: document.getElementById('interactive-envelope'),
        envelopeFlap: document.getElementById('envelope-flap'),
        letterPaper: document.getElementById('letter-paper'),
        typewriterText: document.getElementById('typewriter-text'),
        btnToWishes: document.getElementById('btn-to-wishes'),
        
        // Wishes
        magicCards: document.querySelectorAll('.magic-card'),
        flipCount: document.getElementById('flip-count'),
        btnToFinale: document.getElementById('btn-to-finale'),
        
        // Finale
        btnLove: document.getElementById('btn-love'),
        btnReplay: document.getElementById('btn-replay'),
        threejsContainer: document.getElementById('threejs-container'),
        
        // Modal
        modal: document.getElementById('custom-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalImg: document.getElementById('modal-img'),
        modalText: document.getElementById('modal-text'),
        modalCloseBtn: document.getElementById('modal-close-btn'),
        
        // Canvases
        ambientCanvas: document.getElementById('ambient-canvas'),
        fireworksCanvas: document.getElementById('fireworks-canvas'),
        confettiContainer: document.getElementById('confetti-container')
    };

    // --- INITIALIZATION ---
    simulateLoading();
    initAmbientParticles();
    initAudioController();
    initGiftBoxInteraction();
    initCarouselDrag();
    initEnvelopeInteraction();
    initMagicCardsInteraction();
    initModalEvents();
    initFinaleEvents();
    startLoveCounter();

    // ==========================================================================
    // LOVE COUNTER CLOCK
    // ==========================================================================
    function startLoveCounter() {
        const startDate = new Date('2026-02-25T00:00:00'); // Anniversary start date (editable)
        
        function updateCounter() {
            const now = new Date();
            const diff = now - startDate;
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            
            const daysEl = document.getElementById('count-days');
            const hoursEl = document.getElementById('count-hours');
            const minsEl = document.getElementById('count-minutes');
            const secsEl = document.getElementById('count-seconds');
            
            if (daysEl) daysEl.textContent = String(days).padStart(3, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
            if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
        }
        
        updateCounter();
        setInterval(updateCounter, 1000);
    }

    // ==========================================================================
    // 1. SIMULATE LOADING & TRANSITION
    // ==========================================================================
    function simulateLoading() {
        let progress = 0;
        const interval = setInterval(() => {
            // Random incremental load
            progress += Math.floor(Math.random() * 8) + 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Hide loader and show unlock screen
                setTimeout(() => {
                    dom.loadingScreen.classList.add('fade-out');
                    animateUnlockEntrance();
                }, 500);
            }
            dom.loadingProgress.style.width = `${progress}%`;
            dom.loadingText.textContent = `${progress}%`;
        }, 80);
    }

    function animateUnlockEntrance() {
        // Animate elements inside unlock section using GSAP
        gsap.fromTo('#sec-unlock h1', 
            { opacity: 0, y: -30 }, 
            { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
        );
        gsap.fromTo('#sec-unlock .subtitle', 
            { opacity: 0 }, 
            { opacity: 1, duration: 1.2, delay: 0.3 }
        );
        gsap.fromTo('.gift-box-scene', 
            { opacity: 0, scale: 0.5, rotateY: 0 }, 
            { opacity: 1, scale: 1, rotateY: 45, duration: 1.5, delay: 0.6, ease: "back.out(1.7)" }
        );
        gsap.fromTo('.passcode-container', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 1.2, delay: 1, ease: "power3.out" }
        );
    }

    // ==========================================================================
    // 2. AMBIENT BACKGROUND PARTICLES (STARS & HEARTS)
    // ==========================================================================
    function initAmbientParticles() {
        const ctx = dom.ambientCanvas.getContext('2d');
        let particles = [];
        
        function resize() {
            dom.ambientCanvas.width = window.innerWidth;
            dom.ambientCanvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * dom.ambientCanvas.width;
                this.y = Math.random() * dom.ambientCanvas.height + dom.ambientCanvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedY = -(Math.random() * 1.2 + 0.4);
                this.speedX = Math.random() * 0.8 - 0.4;
                this.color = Math.random() > 0.5 ? 'rgba(255, 74, 141, 0.3)' : 'rgba(157, 78, 221, 0.3)';
                this.isHeart = Math.random() > 0.85;
                this.opacity = Math.random() * 0.5 + 0.3;
                this.pulseSpeed = Math.random() * 0.02 + 0.01;
                this.pulseDir = 1;
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                
                // Opacity shimmer
                this.opacity += this.pulseSpeed * this.pulseDir;
                if (this.opacity > 0.8 || this.opacity < 0.2) {
                    this.pulseDir *= -1;
                }

                if (this.y < -20 || this.x < -20 || this.x > dom.ambientCanvas.width + 20) {
                    this.reset();
                    this.y = dom.ambientCanvas.height + 10;
                }
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                
                if (this.isHeart) {
                    // Draw a small heart shape
                    const d = this.size * 3;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y + d / 4);
                    ctx.quadraticCurveTo(this.x, this.y, this.x - d / 2, this.y);
                    ctx.quadraticCurveTo(this.x - d, this.y, this.x - d, this.y + d / 2);
                    ctx.quadraticCurveTo(this.x - d, this.y + d, this.x, this.y + d * 1.5);
                    ctx.quadraticCurveTo(this.x + d, this.y + d, this.x + d, this.y + d / 2);
                    ctx.quadraticCurveTo(this.x + d, this.y, this.x + d / 2, this.y);
                    ctx.quadraticCurveTo(this.x, this.y, this.x, this.y + d / 4);
                    ctx.closePath();
                    ctx.fill();
                } else {
                    // Draw a glowing star point
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }

        // Initialize particles
        const count = Math.min(80, window.innerWidth / 15);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
            // Pre-warm position so they don't all start from the bottom initially
            particles[i].y = Math.random() * dom.ambientCanvas.height;
        }

        // Global spawner for hearts on click
        window.spawnAmbientHeart = (x, y) => {
            const p = new Particle();
            p.x = x;
            p.y = y;
            p.isHeart = true;
            p.size = Math.random() * 4 + 3; // larger
            p.speedY = -(Math.random() * 2 + 1); // faster
            p.opacity = 0.9;
            p.color = Math.random() > 0.5 ? 'rgba(255, 74, 141, 0.8)' : 'rgba(255, 117, 143, 0.8)';
            particles.push(p);
            if (particles.length > 200) particles.shift();
        };

        // Click anywhere to spawn hearts
        document.addEventListener('click', (e) => {
            // Avoid triggering when clicking buttons, inputs, disc or header
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.disc-wrapper') || e.target.closest('.modal-card') || e.target.closest('.step')) return;
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    window.spawnAmbientHeart(
                        e.clientX + (Math.random() * 30 - 15), 
                        e.clientY + (Math.random() * 30 - 15)
                    );
                }, i * 60);
            }
        });

        // Touch drag heart spawning trail on mobile devices
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                if (Math.random() > 0.65 && window.spawnAmbientHeart) {
                    window.spawnAmbientHeart(touch.clientX, touch.clientY);
                }
            }
        }, { passive: true });

        function loop() {
            ctx.clearRect(0, 0, dom.ambientCanvas.width, dom.ambientCanvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(loop);
        }
        loop();
    }

    // ==========================================================================
    // 3. AUDIO CONTROL CONTROLLER
    // ==========================================================================
    function initAudioController() {
        dom.audioControl.addEventListener('click', () => {
            toggleMusic();
        });
    }

    function toggleMusic(playForce = null) {
        const shouldPlay = playForce !== null ? playForce : !state.musicPlaying;
        
        if (shouldPlay) {
            dom.bgMusic.play().then(() => {
                state.musicPlaying = true;
                dom.audioControl.classList.add('playing');
            }).catch(e => {
                console.log("Audio play blocked by browser. Awaiting interaction.", e);
            });
        } else {
            dom.bgMusic.pause();
            state.musicPlaying = false;
            dom.audioControl.classList.remove('playing');
        }
    }

    // ==========================================================================
    // 4. LEVEL 1: UNLOCK & GIFT BOX OPENING
    // ==========================================================================
    function initGiftBoxInteraction() {
        // Unlock on box click, button click or quiz option click
        dom.giftBox.addEventListener('click', () => {
            // Auto trigger quiz options shake if they click giftbox directly
            gsap.fromTo('.passcode-container', 
                { scale: 0.95 }, 
                { scale: 1, duration: 0.5, ease: "bounce.out" }
            );
            dom.errorMessage.textContent = "Hãy trả lời câu hỏi trắc nghiệm bên dưới để mở hộp quà nhé! 😉";
        });
        
        // Handle Quiz Buttons
        dom.quizOpts.forEach((opt) => {
            opt.addEventListener('click', () => {
                const isCorrect = opt.getAttribute('data-correct') === 'true';
                
                // Clear state classes
                dom.quizOpts.forEach(o => o.classList.remove('incorrect', 'correct'));
                
                if (isCorrect) {
                    opt.classList.add('correct');
                    dom.errorMessage.textContent = "Mật mã tình yêu chính xác! Đang chuẩn bị quà...";
                    dom.errorMessage.style.color = "#00ff88";
                    
                    // Trigger Unlock
                    setTimeout(() => {
                        triggerUnlockSuccess();
                    }, 600);
                } else {
                    opt.classList.add('incorrect');
                    dom.errorMessage.textContent = "Sai rồi nha bé ơi! Suy nghĩ kỹ lại xem nào! 😜";
                    dom.errorMessage.style.color = "#ff3366";
                    
                    setTimeout(() => {
                        opt.classList.remove('incorrect');
                    }, 500);
                }
            });
        });

        // Toggle Manual passcode group
        dom.togglePasscodeBtn.addEventListener('click', () => {
            if (dom.manualPasscodeGroup.classList.contains('hidden-input')) {
                dom.manualPasscodeGroup.classList.remove('hidden-input');
                dom.manualPasscodeGroup.classList.add('show-input');
                dom.togglePasscodeBtn.innerHTML = 'Ẩn nhập mật mã <i class="fas fa-chevron-up"></i>';
            } else {
                dom.manualPasscodeGroup.classList.remove('show-input');
                dom.manualPasscodeGroup.classList.add('hidden-input');
                dom.togglePasscodeBtn.innerHTML = 'Hoặc nhập mật mã bí mật <i class="fas fa-chevron-down"></i>';
            }
        });

        dom.btnUnlock.addEventListener('click', () => {
            const inputCode = dom.passcodeInput.value.trim();
            if (inputCode === "1314" || inputCode === "love" || inputCode.toLowerCase() === "ngọc" || inputCode.toLowerCase() === "ngoc") {
                triggerUnlockSuccess();
            } else {
                dom.errorMessage.textContent = "Mật mã chưa đúng rồi nè! Thử lại nha.";
                dom.errorMessage.style.color = "#ff3366";
                gsap.fromTo('#passcode-input', 
                    { x: -10 }, 
                    { x: 0, duration: 0.5, ease: "rough({strength: 2, points: 10, template: linear})" }
                );
            }
        });
        
        dom.passcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') dom.btnUnlock.click();
        });
    }

    function triggerUnlockSuccess() {
        if (state.unlockedLevels.includes(2)) return; // Already unlocked

        dom.errorMessage.textContent = "";
        
        // Open Box Animation
        dom.giftBoxScene.classList.add('opened');
        
        // Start Music
        toggleMusic(true);
        dom.audioControl.classList.remove('hidden');
        
        // Burst heart confetti
        burstConfetti(120);

        // Switch to Level 2 after 1.5s
        setTimeout(() => {
            transitionToSection(2);
        }, 1500);
    }

    // Burst Confetti Effect from center
    function burstConfetti(count = 50) {
        const colors = ['#ff4a8d', '#9d4edd', '#ffb703', '#ffffff', '#ff758f'];
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;

        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            dom.confettiContainer.appendChild(el);

            const size = Math.random() * 8 + 5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            el.style.backgroundColor = color;
            el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            el.style.left = `${startX}px`;
            el.style.top = `${startY}px`;

            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 12 + 6;
            const destX = startX + Math.cos(angle) * (Math.random() * 200 + 100);
            const destY = startY + Math.sin(angle) * (Math.random() * 200 + 100) - (Math.random() * 100);

            // Animate using GSAP
            gsap.to(el, {
                x: destX - startX,
                y: destY - startY,
                rotation: Math.random() * 720,
                opacity: 0,
                duration: Math.random() * 1.5 + 1,
                ease: "power2.out",
                onComplete: () => el.remove()
            });
        }
    }

    // ==========================================================================
    // 5. LEVEL 2: 3D MEMORY CAROUSEL DRAG & INTERACTION
    // ==========================================================================
    function initCarouselDrag() {
        let isDragging = false;
        let startX = 0;
        let currentRotationY = 0;
        let velocity = 0;
        let lastX = 0;
        let frameId = null;

        const getClientX = (e) => e.touches ? e.touches[0].clientX : e.clientX;

        const startDrag = (e) => {
            isDragging = true;
            startX = getClientX(e);
            lastX = startX;
            velocity = 0;
            if (frameId) cancelAnimationFrame(frameId);
        };

        const onDrag = (e) => {
            if (!isDragging) return;
            const x = getClientX(e);
            const deltaX = x - lastX;
            
            // Lock vertical scrolling on mobile touchmove if swiping horizontally (native feel)
            if (e.cancelable) {
                e.preventDefault();
            }
            
            // Map movement to rotation degree
            velocity = deltaX * 0.3;
            currentRotationY += velocity;
            dom.carousel.style.transform = `rotateY(${currentRotationY}deg)`;
            lastX = x;
        };

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            
            // Inertia deceleration loop
            const decay = () => {
                if (Math.abs(velocity) < 0.1) {
                    cancelAnimationFrame(frameId);
                    // Snap to the nearest card (increments of 90 degrees)
                    snapToNearestCard();
                    return;
                }
                velocity *= 0.92; // decay factor
                currentRotationY += velocity;
                dom.carousel.style.transform = `rotateY(${currentRotationY}deg)`;
                frameId = requestAnimationFrame(decay);
            };
            frameId = requestAnimationFrame(decay);
        };

        function snapToNearestCard() {
            // Cards are spaced 90 degrees apart
            const nearestAngle = Math.round(currentRotationY / 90) * 90;
            gsap.to(dom.carousel, {
                rotateY: nearestAngle,
                duration: 0.6,
                ease: "power2.out",
                onUpdate: () => {
                    // Update rotation state sync
                    const matches = dom.carousel.style.transform.match(/rotateY\(([-\d.]+)deg\)/);
                    if (matches) currentRotationY = parseFloat(matches[1]);
                }
            });
        }

        // Apply Drag Events
        // Mouse Events
        dom.carousel.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('mouseup', endDrag);

        // Touch Events
        dom.carousel.addEventListener('touchstart', startDrag);
        dom.carousel.addEventListener('touchmove', onDrag, { passive: false });
        dom.carousel.addEventListener('touchend', endDrag);

        // Carousel Card Clicks
        dom.carouselCards.forEach((card) => {
            card.addEventListener('click', (e) => {
                // Ignore clicks if dragging with high velocity
                if (Math.abs(velocity) > 0.5) return;
                
                const index = card.getAttribute('style').match(/--index:\s*(\d+)/)[1];
                const caption = card.querySelector('.card-caption').textContent;
                const img = card.querySelector('img').src;
                const description = card.getAttribute('data-desc');

                openModal(caption, img, description);

                // Track click state
                state.clickedCarouselCards.add(index);
                
                // Show floating description box
                dom.carouselDescBox.textContent = description;
                
                // If they interacted with at least 3 cards, unlock Level 3 trigger
                if (state.clickedCarouselCards.size >= 3) {
                    dom.btnToEnvelope.classList.remove('hidden');
                    gsap.fromTo('#btn-to-envelope', 
                        { opacity: 0, scale: 0.8 }, 
                        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
                    );
                }
            });
        });

        // Navigation button to envelope section
        dom.btnToEnvelope.addEventListener('click', () => {
            transitionToSection(3);
        });
    }

    // ==========================================================================
    // 6. LEVEL 3: 3D ENVELOPE & LOVE LETTER (TYPEWRITER)
    // ==========================================================================
    function initEnvelopeInteraction() {
        dom.envelope.addEventListener('click', () => {
            if (dom.envelope.classList.contains('open')) return;
            
            dom.envelope.classList.add('open');
            dom.secLetter.classList.add('letter-open-state'); // hide titles to prevent overlaps
            
            // Start typewriter typing after envelope slide animation ends (approx 800ms)
            setTimeout(() => {
                startTypewriter();
            }, 800);
        });

        dom.btnToWishes.addEventListener('click', () => {
            transitionToSection(4);
        });
    }

    function playTypewriterTick() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sine';
            // Play a soft cute pop bubble sound
            osc.frequency.setValueAtTime(900 + Math.random() * 300, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.04);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
        } catch(e) {
            // Audio context block/not supported
        }
    }

    function startTypewriter() {
        const text = "Hôm nay là một ngày vô cùng đặc biệt - ngày sinh nhật của cô gái mà anh thương nhất. Anh muốn viết bức thư này để gửi đến em mọi ấm áp từ trái tim anh...\n\nCảm ơn em đã xuất hiện bên anh, đã cùng anh đi qua những buồn vui và làm cho thế giới của anh ngập tràn hạnh phúc. Anh ước mong ở tuổi mới, công chúa nhỏ của anh luôn rạng rỡ, tự tin và ngập tràn niềm vui. Anh hứa sẽ luôn là chỗ dựa vững chãi, luôn yêu thương, lắng nghe và đồng hành cùng em trên mọi chặng đường sắp tới.\n\nChúc mừng sinh nhật em yêu của anh! 💕";
        let index = 0;
        dom.typewriterText.innerHTML = "";
        
        function type() {
            if (index < text.length) {
                const char = text.charAt(index);
                if (char === '\n') {
                    dom.typewriterText.innerHTML += '<br>';
                } else {
                    dom.typewriterText.innerHTML += char;
                }
                index++;
                
                // Play tactile pop feedback sound
                playTypewriterTick();
                
                // Scroll container to bottom
                dom.typewriterText.scrollTop = dom.typewriterText.scrollHeight;
                
                // Typing sound tick simulation or random speed
                const speed = char === ',' || char === '.' ? 250 : (Math.random() * 40 + 30);
                setTimeout(type, speed);
            } else {
                // Done typing - show navigation button
                dom.btnToWishes.classList.remove('hidden');
                gsap.fromTo('#btn-to-wishes', 
                    { opacity: 0, y: 15 }, 
                    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
                );
            }
        }
        type();
    }

    // ==========================================================================
    // 7. LEVEL 4: MAGIC CARDS INTERACTION
    // ==========================================================================
    function initMagicCardsInteraction() {
        dom.magicCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                if (card.classList.contains('flipped')) return;
                
                // Limit to 3 card selections
                if (state.flippedMagicCards.size >= 3) {
                    // Alert or wiggle card to indicate limit
                    gsap.fromTo(card, 
                        { x: -5 }, 
                        { x: 0, duration: 0.4, ease: "rough({strength: 1, points: 5, template: linear})" }
                    );
                    return;
                }

                card.classList.add('flipped');
                state.flippedMagicCards.add(index);
                
                // Update text
                dom.flipCount.textContent = state.flippedMagicCards.size;

                // Burst small star spark particles from card position
                burstStarsFromCard(card);

                // Handle complete selection
                if (state.flippedMagicCards.size === 3) {
                    dom.btnToFinale.classList.remove('hidden');
                    gsap.fromTo('#btn-to-finale', 
                        { opacity: 0, y: 15 }, 
                        { opacity: 1, y: 0, duration: 0.6, delay: 0.5, ease: "power2.out" }
                    );
                    
                    // Add subtle glow limit text
                    document.getElementById('cards-status').textContent = "Bạn đã chọn đủ 3 đặc quyền! Hãy chuyển tiếp để hoàn thành nghi lễ tình yêu 💕";
                    document.getElementById('cards-status').style.backgroundColor = "rgba(157, 78, 221, 0.2)";
                    document.getElementById('cards-status').style.borderColor = "var(--secondary)";
                }
            });
        });

        dom.btnToFinale.addEventListener('click', () => {
            transitionToSection(5);
        });
    }

    function burstStarsFromCard(cardEl) {
        const rect = cardEl.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        for (let i = 0; i < 20; i++) {
            const star = document.createElement('i');
            star.className = 'fas fa-star';
            star.style.position = 'fixed';
            star.style.left = `${startX}px`;
            star.style.top = `${startY}px`;
            star.style.color = '#ffb703';
            star.style.fontSize = `${Math.random() * 8 + 6}px`;
            star.style.zIndex = '999';
            star.style.pointerEvents = 'none';
            document.body.appendChild(star);

            const angle = Math.random() * Math.PI * 2;
            const length = Math.random() * 80 + 30;
            
            gsap.to(star, {
                x: Math.cos(angle) * length,
                y: Math.sin(angle) * length,
                rotation: Math.random() * 360,
                opacity: 0,
                scale: 0.2,
                duration: 1.0,
                ease: "power2.out",
                onComplete: () => star.remove()
            });
        }
    }

    // ==========================================================================
    // 8. LEVEL 5: GRAND FINALE EVENTS & FIREWORKS CANVAS
    // ==========================================================================
    let fireworksAnimId = null;
    let fireworksArr = [];

    function initFinaleEvents() {
        dom.btnLove.addEventListener('click', () => {
            // Trigger 12 massive explosions (normal + heart shape)
            for(let i=0; i<12; i++) {
                setTimeout(() => {
                    const randomX = Math.random() * dom.fireworksCanvas.width;
                    const randomY = Math.random() * (dom.fireworksCanvas.height * 0.5) + 80;
                    
                    if (Math.random() > 0.4 && window.createHeartExplosion) {
                        window.createHeartExplosion(randomX, randomY);
                    } else if (window.createFireworkExplosion) {
                        window.createFireworkExplosion(randomX, randomY);
                    }
                }, i * 180);
            }
            
            // Pop romantic title bounce
            gsap.fromTo('.main-birthday-title', 
                { scale: 1 }, 
                { scale: 1.15, duration: 0.3, ease: "back.out(2)", yoyo: true, repeat: 1 }
            );

            // Burst global screen hearts
            burstConfetti(80);
        });

        dom.btnReplay.addEventListener('click', () => {
            resetWebsite();
        });
    }

    function startFireworks() {
        const ctx = dom.fireworksCanvas.getContext('2d');
        
        function resize() {
            dom.fireworksCanvas.width = window.innerWidth;
            dom.fireworksCanvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.radius = Math.random() * 2 + 1;
                this.angle = Math.random() * Math.PI * 2;
                this.velocity = Math.random() * 5 + 2;
                this.vx = Math.cos(this.angle) * this.velocity;
                this.vy = Math.sin(this.angle) * this.velocity;
                this.gravity = 0.06;
                this.alpha = 1;
                this.decay = Math.random() * 0.015 + 0.008;
            }
            update() {
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 6;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        class Rocket {
            constructor() {
                this.x = Math.random() * dom.fireworksCanvas.width;
                this.y = dom.fireworksCanvas.height;
                this.tx = Math.random() * dom.fireworksCanvas.width;
                this.ty = Math.random() * (dom.fireworksCanvas.height * 0.5) + 50;
                this.speed = Math.random() * 3 + 4;
                this.angle = Math.atan2(this.ty - this.y, this.tx - this.x);
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;
                this.trail = [];
                this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                this.trail.push({x: this.x, y: this.y});
                if(this.trail.length > 10) this.trail.shift();

                const dist = Math.hypot(this.tx - this.x, this.ty - this.y);
                if (dist < 10 || this.vy >= 0) {
                    // Explode!
                    createFireworkExplosion(this.x, this.y, this.color);
                    return false;
                }
                return true;
            }
            draw() {
                ctx.save();
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.shadowBlur = 8;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                if(this.trail.length > 0) {
                    ctx.moveTo(this.trail[0].x, this.trail[0].y);
                    for(let i=1; i<this.trail.length; i++) {
                        ctx.lineTo(this.trail[i].x, this.trail[i].y);
                    }
                } else {
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.x - this.vx, this.y - this.vy);
                }
                ctx.stroke();
                ctx.restore();
            }
        }

        let rockets = [];
        fireworksArr = [];

        function createExplosion(x, y, color) {
            const hue = Math.random() * 360;
            const chosenColor = color || `hsl(${hue}, 100%, 65%)`;
            for (let i = 0; i < 60; i++) {
                fireworksArr.push(new Particle(x, y, chosenColor));
            }
        }
        
        // Heart Shaped Firework Explosion
        function createHeartExplosion(x, y, color) {
            const hue = Math.random() * 360;
            const chosenColor = color || `hsl(${hue}, 100%, 65%)`;
            const count = 70;
            for (let i = 0; i < count; i++) {
                const t = (i / count) * Math.PI * 2;
                // Parametric heart:
                // vx = 16 * sin^3(t)
                // vy = -(13 * cos(t) - 5 * cos(2t) - 2 * cos(3t) - cos(4t))
                const vx = 16 * Math.pow(Math.sin(t), 3);
                const vy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
                
                // Slow down scale to fit canvas
                const speed = 0.32 + Math.random() * 0.12;
                
                const p = new Particle(x, y, chosenColor);
                p.vx = vx * speed;
                p.vy = vy * speed;
                p.gravity = 0.04;
                p.decay = Math.random() * 0.012 + 0.006;
                fireworksArr.push(p);
            }
        }
        
        window.createFireworkExplosion = createExplosion; // Expose globally
        window.createHeartExplosion = createHeartExplosion; // Expose globally

        let autoLaunchTimer = 0;

        function loop() {
            // Semi-transparent overlay to create trails
            ctx.fillStyle = 'rgba(7, 3, 20, 0.15)';
            ctx.fillRect(0, 0, dom.fireworksCanvas.width, dom.fireworksCanvas.height);

            // Auto rocket launch
            autoLaunchTimer++;
            if (autoLaunchTimer % 35 === 0) {
                rockets.push(new Rocket());
            }

            // Update & Draw Rockets
            rockets = rockets.filter(r => {
                const alive = r.update();
                if (!alive) {
                    // Explode!
                    if (Math.random() > 0.45) {
                        createHeartExplosion(r.x, r.y, r.color);
                    } else {
                        createExplosion(r.x, r.y, r.color);
                    }
                } else {
                    r.draw();
                }
                return alive;
            });

            // Update & Draw Explosion Particles
            fireworksArr = fireworksArr.filter(p => {
                p.update();
                if (p.alpha > 0) {
                    p.draw();
                    return true;
                }
                return false;
            });

            fireworksAnimId = requestAnimationFrame(loop);
        }
        loop();
    }

    function stopFireworks() {
        if(fireworksAnimId) {
            cancelAnimationFrame(fireworksAnimId);
        }
        const ctx = dom.fireworksCanvas.getContext('2d');
        ctx.clearRect(0, 0, dom.fireworksCanvas.width, dom.fireworksCanvas.height);
    }

    // ==========================================================================
    // 9. MODAL WINDOWS
    // ==========================================================================
    function initModalEvents() {
        dom.modalCloseBtn.addEventListener('click', closeModal);
        dom.modal.addEventListener('click', (e) => {
            if (e.target === dom.modal) closeModal();
        });
        
        // Escape key close
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    function openModal(title, imgSrc, desc) {
        dom.modalTitle.textContent = title;
        dom.modalImg.src = imgSrc;
        dom.modalText.textContent = desc;
        
        dom.modal.classList.remove('hidden');
        
        // Animate modal open
        gsap.fromTo('.modal-card', 
            { scale: 0.85, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)" }
        );
    }

    function closeModal() {
        gsap.to('.modal-card', {
            scale: 0.85,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                dom.modal.classList.add('hidden');
            }
        });
    }

    // ==========================================================================
    // 10. NAVIGATION FLOW CONTROLLER
    // ==========================================================================
    function transitionToSection(targetLevel) {
        // Find current and target section elements
        const currentSec = getSectionEl(state.currentLevel);
        const targetSec = getSectionEl(targetLevel);
        
        if (!currentSec || !targetSec) return;

        // Animate Out current section
        gsap.to(currentSec, {
            opacity: 0,
            y: -20,
            scale: 0.98,
            duration: 0.6,
            onComplete: () => {
                currentSec.classList.remove('active-section');
                currentSec.classList.add('hidden-section');
                
                // Show Header Steps
                if (targetLevel > 1) {
                    dom.loveHeader.classList.add('visible');
                } else {
                    dom.loveHeader.classList.remove('visible');
                }

                // Update Level State
                state.currentLevel = targetLevel;
                if (!state.unlockedLevels.includes(targetLevel)) {
                    state.unlockedLevels.push(targetLevel);
                }

                // Update Step Icons UI
                updateStepsUI();

                // Prepare target section
                targetSec.classList.remove('hidden-section');
                targetSec.classList.add('active-section');
                
                // Animate In target section
                gsap.fromTo(targetSec, 
                    { opacity: 0, y: 30, scale: 0.98 }, 
                    { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" }
                );

                // Specific Initialization when section becomes active
                onSectionActive(targetLevel);
            }
        });
    }

    function getSectionEl(level) {
        switch(level) {
            case 1: return dom.secUnlock;
            case 2: return dom.secCarousel;
            case 3: return dom.secLetter;
            case 4: return dom.secWishes;
            case 5: return dom.secFinale;
            default: return null;
        }
    }

    function updateStepsUI() {
        dom.steps.forEach((step) => {
            const stepNum = parseInt(step.getAttribute('data-step'));
            
            // Remove previous classes
            step.classList.remove('active', 'completed');
            
            if (stepNum === state.currentLevel) {
                step.classList.add('active');
            } else if (stepNum < state.currentLevel) {
                step.classList.add('completed');
            }
        });
    }

    // Actions to run when a level loads
    function onSectionActive(level) {
        if (level === 2) {
            // Memory carousel active animation
            gsap.from('.carousel-3d-container', { scale: 0.8, duration: 1.2, ease: "back.out(1.5)" });
        } else if (level === 5) {
            // Finale loaded - start Fireworks & Three.js Heart
            startFireworks();
            
            // Instantiate ThreeJS Particle Heart
            dom.threejsContainer.innerHTML = ""; // Clear
            new Heart3D('threejs-container');
        } else {
            // Stop fireworks if leaving Level 5 (e.g. replay)
            stopFireworks();
        }
    }

    // Bind Step Click events (allow jumping to unlocked levels)
    dom.steps.forEach((step) => {
        step.addEventListener('click', () => {
            const targetStep = parseInt(step.getAttribute('data-step'));
            
            if (state.unlockedLevels.includes(targetStep) && targetStep !== state.currentLevel) {
                // If typewriter is in progress, it's safer to not break the typewriter animation or let them jump back
                transitionToSection(targetStep);
            }
        });
    });

    // ==========================================================================
    // 11. WEBSITE REPLAY RESET
    // ==========================================================================
    function resetWebsite() {
        // Go back to section 1 (triggers section 5 fade out and section 1 fade in)
        transitionToSection(1);

        // Reset states
        state.unlockedLevels = [1];
        state.clickedCarouselCards.clear();
        state.flippedMagicCards.clear();
        
        // Reset visual elements
        dom.errorMessage.textContent = "";
        dom.passcodeInput.value = "";

        // Clear GSAP inline styles to let CSS classes hide the buttons correctly
        gsap.set(['#btn-to-envelope', '#btn-to-wishes', '#btn-to-finale'], { clearProps: "all" });
        
        // Lock carousel button
        dom.btnToEnvelope.classList.add('hidden');
        dom.carouselDescBox.textContent = "Click vào ảnh để xem thông điệp ngọt ngào phía sau!";
        
        // Reset envelope
        dom.envelope.classList.remove('open');
        dom.secLetter.classList.remove('letter-open-state'); // remove layout hide class
        dom.btnToWishes.classList.add('hidden');
        dom.typewriterText.innerHTML = "";
        
        // Reset magic cards
        dom.magicCards.forEach(card => card.classList.remove('flipped'));
        dom.btnToFinale.classList.add('hidden');
        dom.flipCount.textContent = "0";
        document.getElementById('cards-status').innerHTML = 'Đã lật: <span id="flip-count">0</span> / 3 thẻ. Hãy lật đủ 3 thẻ nhé!';
        document.getElementById('cards-status').style.backgroundColor = "rgba(255, 74, 141, 0.1)";
        document.getElementById('cards-status').style.borderColor = "var(--primary-glow)";
        
        // Reset Quiz buttons
        dom.quizOpts.forEach(opt => opt.classList.remove('correct', 'incorrect'));
        dom.manualPasscodeGroup.classList.remove('show-input');
        dom.manualPasscodeGroup.classList.add('hidden-input');
        dom.togglePasscodeBtn.innerHTML = 'Hoặc nhập mật mã bí mật <i class="fas fa-chevron-down"></i>';

        // Close modal
        closeModal();
        
        // Turn off music
        toggleMusic(false);
        dom.audioControl.classList.add('hidden');
        
        // Close box visual
        dom.giftBoxScene.classList.remove('opened');
    }
});
