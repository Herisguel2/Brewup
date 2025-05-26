import { initializeScrollAnimations } from '../utils/animations.js';

// Function to handle scroll animations
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('reveal-on-scroll');
        }
    });
}

// Function to handle number counting animation
function animateNumbers() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.textContent);
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateNumber = () => {
            current += step;
            if (current < target) {
                stat.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateNumber);
            } else {
                stat.textContent = target.toLocaleString();
            }
        };
        
        updateNumber();
    });
}

// Function to handle value card hover effects
function handleValueCardHover() {
    const cards = document.querySelectorAll('.value-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.value-icon');
            icon.style.transform = 'rotateY(360deg)';
        });
        
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.value-icon');
            icon.style.transform = 'rotateY(0deg)';
        });
    });
}

// Function to handle team member hover effects
function handleTeamMemberHover() {
    const members = document.querySelectorAll('.team-member');
    
    members.forEach(member => {
        member.addEventListener('mouseenter', () => {
            const social = member.querySelector('.member-social');
            social.style.opacity = '1';
            social.style.transform = 'translateY(0)';
        });
        
        member.addEventListener('mouseleave', () => {
            const social = member.querySelector('.member-social');
            social.style.opacity = '0';
            social.style.transform = 'translateY(20px)';
        });
    });
}

// Initialize all functionality when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize scroll animations
    initializeScrollAnimations();
    
    // Initialize hover effects
    handleValueCardHover();
    handleTeamMemberHover();
    
    // Start number animations when mission section is in view
    const missionSection = document.querySelector('.about-mission');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    if (missionSection) {
        observer.observe(missionSection);
    }
}); 