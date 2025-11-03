/**
 * Multi-Image Carousel - JavaScript Funcional y Encapsulado
 * Implementación optimizada con transiciones suaves y rendimiento mejorado
 */

(function() {
  'use strict';

  // Configuración por defecto
  const DEFAULT_CONFIG = {
    autoplay: false,
    autoplaySpeed: 3000,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    pauseOnHover: true,
    accessibility: true,
    swipeThreshold: 50
  };

  /**
   * Clase principal del carrusel
   */
  class MultiImageCarousel {
    constructor(element, options = {}) {
      this.element = element;
      this.config = { ...DEFAULT_CONFIG, ...options };
      this.currentSlide = 0;
      this.totalSlides = 0;
      this.isAnimating = false;
      this.autoplayTimer = null;
      this.touchStartX = 0;
      this.touchEndX = 0;
      
      this.init();
    }

    /**
     * Inicialización del carrusel
     */
    init() {
      this.setupElements();
      this.setupEventListeners();
      this.updateSlidePositions();
      this.updateNavigation();
      
      // Aplicar estilos personalizados después de configurar elementos
      this.applyCustomStyles();
      
      if (this.config.autoplay) {
        this.startAutoplay();
      }

      // Marcar como inicializado
      this.element.classList.add('carousel-initialized');
      
      // Evento personalizado de inicialización
      this.element.dispatchEvent(new CustomEvent('carousel:initialized', {
        detail: { carousel: this }
      }));
    }

    /**
     * Configuración de elementos DOM
     */
    setupElements() {
      this.track = this.element.querySelector('.carousel-track');
      this.slides = Array.from(this.element.querySelectorAll('.carousel-slide'));
      this.prevButton = this.element.querySelector('.carousel-nav-prev');
      this.nextButton = this.element.querySelector('.carousel-nav-next');
      
      this.totalSlides = this.slides.length;
      
      if (this.totalSlides === 0) {
        console.warn('MultiImageCarousel: No se encontraron slides');
        return;
      }

      // Configurar slides
      this.slides.forEach((slide, index) => {
        slide.setAttribute('data-slide-index', index);
        slide.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');
        
        if (index === 0) {
          slide.classList.add('active');
        }
      });

      // Configurar accesibilidad
      if (this.config.accessibility) {
        this.setupAccessibility();
      }
    }

    /**
     * Configuración de accesibilidad
     */
    setupAccessibility() {
      this.element.setAttribute('role', 'region');
      this.element.setAttribute('aria-label', 'Carrusel de imágenes');
      
      if (this.prevButton) {
        this.prevButton.setAttribute('aria-label', 'Imagen anterior');
        this.prevButton.setAttribute('role', 'button');
      }
      
      if (this.nextButton) {
        this.nextButton.setAttribute('aria-label', 'Siguiente imagen');
        this.nextButton.setAttribute('role', 'button');
      }

      this.track.setAttribute('aria-live', 'polite');
    }

    /**
     * Configuración de event listeners
     */
    setupEventListeners() {
      // Navegación con botones
      if (this.prevButton) {
        this.prevButton.addEventListener('click', () => this.prevSlide());
      }
      
      if (this.nextButton) {
        this.nextButton.addEventListener('click', () => this.nextSlide());
      }

      // Navegación con teclado
      if (this.config.accessibility) {
        this.element.addEventListener('keydown', (e) => this.handleKeydown(e));
      }

      // Touch/Swipe support
      this.setupTouchEvents();

      // Pausa en hover
      if (this.config.pauseOnHover && this.config.autoplay) {
        this.element.addEventListener('mouseenter', () => this.pauseAutoplay());
        this.element.addEventListener('mouseleave', () => this.resumeAutoplay());
      }

      // Resize handler
      window.addEventListener('resize', () => this.handleResize());

      // Intersection Observer para optimización
      this.setupIntersectionObserver();
    }

    /**
     * Configuración de eventos táctiles
     */
    setupTouchEvents() {
      this.element.addEventListener('touchstart', (e) => {
        this.touchStartX = e.touches[0].clientX;
      }, { passive: true });

      this.element.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].clientX;
        this.handleSwipe();
      }, { passive: true });
    }

    /**
     * Manejo de swipe
     */
    handleSwipe() {
      const swipeDistance = this.touchStartX - this.touchEndX;
      
      if (Math.abs(swipeDistance) > this.config.swipeThreshold) {
        if (swipeDistance > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
    }

    /**
     * Configuración de Intersection Observer
     */
    setupIntersectionObserver() {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              if (this.config.autoplay && !this.autoplayTimer) {
                this.startAutoplay();
              }
            } else {
              this.pauseAutoplay();
            }
          });
        }, { threshold: 0.5 });

        observer.observe(this.element);
      }
    }

    /**
     * Manejo de teclas
     */
    handleKeydown(e) {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.prevSlide();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextSlide();
          break;
        case 'Home':
          e.preventDefault();
          this.goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          this.goToSlide(this.totalSlides - 1);
          break;
      }
    }

    /**
     * Ir al slide anterior
     */
    prevSlide() {
      if (this.isAnimating) return;
      
      let newSlide = this.currentSlide - 1;
      
      if (newSlide < 0) {
        newSlide = this.config.infinite ? this.totalSlides - 1 : 0;
      }
      
      this.goToSlide(newSlide);
    }

    /**
     * Ir al siguiente slide
     */
    nextSlide() {
      if (this.isAnimating) return;
      
      let newSlide = this.currentSlide + 1;
      
      if (newSlide >= this.totalSlides) {
        newSlide = this.config.infinite ? 0 : this.totalSlides - 1;
      }
      
      this.goToSlide(newSlide);
    }

    /**
     * Ir a un slide específico
     */
    goToSlide(slideIndex) {
      if (this.isAnimating || slideIndex === this.currentSlide) return;
      
      const previousSlide = this.currentSlide;
      this.currentSlide = slideIndex;
      this.isAnimating = true;

      // Evento antes del cambio
      this.element.dispatchEvent(new CustomEvent('carousel:beforeChange', {
        detail: { 
          from: previousSlide, 
          to: this.currentSlide,
          carousel: this 
        }
      }));

      this.updateSlidePositions();
      this.updateNavigation();
      this.updateAccessibility();

      // Finalizar animación
      setTimeout(() => {
        this.isAnimating = false;
        
        // Evento después del cambio
        this.element.dispatchEvent(new CustomEvent('carousel:afterChange', {
          detail: { 
            from: previousSlide, 
            to: this.currentSlide,
            carousel: this 
          }
        }));
      }, this.config.speed);
    }

    /**
     * Actualizar posiciones de slides
     */
    updateSlidePositions() {
      if (!this.track || this.slides.length === 0) return;

      // Obtener el ancho del contenedor
      const containerWidth = this.element.querySelector('.carousel-track-container')?.offsetWidth || 0;
      const slideWidth = containerWidth; // Cada slide ocupa todo el ancho del contenedor
      const offset = -this.currentSlide * slideWidth;
      
      // Usar transform para mejor rendimiento
      this.track.style.transform = `translateX(${offset}px)`;
      
      // Actualizar clases activas
      this.slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === this.currentSlide);
      });
    }

    /**
     * Actualizar navegación
     */
    updateNavigation() {
      if (!this.config.infinite) {
        if (this.prevButton) {
          this.prevButton.disabled = this.currentSlide === 0;
        }
        
        if (this.nextButton) {
          this.nextButton.disabled = this.currentSlide === this.totalSlides - 1;
        }
      }
    }

    /**
     * Actualizar accesibilidad
     */
    updateAccessibility() {
      this.slides.forEach((slide, index) => {
        slide.setAttribute('aria-hidden', index !== this.currentSlide ? 'true' : 'false');
      });
    }

    /**
     * Aplicar estilos personalizados desde los atributos de datos
     */
    applyCustomStyles() {
      // Buscar el contenedor padre que tiene los data attributes
      const sectionElement = this.element.closest('.multi-image-carousel-section');
      if (!sectionElement) return;

      // Obtener configuraciones de tamaño de texto
      const titleSize = sectionElement.getAttribute('data-title-size');
      const descriptionSize = sectionElement.getAttribute('data-description-size');
      const slideTitleSize = sectionElement.getAttribute('data-slide-title-size');
      const slideDescriptionSize = sectionElement.getAttribute('data-slide-description-size');
      
      // Obtener configuraciones de color de texto
      const titleColor = sectionElement.getAttribute('data-title-color');
      const descriptionColor = sectionElement.getAttribute('data-description-color');
      const slideTitleColor = sectionElement.getAttribute('data-slide-title-color');
      const slideDescriptionColor = sectionElement.getAttribute('data-slide-description-color');
      
      // Obtener configuraciones de botón
      const buttonSize = sectionElement.getAttribute('data-button-size');
      const buttonPadding = sectionElement.getAttribute('data-button-padding');
      const buttonBorderRadius = sectionElement.getAttribute('data-button-border-radius');
      const buttonBorderColor = sectionElement.getAttribute('data-button-border-color');
      const buttonBgColor = sectionElement.getAttribute('data-button-bg-color');
      const buttonTextColor = sectionElement.getAttribute('data-button-text-color');
      const buttonHoverBgColor = sectionElement.getAttribute('data-button-hover-bg-color');

      // Obtener configuraciones mobile
      const mobileTitleSize = sectionElement.getAttribute('data-mobile-title-size');
      const mobileDescriptionSize = sectionElement.getAttribute('data-mobile-description-size');
      const mobileSlideTitleSize = sectionElement.getAttribute('data-mobile-slide-title-size');
      const mobileSlideDescriptionSize = sectionElement.getAttribute('data-mobile-slide-description-size');
      
      // Obtener configuraciones mobile de color de texto
      const mobileTitleColor = sectionElement.getAttribute('data-mobile-title-color');
      const mobileDescriptionColor = sectionElement.getAttribute('data-mobile-description-color');
      const mobileSlideTitleColor = sectionElement.getAttribute('data-mobile-slide-title-color');
      const mobileSlideDescriptionColor = sectionElement.getAttribute('data-mobile-slide-description-color');
      
      const mobileButtonSize = sectionElement.getAttribute('data-mobile-button-size');
      const mobileButtonPadding = sectionElement.getAttribute('data-mobile-button-padding');
      const mobileButtonBorderRadius = sectionElement.getAttribute('data-mobile-button-border-radius');
      const mobileButtonBorderColor = sectionElement.getAttribute('data-mobile-button-border-color');
      const mobileButtonBgColor = sectionElement.getAttribute('data-mobile-button-bg-color');
      const mobileButtonTextColor = sectionElement.getAttribute('data-mobile-button-text-color');
      const mobileButtonHoverBgColor = sectionElement.getAttribute('data-mobile-button-hover-bg-color');

      // Aplicar variables CSS
      if (titleSize) {
        sectionElement.style.setProperty('--carousel-title-size', titleSize + 'px');
      }
      if (descriptionSize) {
        sectionElement.style.setProperty('--carousel-description-size', descriptionSize + 'px');
      }
      if (slideTitleSize) {
        sectionElement.style.setProperty('--carousel-slide-title-size', slideTitleSize + 'px');
      }
      if (slideDescriptionSize) {
        sectionElement.style.setProperty('--carousel-slide-description-size', slideDescriptionSize + 'px');
      }
      
      // Aplicar variables CSS para colores de texto
      if (titleColor) {
        sectionElement.style.setProperty('--carousel-title-color', titleColor);
      }
      if (descriptionColor) {
        sectionElement.style.setProperty('--carousel-description-color', descriptionColor);
      }
      if (slideTitleColor) {
        sectionElement.style.setProperty('--carousel-slide-title-color', slideTitleColor);
      }
      if (slideDescriptionColor) {
        sectionElement.style.setProperty('--carousel-slide-description-color', slideDescriptionColor);
      }
      
      if (buttonSize) {
        sectionElement.style.setProperty('--carousel-button-size', buttonSize + 'px');
      }
      if (buttonPadding) {
        sectionElement.style.setProperty('--carousel-button-padding', buttonPadding + 'px');
      }
      if (buttonBorderRadius) {
        sectionElement.style.setProperty('--carousel-button-border-radius', buttonBorderRadius + 'px');
      }
      if (buttonBorderColor) {
        sectionElement.style.setProperty('--carousel-button-border-color', buttonBorderColor);
      }
      if (buttonBgColor) {
        sectionElement.style.setProperty('--carousel-button-bg-color', buttonBgColor);
      }
      if (buttonTextColor) {
        sectionElement.style.setProperty('--carousel-button-text-color', buttonTextColor);
      }
      if (buttonHoverBgColor) {
        sectionElement.style.setProperty('--carousel-button-hover-bg-color', buttonHoverBgColor);
      }

      // Aplicar variables CSS para mobile
      if (mobileTitleSize) {
        sectionElement.style.setProperty('--carousel-mobile-title-size', mobileTitleSize + 'px');
      }
      if (mobileDescriptionSize) {
        sectionElement.style.setProperty('--carousel-mobile-description-size', mobileDescriptionSize + 'px');
      }
      if (mobileSlideTitleSize) {
        sectionElement.style.setProperty('--carousel-mobile-slide-title-size', mobileSlideTitleSize + 'px');
      }
      if (mobileSlideDescriptionSize) {
        sectionElement.style.setProperty('--carousel-mobile-slide-description-size', mobileSlideDescriptionSize + 'px');
      }
      
      // Aplicar variables CSS para colores de texto mobile
      if (mobileTitleColor) {
        sectionElement.style.setProperty('--carousel-mobile-title-color', mobileTitleColor);
      }
      if (mobileDescriptionColor) {
        sectionElement.style.setProperty('--carousel-mobile-description-color', mobileDescriptionColor);
      }
      if (mobileSlideTitleColor) {
        sectionElement.style.setProperty('--carousel-mobile-slide-title-color', mobileSlideTitleColor);
      }
      if (mobileSlideDescriptionColor) {
        sectionElement.style.setProperty('--carousel-mobile-slide-description-color', mobileSlideDescriptionColor);
      }
      
      if (mobileButtonSize) {
        sectionElement.style.setProperty('--carousel-mobile-button-size', mobileButtonSize + 'px');
      }
      if (mobileButtonPadding) {
        sectionElement.style.setProperty('--carousel-mobile-button-padding', mobileButtonPadding + 'px');
      }
      if (mobileButtonBorderRadius) {
        sectionElement.style.setProperty('--carousel-mobile-button-border-radius', mobileButtonBorderRadius + 'px');
      }
      if (mobileButtonBorderColor) {
        sectionElement.style.setProperty('--carousel-mobile-button-border-color', mobileButtonBorderColor);
      }
      if (mobileButtonBgColor) {
        sectionElement.style.setProperty('--carousel-mobile-button-bg-color', mobileButtonBgColor);
      }
      if (mobileButtonTextColor) {
        sectionElement.style.setProperty('--carousel-mobile-button-text-color', mobileButtonTextColor);
      }
      if (mobileButtonHoverBgColor) {
        sectionElement.style.setProperty('--carousel-mobile-button-hover-bg-color', mobileButtonHoverBgColor);
      }
    }

    /**
     * Iniciar autoplay
     */
    startAutoplay() {
      if (!this.config.autoplay || this.totalSlides <= 1) return;
      
      this.autoplayTimer = setInterval(() => {
        this.nextSlide();
      }, this.config.autoplaySpeed);
    }

    /**
     * Pausar autoplay
     */
    pauseAutoplay() {
      if (this.autoplayTimer) {
        clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    }

    /**
     * Reanudar autoplay
     */
    resumeAutoplay() {
      if (this.config.autoplay && !this.autoplayTimer) {
        this.startAutoplay();
      }
    }

    /**
     * Manejo de resize
     */
    handleResize() {
      // Debounce para optimizar rendimiento
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.updateSlidePositions();
      }, 100); // Reducir delay para mejor responsividad
    }

    /**
     * Destruir carrusel
     */
    destroy() {
      this.pauseAutoplay();
      
      // Remover event listeners
      window.removeEventListener('resize', this.handleResize);
      
      // Limpiar clases y atributos
      this.element.classList.remove('carousel-initialized');
      this.slides.forEach(slide => {
        slide.classList.remove('active');
        slide.removeAttribute('data-slide-index');
        slide.removeAttribute('aria-hidden');
      });

      // Evento de destrucción
      this.element.dispatchEvent(new CustomEvent('carousel:destroyed', {
        detail: { carousel: this }
      }));
    }
  }

  /**
   * Función de inicialización de carruseles
   */
  function initCarousels() {
    const carousels = document.querySelectorAll('.multi-image-carousel-wrapper:not(.carousel-initialized)');
    
    carousels.forEach(carousel => {
      const config = {
        autoplay: carousel.dataset.autoplay === 'true',
        autoplaySpeed: parseInt(carousel.dataset.autoplaySpeed) || 3000,
        infinite: carousel.dataset.infinite !== 'false'
      };
      
      const carouselInstance = new MultiImageCarousel(carousel, config);
      
      // Marcar como inicializado para evitar doble inicialización
      carousel.classList.add('carousel-initialized');
    });
  }

  /**
   * Inicialización cuando el DOM esté listo
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousels);
  } else {
    initCarousels();
  }

  /**
   * Re-inicializar en cambios dinámicos del DOM
   */
  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              const newCarousels = node.querySelectorAll ? 
                node.querySelectorAll('.multi-image-carousel-wrapper:not(.carousel-initialized)') : [];
              
              if (newCarousels.length > 0) {
                setTimeout(initCarousels, 100);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Exponer la clase globalmente para uso externo
window.MultiImageCarousel = MultiImageCarousel;

})();