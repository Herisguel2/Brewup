// Shared animation utilities

export function handleScrollAnimations(selector = '.reveal-on-scroll', offset = 150) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < window.innerHeight - offset) {
            element.classList.add('reveal-on-scroll');
        }
    });
}

export function initializeScrollAnimations(selector = '.reveal-on-scroll', offset = 150) {
    // Initial check
    handleScrollAnimations(selector, offset);
    
    // Add scroll event listener
    window.addEventListener('scroll', () => handleScrollAnimations(selector, offset));
} 