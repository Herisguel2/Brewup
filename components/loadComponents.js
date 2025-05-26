// Function to load components
async function loadComponents() {
    try {
        // Determine the base path for components
        const isRoot = window.location.pathname.split('/').length <= 2;
        const basePath = isRoot ? 'components/' : '../components/';

        // Load navbar
        const navbarHtml = await loadFile(basePath + 'navbar.html');
        document.getElementById('navbar-container').innerHTML = navbarHtml;

        // Load footer
        const footerHtml = await loadFile(basePath + 'footer.html');
        document.getElementById('footer-container').innerHTML = footerHtml;

        // Update active nav link after loading navbar
        updateActiveNavLink();
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Function to load file content
async function loadFile(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error loading file:', error);
        return '';
    }
}

// Function to update active nav link
function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (currentPage === linkPage || 
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === 'index.html' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Export functions
export { loadComponents, loadFile, updateActiveNavLink };

// Load components when the page loads
document.addEventListener('DOMContentLoaded', loadComponents); 