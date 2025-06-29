// Create a global authManager object if it doesn't exist
window.authManager = window.authManager || {};

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDwGx2qJ90LFhu06lgWr_r6vv5Jx6JqxzE",
    authDomain: "pagepilot-y6ez7.firebaseapp.com",
    projectId: "pagepilot-y6ez7",
    storageBucket: "pagepilot-y6ez7.firebasestorage.app",
    messagingSenderId: "654134506434",
    appId: "1:654134506434:web:303611b2baa4b90e271c5b"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database();

// Update UI based on auth state
function updateAuthUI(user) {
    try {
        const loginLinks = document.querySelectorAll('.login-link');
        const userMenu = document.getElementById('userMenu');
        
        if (!loginLinks.length || !userMenu) return;
        
        if (user) {
            // User is signed in
            loginLinks.forEach(link => {
                link.style.display = 'none';
            });
            userMenu.style.display = 'block';
            
            // Update user info if elements exist
            const userEmail = document.getElementById('user-email');
            if (userEmail) userEmail.textContent = user.email;
        } else {
            // User is signed out
            loginLinks.forEach(link => {
                link.style.display = 'block';
            });
            userMenu.style.display = 'none';
        }
    } catch (error) {
        console.error('Error updating auth UI:', error);
    }
}

// Auth state observer
if (typeof window !== 'undefined') {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            console.log('User is signed in:', user.email);
            updateAuthUI(user);
        } else {
            // User is signed out
            console.log('User is signed out');
            updateAuthUI(null);
        }
    });
}

// Sign up function
window.authManager.signUp = async function(email, password, displayName) {
    try {
        // Create user with email and password
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update user profile with display name if provided
        if (displayName) {
            await user.updateProfile({
                displayName: displayName
            });
        }

        // Send email verification
        await user.sendEmailVerification();

        return { success: true, user };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
};

// Sign in function
window.authManager.signIn = async function(email, password) {
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
};

// Sign out user
window.authManager.signOut = async function() {
    try {
        await firebase.auth().signOut();
        
        // Clear any stored tokens or session data
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            
            // Clear any service worker caches if used
            if ('caches' in window) {
                caches.keys().then(cacheNames => {
                    return Promise.all(
                        cacheNames.map(cache => caches.delete(cache))
                    );
                });
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
};

// Password reset function
window.authManager.resetPassword = async function(email) {
    try {
        await firebase.auth().sendPasswordResetEmail(email);
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
    }
};

// Get current user with additional checks
window.authManager.getCurrentUser = function() {
    const user = firebase.auth().currentUser;
    if (!user) return null;
    
    // Return a sanitized user object
    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
    };
};

// Check if user is authenticated
window.authManager.isAuthenticated = function() {
    return !!firebase.auth().currentUser;
};

// Sign in with Google
window.authManager.signInWithGoogle = async function() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        // Add any additional scopes you need
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await firebase.auth().signInWithPopup(provider);
        return { success: true, user: result.user };
    } catch (error) {
        console.error('Google sign in error:', error);
        throw error;
    }
}

// Initialize Firebase when DOM is loaded
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await initializeFirebase();
            setupAuthStateListener();
        } catch (error) {
            console.error('Error initializing Firebase:', error);
        }
    });
}
