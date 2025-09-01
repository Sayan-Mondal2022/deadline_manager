// projects.js
document.addEventListener('DOMContentLoaded', function() {
    // Add confirmation to mark complete buttons
    const completeForms = document.querySelectorAll('.complete-form');
    
    completeForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const projectTitle = this.closest('.project-card').querySelector('.project-title').textContent;
            const confirmed = confirm(`Are you sure you want to mark "${projectTitle}" as complete?`);
            
            if (confirmed) {
                this.submit();
            }
        });
    });
    
    // Add animation to project cards
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
        // Stagger animation for a nice effect
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
    
    // Add hover effect to cards
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
});