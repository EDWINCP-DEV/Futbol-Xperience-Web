// Asegúrate de que las importaciones estén en la parte superior sin espacios extra
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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
    orderBy,
    addDoc,
    updateDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyClvJWt2IxzrQfAIGxW_gsi3ENpkOHyJsQ",
    authDomain: "futbolxperience-cca9d.firebaseapp.com",
    projectId: "futbolxperience-cca9d",
    storageBucket: "futbolxperience-cca9d.firebasestorage.app",
    messagingSenderId: "484478946928",
    appId: "1:484478946928:web:929d1277827e9ef795eeb5",
    measurementId: "G-HV2BF5W6K7"
};

// Inicialización corregida para evitar ReferenceError
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- SEGURIDAD Y CONTROL DE SESIÓN ---
onAuthStateChanged(auth, async(user) => {
    if (user) {
        try {
            const userRef = doc(db, "users", user.uid);
            const adminDoc = await getDoc(userRef);

            if (adminDoc.exists() && adminDoc.data().role === "admin_general") {
                document.getElementById('admin-name-display').innerText = adminDoc.data().fullName;
                registrarActividad(`${adminDoc.data().fullName} accedió al sistema.`);
                iniciarDashboard();
            } else {
                await signOut(auth);
                window.location.replace("login.html");
            }
        } catch (error) { console.error("Error de conexión:", error); }
    } else {
        if (!window.location.pathname.includes("login.html")) window.location.replace("login.html");
    }
});

function iniciarDashboard() {
    ejecutarAuditoriaGlobal();
    cargarMonitoreoDeLigas();
    cargarConsultasSoporte();
    inicializarGrafico();
    cargarAdmins();
}

// --- LOGS Y GRÁFICOS ---
function registrarActividad(mensaje) {
    const log = document.getElementById('activity-log');
    if (!log) return;
    const item = document.createElement('li');
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    item.innerHTML = `<span style="color:var(--fx-blue)">[${hora}]</span> ${mensaje}`;
    log.prepend(item);
}

function inicializarGrafico() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
            datasets: [{
                label: 'Nuevos Equipos',
                data: [5, 12, 8, 15, 10, 20, 25],
                borderColor: '#00D2FF',
                backgroundColor: 'rgba(0, 210, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
                x: { ticks: { color: '#888' } }
            }
        }
    });
}

// --- MODALES GLOBALES ---
window.abrirModalAdmin = () => document.getElementById('adminModal').style.display = 'block';
window.cerrarModalAdmin = () => document.getElementById('adminModal').style.display = 'none';

function cargarAdmins() {
    const q = query(collection(db, "users"), where("role", "==", "admin_general"));
    onSnapshot(q, (snap) => {
                const tbody = document.getElementById('admins-tbody');
                if (!tbody) return;
                tbody.innerHTML = snap.docs.map(docSnap => {
                            const admin = docSnap.data();
                            const esMismoUsuario = auth.currentUser && admin.uid === auth.currentUser.uid;
                            return `<tr>
                <td><b>${admin.fullName}</b></td>
                <td>${admin.email}</td>
                <td>
                    ${esMismoUsuario ? '<span style="color:#888">Tú (Sesión activa)</span>' :
                    `<button onclick="eliminarAdmin('${docSnap.id}')" class="btn-action" style="color:#ff4d4d; border-color:#ff4d4d;">Quitar Acceso</button>`}
                </td>
            </tr>`;
        }).join('');
    });
}

document.getElementById('form-nuevo-admin').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('new-admin-name').value;
    const email = document.getElementById('new-admin-email').value;
    const pass = document.getElementById('new-admin-pass').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newUser = userCredential.user;

        await setDoc(doc(db, "users", newUser.uid), {
            fullName: name,
            email: email,
            role: "admin_general",
            uid: newUser.uid
        });

        registrarActividad(`Nuevo administrador creado: ${name}`);
        alert("Admin creado con éxito.");
        window.location.reload();
    } catch (error) { alert("Error: " + error.message); }
};

window.eliminarAdmin = async (id) => {
    if (confirm("¿Quitar permisos de administrador?")) {
        try {
            await deleteDoc(doc(db, "users", id));
            registrarActividad("Se eliminó un administrador del sistema.");
        } catch (e) { alert("Error: " + e.message); }
    }
};
// FUNCIÓN DE ANUNCIO (Línea 26 aproximada en el HTML): Vinculada a window
window.enviarAnuncioGlobal = async () => {
    const mensaje = prompt("Mensaje para todos los usuarios:");
    if (mensaje) {
        try {
            await addDoc(collection(db, "announcements"), {
                text: mensaje,
                date: serverTimestamp(),
                sender: "Admin FX"
            });
            registrarActividad(`Comunicado global enviado.`);
            alert("Enviado con éxito.");
        } catch (e) { alert("Error: " + e.message); }
    }
};

function cargarMonitoreoDeLigas() {
    onSnapshot(collection(db, "users"), async (snap) => {
        const tbody = document.getElementById('ligas-tbody');
        let count = 0;

        const rows = await Promise.all(snap.docs.map(async (docSnap) => {
            const u = docSnap.data();
            if (u.role !== "admin_liga") return "";
            count++;

            const q = query(collection(db, "teams"), where("ligaID", "==", u.currentLigaID || ""));
            const tSnap = await getDocs(q);
            const limite = u.teamLimit || 10;

            return `<tr>
                <td><b>${u.fullName}</b></td>
                <td>${u.email || 'Sin correo'}</td> 
                <td>
                    ${tSnap.size} / ${limite} equipos
                    <button onclick="editarLimite('${docSnap.id}', ${limite})" class="btn-action" style="border-color:var(--fx-orange); color:var(--fx-orange); padding:2px 8px; margin-left:10px;">+</button>
                </td>
                <td><span class="status-pill active">SALUDABLE</span></td>
                <td><button onclick="borrarLiga('${docSnap.id}')" class="btn-action" style="color:#ff4d4d; border-color:#ff4d4d;">Eliminar</button></td>
            </tr>`;
        }));

        tbody.innerHTML = rows.join('');
        document.getElementById('count-ligas').innerText = count;
    });
}

window.editarLimite = async (id, actual) => {
    const nuevo = prompt("Establecer nuevo límite de equipos:", actual);
    if (nuevo && !isNaN(nuevo)) {
        await updateDoc(doc(db, "users", id), { teamLimit: parseInt(nuevo) });
        registrarActividad(`Se actualizó un límite de equipos a ${nuevo}.`);
    }
};

window.enviarAnuncioGlobal = async () => {
    const mensaje = prompt("Mensaje para todos los usuarios:");
    if (mensaje) {
        try {
            await addDoc(collection(db, "announcements"), {
                text: mensaje,
                date: serverTimestamp(), // <-- SE CORRIGIÓ EL ERROR DEL PUNTO AQUÍ
                sender: "Admin FX"
            });
            registrarActividad(`Comunicado global enviado.`);
            alert("Enviado.");
        } catch (e) { alert(e.message); }
    }
};

function ejecutarAuditoriaGlobal() {
    onSnapshot(collection(db, "matches"), (snap) => {
        document.getElementById('active-matches-count').innerText = snap.docs.filter(d => d.data().status === "scheduled").length;
    });
}

function cargarConsultasSoporte() {
    onSnapshot(query(collection(db, "contactos"), orderBy("fecha", "desc")), (snap) => {
        const tbody = document.getElementById('contact-tbody');
        tbody.innerHTML = snap.docs.map(docSnap => {
            const d = docSnap.data();
            return `<tr>
                <td>${d.organizacion}</td>
                <td>${d.email}</td>
                <td class="msg-text">"${d.mensaje}"</td>
                <td><button onclick="borrarMensaje('${docSnap.id}')" class="btn-action" style="color:#ff4d4d; border-color:#ff4d4d;">Borrar</button></td>
            </tr>`;
        }).join('');
    });
}

window.borrarMensaje = async (id) => { if (confirm("¿Borrar mensaje?")) await deleteDoc(doc(db, "contactos", id)); };
window.borrarLiga = async (id) => { if (confirm("¿Borrar liga?")) await deleteDoc(doc(db, "users", id)); };
document.getElementById('btnLogout').onclick = () => signOut(auth).then(() => window.location.replace("login.html"));