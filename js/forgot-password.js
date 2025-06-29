import { authManager } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('forgotPasswordForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = form.querySelector('button[type="submit"]');
    let originalButtonText = submitButton.innerHTML;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset messages
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        
        const email = form.email.value.trim();
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending...';
        
        try {
            const result = await authManager.handlePasswordReset(email);
            
            if (result.success) {
                // Show success message
                successMessage.style.display = 'block';
                form.reset();
            } else {
                // Show error message
                errorMessage.textContent = result.error || 'An error occurred. Please try again.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            errorMessage.textContent = 'An unexpected error occurred. Please try again.';
            errorMessage.style.display = 'block';
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            
            // Hide success message after 5 seconds
            if (successMessage.style.display === 'block') {
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            }
        }
    });
});
