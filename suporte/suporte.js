// Funcionalidade do Acordeão FAQ
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.parentElement;
    const isActive = item.classList.contains('active');
    
    // Fecha todos os itens do FAQ
    document.querySelectorAll('.faq-item').forEach(faqItem => {
      faqItem.classList.remove('active');
    });
    
    // Se o item clicado não estava ativo, abre-o
    if (!isActive) {
      item.classList.add('active');
    }
  });
}); 