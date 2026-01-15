import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyClvJWt2IxzrQfAIGxW_gsi3ENpkOHyJsQ",
    authDomain: "futbolxperience-cca9d.firebaseapp.com",
    projectId: "futbolxperience-cca9d",
    storageBucket: "futbolxperience-cca9d.firebasestorage.app",
    messagingSenderId: "484478946928",
    appId: "1:484478946928:web:929d1277827e9ef795eeb5",
    measurementId: "G-HV2BF5W6K7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById('btnLogin').onclick = async(e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // Validamos el rol antes de dejarlo pasar
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin_general") {
            alert(`¡Bienvenido, ${userDoc.data().fullName}!`);
            window.location.replace("admin.html");
        } else {
            alert("Acceso Restringido: No tienes permisos de Administrador General.");
            await auth.signOut();
        }
    } catch (error) {
        alert("Credenciales inválidas o error de conexión.");
        console.error(error);
    }
};

// Partículas (mantén tu código de partículas aquí abajo igual)

particlesJS("particles-js", {
    "particles": {
        "number": { "value": 110, "density": { "enable": true, "value_area": 800 } },
        "color": { "value": ["#FF8C00", "#27ae60", "#00D2FF"] },
        "shape": { "type": "circle" },
        "opacity": { "value": 0.5, "random": true },
        "size": { "value": 3, "random": true },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#00D2FF",
            "opacity": 0.2,
            "width": 1
        },
        "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true }
    },
    "interactivity": {
        "events": { "onhover": { "enable": true, "mode": "grab" } }
    },
    "retina_detect": true
});