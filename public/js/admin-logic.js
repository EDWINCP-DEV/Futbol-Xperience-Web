import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    onSnapshot,
    doc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIGURACIÓN OFICIAL CORREGIDA
const firebaseConfig = {
    apiKey: "AIzaSyClvJWt2IxzrQfAIGxW_gsi3ENpkOHyJsQ", // F MAYÚSCULA
    authDomain: "futbolxperience-cca9d.firebaseapp.com",
    projectId: "futbolxperience-cca9d",
    storageBucket: "futbolxperience-cca9d.firebasestorage.app",
    messagingSenderId: "484478946928",
    appId: "1:484478946928:web:929d1277827e9ef795eeb5",
    measurementId: "G-HV2BF5W6K7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// SEGURIDAD FLEXIBLE: Valida sesión activa para evitar bucles
onAuthStateChanged(auth, async(user) => {
    if (user) {
        console.log("Sesión verificada para:", user.email);
        const adminDoc = await getDoc(doc(db, "users", user.uid));

        // Ponemos el nombre del Admin si existe
        document.getElementById('admin-name-display').innerText = adminDoc.exists() ? adminDoc.data().fullName : "Admin Maestro";

        iniciarDashboard();
    } else {
        if (!window.location.pathname.includes("login.html")) {
            window.location.replace("login.html");
        }
    }
});

function iniciarDashboard() {
    ejecutarAuditoriaGlobal();
    cargarMonitoreoDeLigas();
    cargarConsultasSoporte();
}

// 1. AUDITORÍA: Partidos hoy
function ejecutarAuditoriaGlobal() {
    onSnapshot(collection(db, "matches"), (snap) => {
        const activos = snap.docs.filter(d => d.data().status === "scheduled").length;
        document.getElementById('active-matches-count').innerText = activos;
    });
}

// 2. MONITOR: Ligas (Vínculo Rafa Martínez)
function cargarMonitoreoDeLigas() {
    onSnapshot(collection(db, "users"), async(snap) => {
        const tbody = document.getElementById('ligas-tbody');
        let count = 0;

        const rows = await Promise.all(snap.docs.map(async(docSnap) => {
            const u = docSnap.data();
            if (u.role !== "admin_liga") return "";
            count++;

            // Conteo automático de equipos vinculados
            const q = query(collection(db, "teams"), where("ligaID", "==", u.currentLigaID || ""));
            const tSnap = await getDocs(q);

            return `<tr>
                <td><b>${u.fullName}</b></td>
                <td>${u.email}</td>
                <td>${tSnap.size} equipos</td>
                <td><span class="status-pill active">Saludable</span></td>
                <td><button onclick="borrarLiga('${docSnap.id}')" class="btn-action" style="color:#ff4d4d; border:1px solid #ff4d4d; background:none; cursor:pointer;">Eliminar</button></td>
            </tr>`;
        }));

        tbody.innerHTML = rows.join('');
        document.getElementById('count-ligas').innerText = count;
    });
}

// 3. CRM: Soporte (Nec Gaming)
function cargarConsultasSoporte() {
    onSnapshot(query(collection(db, "contactos"), orderBy("fecha", "desc")), (snap) => {
        const tbody = document.getElementById('contact-tbody');
        tbody.innerHTML = snap.docs.map(docSnap => {
            const d = docSnap.data();
            return `<tr>
                <td>${d.organizacion}</td>
                <td>${d.email}</td>
                <td class="msg-text">"${d.mensaje}"</td>
                <td><button onclick="borrarMensaje('${docSnap.id}')" class="btn-action" style="color:#ff4d4d; border:1px solid #ff4d4d; background:none; cursor:pointer;">Borrar</button></td>
            </tr>`;
        }).join('');
    });
}

// FUNCIONES GLOBALES
window.borrarMensaje = async(id) => { if (confirm("¿Borrar mensaje?")) await deleteDoc(doc(db, "contactos", id)); };
window.borrarLiga = async(id) => { if (confirm("¿Borrar liga?")) await deleteDoc(doc(db, "users", id)); };
document.getElementById('btnLogout').onclick = () => signOut(auth).then(() => window.location.replace("login.html"));