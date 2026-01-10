import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyClvJWt2IxzrQFAIGxW_gsi3ENpkOHyJsQ",
    authDomain: "futbolxperience-cca9d.firebaseapp.com",
    projectId: "futbolxperience-cca9d",
    storageBucket: "futbolxperience-cca9d.firebasestorage.app",
    messagingSenderId: "484478946928",
    appId: "1:484478946928:web:929d1277827e9ef795eeb5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 2. GESTIÓN DEL LOADER Y REDIRECCIÓN DE SEGURIDAD
onAuthStateChanged(auth, (user) => {
    const loader = document.getElementById('loader');
    if (user) {
        // Si el admin ya inició sesión, redirigir al dashboard
        window.location.href = "admin.html";
    } else {
        // Si es un visitante, liberar la landing page
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                initParticles(); // Encender partículas al entrar
            }, 500);
        }
    }
});

// 3. LÓGICA DEL FORMULARIO DE CONTACTO (Guardado en DB)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.onsubmit = async(e) => {
        e.preventDefault(); // Evita recarga de página

        // Capturar datos del formulario
        const nombre = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const mensaje = contactForm.querySelector('textarea').value;

        try {
            // Guardar registro en Firestore
            await addDoc(collection(db, "contactos"), {
                organizacion: nombre,
                email: email,
                mensaje: mensaje,
                fecha: serverTimestamp() // Registro de tiempo oficial
            });

            // Confirmación visual de éxito
            alert("¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.");
            contactForm.reset(); // Limpiar campos

        } catch (error) {
            console.error("Error al guardar contacto:", error);
            alert("Hubo un problema al enviar. Inténtalo de nuevo.");
        }
    };
}

// 4. CONFIGURACIÓN DE PARTÍCULAS (ESTÉTICA FX)
function initParticles() {
    if (document.getElementById('particles-js')) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 120, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": ["#FF8C00", "#27ae60", "#00D2FF"] }, // Tricolor oficial
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
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out"
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "grab" }, // Interacción de red
                    "onclick": { "enable": true, "mode": "push" }
                },
                "modes": {
                    "grab": { "distance": 200, "line_linked": { "opacity": 0.5 } }
                }
            },
            "retina_detect": true
        });
    }
}