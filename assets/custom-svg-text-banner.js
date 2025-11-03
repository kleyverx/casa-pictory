// Custom SVG Text Banner Carousel JavaScript
(function() {
    'use strict';
    
    // Carousel state management
    const carousels = new Map();
    
    // Initialize carousel for a specific section
    function initCarousel(sectionId) {
        const carousel = document.getElementById(`blocks-carousel-${sectionId}`);
        if (!carousel) return;
        
        const track = carousel.querySelector('.carousel-track');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.owl-dot');
        
        if (!track || slides.length === 0) return;
        
        // Get section element to read settings
        const section = document.querySelector(`[data-section-id="${sectionId}"]`);
        
        // Initialize carousel state
        const state = {
            currentSlide: 0,
            totalSlides: slides.length,
            track: track,
            slides: slides,
            dots: dots,
            isAnimating: false,
            autoplayTimer: null,
            section: section
        };
        
        carousels.set(sectionId, state);
        
        // Set initial position
        updateCarousel(sectionId);
        
        // Add touch/swipe support
        addTouchSupport(sectionId);
        
        // Auto-play functionality
        if (slides.length > 1) {
            startAutoPlay(sectionId);
        }
    }
    
    // Update carousel position and controls
    function updateCarousel(sectionId) {
        const state = carousels.get(sectionId);
        if (!state) return;
        
        const { currentSlide, totalSlides, track, dots } = state;
        
        // Update track position
        const translateX = -currentSlide * 100;
        track.style.transform = `translateX(${translateX}%)`;
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    // Move carousel by direction (-1 for prev, 1 for next)
    window.moveCarousel = function(sectionId, direction) {
        const state = carousels.get(sectionId);
        if (!state || state.isAnimating) return;
        
        state.isAnimating = true;
        
        const newSlide = state.currentSlide + direction;
        
        if (newSlide >= 0 && newSlide < state.totalSlides) {
            state.currentSlide = newSlide;
            updateCarousel(sectionId);
        }
        
        // Reset animation flag after transition
        setTimeout(() => {
            state.isAnimating = false;
        }, 300);
    };
    
    // Go to specific slide
    window.goToSlide = function(sectionId, slideIndex) {
        const state = carousels.get(sectionId);
        if (!state || state.isAnimating || slideIndex === state.currentSlide) return;
        
        state.isAnimating = true;
        state.currentSlide = slideIndex;
        updateCarousel(sectionId);
        
        // Reset animation flag after transition
        setTimeout(() => {
            state.isAnimating = false;
        }, 300);
    };
    
    // Add touch/swipe support
    function addTouchSupport(sectionId) {
        const state = carousels.get(sectionId);
        if (!state) return;
        
        const carousel = document.getElementById(`blocks-carousel-${sectionId}`);
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        // Touch events
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });
        
        carousel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        });
        
        carousel.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            
            const diffX = startX - currentX;
            const threshold = 50; // Minimum swipe distance
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    // Swipe left - next slide
                    moveCarousel(sectionId, 1);
                } else {
                    // Swipe right - previous slide
                    moveCarousel(sectionId, -1);
                }
            }
        });
        
        // Mouse events for desktop
        carousel.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
            carousel.style.cursor = 'grabbing';
        });
        
        carousel.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            currentX = e.clientX;
        });
        
        carousel.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            carousel.style.cursor = 'grab';
            
            const diffX = startX - currentX;
            const threshold = 50;
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    moveCarousel(sectionId, 1);
                } else {
                    moveCarousel(sectionId, -1);
                }
            }
        });
        
        carousel.addEventListener('mouseleave', () => {
            isDragging = false;
            carousel.style.cursor = 'grab';
        });
    }
    
    // Auto-play functionality
    function startAutoPlay(sectionId) {
        const state = carousels.get(sectionId);
        if (!state || !state.section) return;
        
        // Clear existing timer
        if (state.autoplayTimer) {
            clearInterval(state.autoplayTimer);
            state.autoplayTimer = null;
        }
        
        // Check if autoplay is enabled and we're on mobile
        const isMobile = window.innerWidth < 992; // Bootstrap lg breakpoint
        if (!isMobile) return;
        
        // Get autoplay settings from section data attributes or default values
        const enableAutoplay = state.section.dataset.enableAutoplay === 'true' || false;
        const autoplayInterval = parseFloat(state.section.dataset.autoplayInterval) || 4;
        
        if (!enableAutoplay) return;
        
        // Start autoplay timer
        state.autoplayTimer = setInterval(() => {
            if (!state.isAnimating) {
                const nextSlide = (state.currentSlide + 1) % state.totalSlides;
                goToSlide(sectionId, nextSlide);
            }
        }, autoplayInterval * 1000);
        
        // Pause autoplay on hover/touch
        const carousel = document.getElementById(`blocks-carousel-${sectionId}`);
        if (carousel) {
            carousel.addEventListener('mouseenter', () => pauseAutoPlay(sectionId));
            carousel.addEventListener('mouseleave', () => resumeAutoPlay(sectionId));
            carousel.addEventListener('touchstart', () => pauseAutoPlay(sectionId));
        }
    }
    
    // Pause autoplay
    function pauseAutoPlay(sectionId) {
        const state = carousels.get(sectionId);
        if (!state || !state.autoplayTimer) return;
        
        clearInterval(state.autoplayTimer);
        state.autoplayTimer = null;
    }
    
    // Resume autoplay
    function resumeAutoPlay(sectionId) {
        const state = carousels.get(sectionId);
        if (!state) return;
        
        // Only resume if we're still on mobile and autoplay was enabled
        const isMobile = window.innerWidth < 992;
        if (!isMobile) return;
        
        const enableAutoplay = state.section.dataset.enableAutoplay === 'true' || false;
        if (!enableAutoplay) return;
        
        startAutoPlay(sectionId);
    }
    
    // Initialize all carousels when DOM is ready
    function initAllCarousels() {
        const carouselContainers = document.querySelectorAll('[id^="blocks-carousel-"]');
        carouselContainers.forEach(container => {
            const sectionId = container.id.replace('blocks-carousel-', '');
            initCarousel(sectionId);
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllCarousels);
    } else {
        initAllCarousels();
    }
    
    // Re-initialize when Shopify theme editor updates
    if (window.Shopify && window.Shopify.designMode) {
        document.addEventListener('shopify:section:load', (event) => {
            const sectionId = event.detail.sectionId;
            setTimeout(() => initCarousel(sectionId), 100);
        });
        
        document.addEventListener('shopify:section:reorder', () => {
            setTimeout(initAllCarousels, 100);
        });
    }
    
})();