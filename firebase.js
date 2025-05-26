// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQzf0dhhk1uiGH9LfhG3FkscfyGkusS7s",
    authDomain: "brew-up1.firebaseapp.com",
    projectId: "brew-up1",
    storageBucket: "brew-up1.firebasestorage.app",
    messagingSenderId: "669721652453",
    appId: "1:669721652453:web:66985ea62c9771c48b380c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export auth and db for use in other files
export { auth, db };

// Auth state observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        document.body.classList.add('user-signed-in');
        
        // Check if user is admin
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        // No redirect for admin users
    } else {
        // User is signed out
        document.body.classList.remove('user-signed-in');
    }
});

// Login function
export const loginUser = async (email, password) => {
    try {
        console.log('Firebase login attempt with:', email); // Debug log
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Firebase login successful:', user); // Debug log
        
        // Check if user is admin
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        console.log('User data from Firestore:', userData); // Debug log
        
        if (userData && userData.isAdmin) {
            console.log('User is admin, redirecting to admin page'); // Debug log
            window.location.href = '/admin.html';
        }
        
        return user;
    } catch (error) {
        console.error('Firebase login error:', error); // Debug log
        throw error;
    }
};

// Register function
export const registerUser = async (email, password, displayName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile
        await updateProfile(user, {
            displayName: displayName
        });

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            displayName: displayName,
            createdAt: new Date().toISOString(),
            isAdmin: false // Default to non-admin
        });

        return user;
    } catch (error) {
        throw error;
    }
};

// Password reset function
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        throw error;
    }
};

// Logout function
export const logoutUser = async () => {
    try {
        await signOut(auth);
        // Redirect to home page after logout
        window.location.href = '/';
    } catch (error) {
        throw error;
    }
};

// Save order to Firestore
export const saveOrder = async (orderData) => {
    try {
        console.log('Original createdAt:', orderData.createdAt);
        
        // Convert Date to Firestore Timestamp
        const createdAt = orderData.createdAt ? 
            Timestamp.fromDate(new Date(orderData.createdAt)) : 
            Timestamp.now();
            
        console.log('Converted to Timestamp:', createdAt);
        
        const orderRef = await addDoc(collection(db, "orders"), {
            ...orderData,
            createdAt, // Use the Firestore Timestamp
            status: orderData.status || (orderData.type === 'delivery' ? 'pending' : 'pending')
        });
        
        return orderRef.id;
    } catch (error) {
        console.error('Error saving order:', error);
        throw error;
    }
}; 