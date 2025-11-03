/**
 * Pictory Products Grid Section JavaScript
 * Handles dynamic styling and interactive functionality
 */

// Make class globally available for theme editor
window.PictoryProductsGrid = class PictoryProductsGrid {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    this.applyCustomStyles();
    this.setupInteractivity();
    this.setupAccessibility();
    this.setupIntersectionObserver();
  }

  /**
   * Apply custom styles from data attributes
   */
  applyCustomStyles() {
    // General configuration
    const titleSize = this.element.dataset.titleSize;
    const titleColor = this.element.dataset.titleColor;
    const backgroundColor = this.element.dataset.backgroundColor;
    const paddingTop = this.element.dataset.paddingTop;
    const paddingBottom = this.element.dataset.paddingBottom;

    // Product configuration
    const productTitleSize = this.element.dataset.productTitleSize;
    const productTitleColor = this.element.dataset.productTitleColor;
    const descriptionSize = this.element.dataset.descriptionSize;
    const descriptionColor = this.element.dataset.descriptionColor;

    // Button configuration
    const buttonSize = this.element.dataset.buttonSize;
    const buttonPadding = this.element.dataset.buttonPadding;
    const buttonBorderRadius = this.element.dataset.buttonBorderRadius;
    const buttonBgColor = this.element.dataset.buttonBgColor;
    const buttonTextColor = this.element.dataset.buttonTextColor;
    const buttonHoverBgColor = this.element.dataset.buttonHoverBgColor;

    // Mobile configuration
    const mobileTitleSize = this.element.dataset.mobileTitleSize;
    const mobileTitleColor = this.element.dataset.mobileTitleColor;
    const mobileProductTitleSize = this.element.dataset.mobileProductTitleSize;
    const mobileProductTitleColor = this.element.dataset.mobileProductTitleColor;
    const mobileDescriptionSize = this.element.dataset.mobileDescriptionSize;
    const mobileDescriptionColor = this.element.dataset.mobileDescriptionColor;
    const mobileButtonSize = this.element.dataset.mobileButtonSize;
    const mobileButtonPadding = this.element.dataset.mobileButtonPadding;
    const mobileButtonBorderRadius = this.element.dataset.mobileButtonBorderRadius;
    const mobileButtonBgColor = this.element.dataset.mobileButtonBgColor;
    const mobileButtonTextColor = this.element.dataset.mobileButtonTextColor;
    const mobileButtonHoverBgColor = this.element.dataset.mobileButtonHoverBgColor;

    // Apply CSS variables with proper units
    if (titleSize) this.element.style.setProperty('--pictory-title-size', titleSize + 'px');
    if (titleColor) this.element.style.setProperty('--pictory-title-color', titleColor);
    if (backgroundColor) this.element.style.backgroundColor = backgroundColor;
    if (paddingTop) this.element.style.paddingTop = paddingTop + 'px';
    if (paddingBottom) this.element.style.paddingBottom = paddingBottom + 'px';

    if (productTitleSize) this.element.style.setProperty('--pictory-product-title-size', productTitleSize + 'px');
    if (productTitleColor) this.element.style.setProperty('--pictory-product-title-color', productTitleColor);
    if (descriptionSize) this.element.style.setProperty('--pictory-description-size', descriptionSize + 'px');
    if (descriptionColor) this.element.style.setProperty('--pictory-description-color', descriptionColor);

    if (buttonSize) this.element.style.setProperty('--pictory-button-size', buttonSize + 'px');
    if (buttonPadding) this.element.style.setProperty('--pictory-button-padding', buttonPadding + 'px');
    if (buttonBorderRadius) this.element.style.setProperty('--pictory-button-border-radius', buttonBorderRadius + 'px');
    if (buttonBgColor) this.element.style.setProperty('--pictory-button-bg-color', buttonBgColor);
    if (buttonTextColor) this.element.style.setProperty('--pictory-button-text-color', buttonTextColor);
    if (buttonHoverBgColor) this.element.style.setProperty('--pictory-button-hover-bg-color', buttonHoverBgColor);

    // Mobile CSS variables with proper units
    if (mobileTitleSize) this.element.style.setProperty('--pictory-mobile-title-size', mobileTitleSize + 'px');
    if (mobileTitleColor) this.element.style.setProperty('--pictory-mobile-title-color', mobileTitleColor);
    if (mobileProductTitleSize) this.element.style.setProperty('--pictory-mobile-product-title-size', mobileProductTitleSize + 'px');
    if (mobileProductTitleColor) this.element.style.setProperty('--pictory-mobile-product-title-color', mobileProductTitleColor);
    if (mobileDescriptionSize) this.element.style.setProperty('--pictory-mobile-description-size', mobileDescriptionSize + 'px');
    if (mobileDescriptionColor) this.element.style.setProperty('--pictory-mobile-description-color', mobileDescriptionColor);
    if (mobileButtonSize) this.element.style.setProperty('--pictory-mobile-button-size', mobileButtonSize + 'px');
    if (mobileButtonPadding) this.element.style.setProperty('--pictory-mobile-button-padding', mobileButtonPadding + 'px');
    if (mobileButtonBorderRadius) this.element.style.setProperty('--pictory-mobile-button-border-radius', mobileButtonBorderRadius + 'px');
    if (mobileButtonBgColor) this.element.style.setProperty('--pictory-mobile-button-bg-color', mobileButtonBgColor);
    if (mobileButtonTextColor) this.element.style.setProperty('--pictory-mobile-button-text-color', mobileButtonTextColor);
    if (mobileButtonHoverBgColor) this.element.style.setProperty('--pictory-mobile-button-hover-bg-color', mobileButtonHoverBgColor);
  }

  /**
   * Setup interactive functionality
   */
  setupInteractivity() {
    const buttons = this.element.querySelectorAll('.product-button');
    
    buttons.forEach(button => {
      // Enhanced hover effects
      button.addEventListener('mouseenter', this.handleButtonHover.bind(this));
      button.addEventListener('mouseleave', this.handleButtonLeave.bind(this));
      
      // Click tracking for analytics
      button.addEventListener('click', this.handleButtonClick.bind(this));
    });

    // Setup product item interactions
    const productItems = this.element.querySelectorAll('.product-item');
    productItems.forEach(item => {
      item.addEventListener('mouseenter', this.handleProductHover.bind(this));
      item.addEventListener('mouseleave', this.handleProductLeave.bind(this));
    });
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    const buttons = this.element.querySelectorAll('.product-button');
    const productItems = this.element.querySelectorAll('.product-item');

    // Add ARIA labels and roles
    buttons.forEach((button, index) => {
      if (!button.getAttribute('aria-label')) {
        const productTitle = button.closest('.product-item').querySelector('.product-title')?.textContent;
        button.setAttribute('aria-label', `Ver más sobre ${productTitle || `producto ${index + 1}`}`);
      }
    });

    // Add keyboard navigation
    productItems.forEach(item => {
      item.setAttribute('tabindex', '0');
      item.addEventListener('keydown', this.handleKeyNavigation.bind(this));
    });

    // Add focus management
    this.setupFocusManagement();
  }

  /**
   * Setup intersection observer for animations
   */
  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      const productItems = this.element.querySelectorAll('.product-item');
      productItems.forEach(item => {
        observer.observe(item);
      });
    }
  }

  /**
   * Handle button hover effects
   */
  handleButtonHover(event) {
    const button = event.currentTarget;
    button.style.transform = 'translateY(-2px) scale(1.02)';
    
    // Add ripple effect
    this.createRippleEffect(button, event);
  }

  /**
   * Handle button leave effects
   */
  handleButtonLeave(event) {
    const button = event.currentTarget;
    button.style.transform = 'translateY(-2px)';
  }

  /**
   * Handle product item hover
   */
  handleProductHover(event) {
    const item = event.currentTarget;
    const image = item.querySelector('.product-image img');
    
    if (image && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      image.style.transform = 'scale(1.05)';
    }
  }

  /**
   * Handle product item leave
   */
  handleProductLeave(event) {
    const item = event.currentTarget;
    const image = item.querySelector('.product-image img');
    
    if (image) {
      image.style.transform = 'scale(1)';
    }
  }

  /**
   * Handle button clicks for analytics
   */
  handleButtonClick(event) {
    const button = event.currentTarget;
    const productItem = button.closest('.product-item');
    const productTitle = productItem.querySelector('.product-title')?.textContent;
    
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click', {
        event_category: 'Pictory Products Grid',
        event_label: productTitle || 'Unknown Product',
        value: 1
      });
    }

    // Custom event for other tracking systems
    this.element.dispatchEvent(new CustomEvent('pictory:product:click', {
      detail: {
        productTitle: productTitle,
        buttonElement: button,
        productElement: productItem
      }
    }));
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyNavigation(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const button = event.currentTarget.querySelector('.product-button');
      if (button) {
        button.click();
      }
    }
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    const focusableElements = this.element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(element => {
      element.addEventListener('focus', this.handleFocus.bind(this));
      element.addEventListener('blur', this.handleBlur.bind(this));
    });
  }

  /**
   * Handle focus events
   */
  handleFocus(event) {
    event.currentTarget.classList.add('focused');
  }

  /**
   * Handle blur events
   */
  handleBlur(event) {
    event.currentTarget.classList.remove('focused');
  }

  /**
   * Create ripple effect on button click
   */
  createRippleEffect(button, event) {
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  /**
   * Responsive behavior adjustments
   */
  handleResize() {
    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth <= 768 && window.innerWidth > 480;

    // Adjust animations based on device
    if (isMobile && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.element.classList.add('reduced-motion');
    }

    // Dispatch resize event for other components
    this.element.dispatchEvent(new CustomEvent('pictory:resize', {
      detail: { isMobile, isTablet }
    }));
  }

  /**
   * Destroy instance and cleanup
   */
  destroy() {
    // Remove event listeners
    const buttons = this.element.querySelectorAll('.product-button');
    const productItems = this.element.querySelectorAll('.product-item');

    buttons.forEach(button => {
      button.removeEventListener('mouseenter', this.handleButtonHover);
      button.removeEventListener('mouseleave', this.handleButtonLeave);
      button.removeEventListener('click', this.handleButtonClick);
    });

    productItems.forEach(item => {
      item.removeEventListener('mouseenter', this.handleProductHover);
      item.removeEventListener('mouseleave', this.handleProductLeave);
      item.removeEventListener('keydown', this.handleKeyNavigation);
    });

    window.removeEventListener('resize', this.handleResize);
  }
}

// CSS for ripple animation
const rippleCSS = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

// Add ripple CSS to document
if (!document.querySelector('#pictory-ripple-styles')) {
  const style = document.createElement('style');
  style.id = 'pictory-ripple-styles';
  style.textContent = rippleCSS;
  document.head.appendChild(style);
}

// Initialize all Pictory Products Grid sections
document.addEventListener('DOMContentLoaded', function() {
  initializePictoryGrids();
});

// Also initialize when Shopify theme editor loads sections
document.addEventListener('shopify:section:load', function(event) {
  if (event.target.classList.contains('pictory-products-grid-section')) {
    const instance = new PictoryProductsGrid(event.target);
    if (!window.pictoryProductsGridInstances) {
      window.pictoryProductsGridInstances = [];
    }
    window.pictoryProductsGridInstances.push(instance);
  }
});

// Cleanup when sections are unloaded in theme editor
document.addEventListener('shopify:section:unload', function(event) {
  if (event.target.classList.contains('pictory-products-grid-section') && window.pictoryProductsGridInstances) {
    const instances = window.pictoryProductsGridInstances;
    for (let i = instances.length - 1; i >= 0; i--) {
      if (instances[i].element === event.target) {
        instances[i].destroy();
        instances.splice(i, 1);
        break;
      }
    }
  }
});

// Reinitialize when sections are reloaded in theme editor
document.addEventListener('shopify:section:reorder', function() {
  // Clear existing instances
  if (window.pictoryProductsGridInstances) {
    window.pictoryProductsGridInstances.forEach(instance => instance.destroy());
  }
  // Reinitialize all sections
  setTimeout(initializePictoryGrids, 100);
});

function initializePictoryGrids() {
  const sections = document.querySelectorAll('.pictory-products-grid-section');
  const instances = [];

  sections.forEach(section => {
    const instance = new PictoryProductsGrid(section);
    instances.push(instance);
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      instances.forEach(instance => {
        if (instance.handleResize) {
          instance.handleResize();
        }
      });
    }, 250);
  });

  // Store instances globally for potential external access
  window.pictoryProductsGridInstances = instances;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.PictoryProductsGrid;
}