class TimelineSteps {
  constructor(section = null) {
    this.currentStep = 0; // Cambiar a 0 para coincidir con data-step
    this.totalSteps = 0;
    this.stepItems = [];
    this.stepImages = [];
    this.isMobile = false;
    this.autoAdvanceInterval = null;
    this.progressLineInterval = null;
    this.stepDuration = 5000; // Duración por defecto
    this.section = section;
    this.init();
  }

  init() {
    // Detectar elementos del DOM - usar selectores que funcionen tanto en Shopify como fuera
    this.stepItems = document.querySelectorAll('.timeline-steps-section .step-item, .shopify-section .timeline-steps-section .step-item');
    this.stepImages = document.querySelectorAll('.timeline-steps-section .step-image, .shopify-section .timeline-steps-section .step-image');
    this.totalSteps = this.stepItems.length;

    if (this.totalSteps === 0) {
      console.warn('Timeline: No step items found');
      console.log('Timeline: Trying alternative selectors...');
      // Intentar con selectores alternativos
      this.stepItems = document.querySelectorAll('.step-item');
      this.stepImages = document.querySelectorAll('.step-image');
      this.totalSteps = this.stepItems.length;
      
      if (this.totalSteps === 0) {
        console.warn('Timeline: Still no step items found with alternative selectors');
        return;
      } else {
        console.log('Timeline: Found', this.totalSteps, 'steps with alternative selectors');
      }
    } else {
      console.log('Timeline: Found', this.totalSteps, 'steps with primary selectors');
    }

    // Obtener duración del paso desde el atributo data
    const section = this.section || document.querySelector('.timeline-steps-section') || document.querySelector('.shopify-section .timeline-steps-section');
    if (section && section.dataset.stepDuration) {
      this.stepDuration = parseInt(section.dataset.stepDuration);
      console.log('Timeline: Step duration set to', this.stepDuration, 'ms');
    }

    // Detectar si es móvil
    this.checkMobile();
    
    // Configurar eventos de redimensionamiento
    window.addEventListener('resize', () => {
      this.checkMobile();
      this.updateDisplay();
    });

    // Configurar eventos de clic en los pasos
    this.stepItems.forEach((step, index) => {
      step.addEventListener('click', () => {
        this.goToStep(index);
      });
    });

    // Configurar botones de navegación móvil
    this.setupMobileNavigation();

    // Inicializar el primer paso (índice 0)
    this.goToStep(0);
    
    // Inicializar indicador móvil
    this.updateMobileStepIndicator();

    // Auto-avance automático activado
    console.log('Timeline: Starting auto-advance with duration', this.stepDuration, 'ms');
    this.startAutoAdvance();
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  setupMobileNavigation() {
    const prevBtn = document.querySelector('.mobile-prev-btn') || document.querySelector('.shopify-section .mobile-prev-btn');
    const nextBtn = document.querySelector('.mobile-next-btn') || document.querySelector('.shopify-section .mobile-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.previousStep();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextStep();
      });
    }
  }

  goToStep(stepNumber) {
    // Validar que el número de paso esté en el rango correcto (0 a totalSteps-1)
    if (stepNumber < 0 || stepNumber >= this.totalSteps) {
      console.warn('Timeline: Invalid step number', stepNumber);
      return;
    }

    this.currentStep = stepNumber;
    
    // Usar requestAnimationFrame para que TODO ocurra en el mismo frame
    requestAnimationFrame(() => {
      // Ejecutar TODOS los cambios visuales simultáneamente
      this.updateDisplay();
      this.updateProgress();
      this.updateMobileStepIndicator();
      this.startProgressLine();
    });
  }

  updateDisplay() {
    // Actualizar pasos
    this.stepItems.forEach((step, index) => {
      const isActive = index === this.currentStep;
      
      if (isActive) {
        step.classList.add('active');
        if (this.isMobile) {
          step.style.display = 'flex';
        }
      } else {
        step.classList.remove('active');
        if (this.isMobile) {
          step.style.display = 'none';
        } else {
          // En desktop, asegurar que todos los pasos sean visibles
          step.style.display = '';
        }
      }
    });

    // Actualizar imágenes
    this.stepImages.forEach((image, index) => {
      const isActive = index === this.currentStep;
      
      if (isActive) {
        image.classList.add('active');
      } else {
        image.classList.remove('active');
      }
    });
  }

  updateProgress() {
    // Solo actualizar la línea de progreso vertical individual
    // Las barras de progreso principales han sido eliminadas
  }

  updateMobileStepIndicator() {
    const currentStepElement = document.querySelector('.current-step');
    const totalStepsElement = document.querySelector('.total-steps');
    const prevBtn = document.querySelector('.mobile-prev-btn');
    const nextBtn = document.querySelector('.mobile-next-btn');

    // Actualizar contador de pasos
    if (currentStepElement) {
      currentStepElement.textContent = this.currentStep + 1;
    }
    if (totalStepsElement) {
      totalStepsElement.textContent = this.totalSteps;
    }

    // Actualizar estado de botones
    if (prevBtn) {
      prevBtn.disabled = this.currentStep === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = this.currentStep === this.totalSteps - 1;
    }
  }

  nextStep() {
    const nextStepNumber = (this.currentStep + 1) % this.totalSteps;
    this.goToStep(nextStepNumber);
  }

  previousStep() {
    const prevStepNumber = this.currentStep === 0 ? this.totalSteps - 1 : this.currentStep - 1;
    this.goToStep(prevStepNumber);
  }

  // Función para iniciar la animación de la línea de progreso
  startProgressLine() {
    // Limpiar cualquier animación anterior
    this.clearProgressLine();

    // Encontrar el paso activo
    const activeStep = this.stepItems[this.currentStep];
    if (!activeStep) {
      console.warn('Timeline: No active step found for index', this.currentStep);
      return;
    }

    // Encontrar la línea de progreso dentro del paso activo
    const progressLine = activeStep.querySelector('.step-progress-line');
    if (!progressLine) {
      console.warn('Timeline: No progress line found in active step');
      return;
    }

    console.log('Timeline: Starting progress line animation for step', this.currentStep, 'with duration', this.stepDuration, 'ms');

    // Limpiar clases y animaciones anteriores inmediatamente
    progressLine.classList.remove('pulse');
    progressLine.style.animation = 'none';
    progressLine.offsetHeight; // Forzar reflow
    
    // Aplicar la animación con la duración correcta inmediatamente
    progressLine.style.animation = `progressLine ${this.stepDuration}ms linear`;

    // Agregar efecto de pulso con duración dinámica
    progressLine.style.setProperty('--pulse-duration', `${Math.min(this.stepDuration / 4, 2000)}ms`);
    progressLine.classList.add('pulse');

    console.log('Timeline: Progress line animation started with duration', this.stepDuration, 'ms');
  }

  // Función para limpiar la animación de la línea de progreso
  clearProgressLine() {
    if (this.progressLineInterval) {
      clearInterval(this.progressLineInterval);
      this.progressLineInterval = null;
    }
    
    // Reiniciar todas las líneas de progreso
    this.stepItems.forEach(step => {
      const progressLine = step.querySelector('.step-progress-line');
      if (progressLine) {
        // Limpiar animaciones y clases
        progressLine.style.animation = 'none';
        progressLine.classList.remove('pulse');
        progressLine.style.removeProperty('--pulse-duration');
        
        const progressElement = progressLine.querySelector('.js-progress-fill');
        if (progressElement) {
          progressElement.style.height = '0%';
          progressElement.style.animation = 'none';
        }
      }
    });
  }

  // Función opcional para auto-avance
  startAutoAdvance(interval = null) {
    // Usar la duración configurada si no se especifica un intervalo
    const duration = interval || this.stepDuration;
    
    // Limpiar cualquier intervalo anterior
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
    }
    
    this.autoAdvanceInterval = setInterval(() => {
      // Avanzar al siguiente paso (nextStep ya maneja el ciclo automáticamente)
      this.nextStep();
    }, duration);
  }

  // Función para pausar/reanudar auto-avance
  pauseAutoAdvance() {
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
      this.autoAdvanceInterval = null;
    }
    this.clearProgressLine(); // También pausar la línea de progreso
  }

  // Función para obtener el paso actual
  getCurrentStep() {
    return this.currentStep;
  }

  // Función para obtener el total de pasos
  getTotalSteps() {
    return this.totalSteps;
  }

  // Función para verificar si es el último paso
  isLastStep() {
    return this.currentStep === this.totalSteps - 1;
  }

  // Función para verificar si es el primer paso
  isFirstStep() {
    return this.currentStep === 0;
  }

  // Función para reiniciar al primer paso
  reset() {
    this.goToStep(0);
  }

  // Función para destruir la instancia
  destroy() {
    // Limpiar eventos
    this.stepItems.forEach((step, index) => {
      step.removeEventListener('click', () => {
        this.goToStep(index + 1);
      });
    });

    const prevBtn = document.querySelector('.mobile-prev-btn');
    const nextBtn = document.querySelector('.mobile-next-btn');

    if (prevBtn) {
      prevBtn.removeEventListener('click', () => {
        this.previousStep();
      });
    }

    if (nextBtn) {
      nextBtn.removeEventListener('click', () => {
        this.nextStep();
      });
    }

    window.removeEventListener('resize', () => {
      this.checkMobile();
      this.updateDisplay();
    });

    // Pausar auto-avance si está activo
    this.pauseAutoAdvance();
    // Limpiar línea de progreso
    this.clearProgressLine();
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si existe la sección del timeline - usar selectores que funcionen en Shopify
  const timelineSection = document.querySelector('.timeline-steps-section') || document.querySelector('.shopify-section .timeline-steps-section');
  if (timelineSection) {
    console.log('Timeline: Section found, initializing...');
    // Crear instancia global para acceso desde otros scripts si es necesario
    window.timelineSteps = new TimelineSteps(timelineSection);
  } else {
    console.warn('Timeline: No timeline section found');
  }
});

// Inicialización alternativa para Shopify - usar un timeout para asegurar que el DOM esté completamente cargado
setTimeout(() => {
  if (!window.timelineSteps) {
    const timelineSection = document.querySelector('.timeline-steps-section') || document.querySelector('.shopify-section .timeline-steps-section');
    if (timelineSection) {
      console.log('Timeline: Section found on delayed initialization, initializing...');
      window.timelineSteps = new TimelineSteps(timelineSection);
    } else {
      console.warn('Timeline: Still no timeline section found after timeout');
    }
  }
}, 500); // Aumentar timeout para Shopify

// Prevenir conflictos con otros scripts de Shopify
(function() {
  'use strict';
  
  // Guardar referencias originales si existen
  const originalTimelineSteps = window.timelineSteps;
  
  // Reinicializar en caso de cambios dinámicos del DOM (para Shopify)
  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', (event) => {
      // Solo reinicializar si es nuestra sección
      if (event.target && event.target.querySelector('.timeline-steps-section')) {
        const timelineSection = event.target.querySelector('.timeline-steps-section');
        if (timelineSection) {
          // Destruir instancia anterior si existe
          if (window.timelineSteps && typeof window.timelineSteps.destroy === 'function') {
            window.timelineSteps.destroy();
          }
          // Crear nueva instancia
          window.timelineSteps = new TimelineSteps(timelineSection);
        }
      }
    });

    document.addEventListener('shopify:section:unload', (event) => {
      // Solo limpiar si es nuestra sección
      if (event.target && event.target.querySelector('.timeline-steps-section')) {
        if (window.timelineSteps && typeof window.timelineSteps.destroy === 'function') {
          window.timelineSteps.destroy();
          window.timelineSteps = null;
        }
      }
    });
  }
})();