// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut as firebaseSignOut, 
    sendPasswordResetEmail, 
    GoogleAuthProvider, 
    signInWithPopup,
    updateProfile,
    sendEmailVerification,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js';
import { SecurityUtils } from './security.js';

// Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyDwGx2qJ90LFhu06lgWr_r6vv5Jx6JqxzE",
    authDomain: "pagepilot-y6ez7.firebaseapp.com",
    projectId: "pagepilot-y6ez7",
    storageBucket: "pagepilot-y6ez7.firebasestorage.app",
    messagingSenderId: "654134506434",
    appId: "1:654134506434:web:303611b2baa4b90e271c5b"
};

// Global Firebase state
export let auth;
export let database;
let firebaseInitialized = false;

// Initialize Firebase
export async function initializeFirebase() {
    try {
        if (!firebaseInitialized) {
            const app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            database = getDatabase(app);
            firebaseInitialized = true;
            console.log('Firebase initialized successfully');
        }
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        throw new Error('Failed to initialize Firebase. Please check your configuration and try again.');
    }
}

// Authentication state observer
export function setupAuthStateListener() {
    if (!auth) {
        console.error('Firebase Auth is not available');
        return () => {}; // Return a no-op function if auth isn't available
    }

    return onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            console.log('User is signed in:', user.uid);
            
            // Update UI for logged-in user
            updateAuthUI(user);
        } else {
            // User is signed out
            console.log('User is signed out');
            updateAuthUI(null);
        }
    });
}

// Helper function to update UI based on auth state
function updateAuthUI(user) {
    const loginLinks = document.querySelectorAll('.login-link');
    const userMenu = document.getElementById('userMenu');
    
    if (!loginLinks.length || !userMenu) return;
    
    if (user) {
        // User is signed in
        loginLinks.forEach(link => {
            link.style.display = 'none';
        });
        userMenu.style.display = 'block';
    } else {
        // User is signed out
        loginLinks.forEach(link => {
            link.style.display = 'block';
        });
        userMenu.style.display = 'none';
    }
}

// Sign up function
export async function signUp(email, password, displayName) {
    if (!auth) {
        throw new Error('Authentication service is not available. Please try again later.');
    }

    try {
        // Sanitize and validate inputs
        const sanitizedEmail = SecurityUtils.processUserInput(email, 'email');
        const sanitizedPassword = SecurityUtils.processUserInput(password, 'password');
        const sanitizedDisplayName = displayName ? SecurityUtils.processUserInput(displayName, 'name') : '';

        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
        const user = userCredential.user;

        // Update user profile with display name if provided
        if (sanitizedDisplayName) {
            await updateProfile(user, { displayName: sanitizedDisplayName });
        }

        // Send email verification
        await sendEmailVerification(user);

        return { success: true, user };
    } catch (error) {
        console.error('Sign up error:', error);
        throw error;
    }
}

// Sign in function
export async function signIn(email, password) {
    if (!auth) {
        throw new Error('Authentication service is not available. Please try again later.');
    }

    try {
        // Sanitize and validate inputs
        const sanitizedEmail = SecurityUtils.processUserInput(email, 'email');
        const sanitizedPassword = SecurityUtils.processUserInput(password, 'password');

        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
        const user = userCredential.user;

        return { success: true, user };
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
}

// Sign out user
export async function signOut() {
    try {
        // Clear any cached data first
        sessionStorage.clear();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');

        if (!auth) {
            console.warn('Auth service is not available. Local data cleared.');
            return { success: true };
        }

        // Sign out from Firebase
        await firebaseSignOut(auth);
        
        // Clear any remaining auth state
        if (window.gapi?.auth2) {
            const auth2 = window.gapi.auth2.getAuthInstance();
            if (auth2) {
                await auth2.signOut();
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        // Even if there's an error, we still want to clear local data
        sessionStorage.clear();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        throw error;
    }
}

// Password reset function
export async function resetPassword(email) {
    if (!auth) {
        throw new Error('Authentication service is not available. Please try again later.');
    }

    try {
        // Sanitize and validate email
        const sanitizedEmail = SecurityUtils.processUserInput(email, 'email');

        // Send password reset email
        await sendPasswordResetEmail(auth, sanitizedEmail);

        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        throw error;
    }
}

// Get current user with additional checks
export function getCurrentUser() {
    if (!auth) {
        console.warn('Auth service is not initialized');
        return auth?.currentUser || null;
    }
    return auth.currentUser;
}

// Check if user is authenticated
export async function isAuthenticated() {
    return new Promise((resolve) => {
        if (!auth) {
            resolve(false);
            return;
        }
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(!!user);
        });
    });
}

// Sign in with Google
export async function signInWithGoogle() {
    if (!auth) {
        throw new Error('Authentication service is not available. Please try again later.');
    }

    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        
        // This gives you a Google Access Token
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        
        // The signed-in user info
        const user = result.user;
        
        return { success: true, user };
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
