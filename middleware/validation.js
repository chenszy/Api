// Валидация регистрации
const validateRegistration = (req, res, next) => {
    const { username, email, password } = req.body;
    const errors = [];

    // Username validation
    if (!username || username.length < 3 || username.length > 20) {
        errors.push('Username must be between 3 and 20 characters');
    }
    
    if (username && !/^[a-zA-Z0-9]+$/.test(username)) {
        errors.push('Username can only contain letters and numbers');
    }

    // Email validation
    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        errors.push('Please provide a valid email address');
    }

    // Password validation
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    if (password && (!/[a-zA-Z]/.test(password) || !/\d/.test(password))) {
        errors.push('Password must contain at least one letter and one number');
    }

    if (errors.length > 0) {
        const error = new Error('Validation failed');
        error.status = 400;
        error.errors = errors;
        return next(error);
    }

    next();
};

// Валидация входа
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email) {
        errors.push('Email is required');
    }

    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        const error = new Error('Validation failed');
        error.status = 400;
        error.errors = errors;
        return next(error);
    }

    next();
};

module.exports = { validateRegistration, validateLogin };