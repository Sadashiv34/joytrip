// Security utility functions
window.SecurityUtils = {
    // Sanitize input to prevent XSS
    sanitizeInput: function(input) {
        if (typeof input !== 'string') return input;
        
        // Remove any potentially dangerous characters
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    // Validate email format
    isValidEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    },

    // Validate password strength
    isStrongPassword: function(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/;
        return re.test(password);
    },

    // Sanitize and validate user input
    processUserInput: function(input, type = 'text') {
        const sanitized = this.sanitizeInput(input).trim();
        
        switch(type) {
            case 'email':
                if (!this.isValidEmail(sanitized)) {
                    throw new Error('Please enter a valid email address');
                }
                return sanitized.toLowerCase();
                
            case 'password':
                if (!this.isStrongPassword(sanitized)) {
                    throw new Error('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
                }
                return sanitized;
                
            case 'name':
                if (sanitized.length < 2) {
                    throw new Error('Name must be at least 2 characters long');
                }
                return sanitized;
                
            case 'feedback-message':
                // More strict validation for feedback message
                if (sanitized.length < 10) {
                    throw new Error('Feedback message must be at least 10 characters long');
                }
                if (sanitized.length > 1000) {
                    throw new Error('Feedback message is too long (max 1000 characters)');
                }
                // Check for suspicious patterns
                const suspiciousPatterns = [
                    /<script[^>]*>.*<\/script>/gi,
                    /javascript:/gi,
                    /on\w+\s*=/gi,
                    /eval\(/gi,
                    /document\./gi,
                    /window\./gi,
                    /documentElement/gi,
                    /innerHTML/gi,
                    /localStorage/gi,
                    /sessionStorage/gi,
                    /XMLHttpRequest/gi,
                    /fetch\(/gi,
                    /<iframe/gi,
                    /<img/gi,
                    /<link/gi,
                    /<meta/gi,
                    /<object/gi,
                    /<style/gi
                ];

                for (let i = 0; i < suspiciousPatterns.length; i++) {
                    if (suspiciousPatterns[i].test(sanitized)) {
                        throw new Error('Invalid input detected');
                    }
                }
                return sanitized;
                
            case 'feedback-email':
                // Basic email validation
                if (sanitized && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
                    throw new Error('Please enter a valid email address');
                }
                return sanitized;
                
            default:
                return sanitized;
        }
    }
};
