// js/main.js

const API_URL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    
    // Listener para el botón flotante
    const btnAdd = document.getElementById('btn-add-expense');
    if(btnAdd) {
        btnAdd.addEventListener('click', async () => {
            const nuevoGasto = {
                description: "Gasto Web " + Math.floor(Math.random() * 100),
                amount: parseFloat((Math.random() * 50 + 5).toFixed(2)),
                date: new Date().toISOString().split('T')[0],
                friend_ids: [1, 2] 
            };
            await crearGasto(nuevoGasto);
        });
    }
});

async function initDashboard() {
    await Promise.all([
        cargarListaGastos(),
        cargarResumenGlobal()
    ]);
}

// --- 1. GESTIÓN DE GASTOS ---

async function cargarListaGastos() {
    const contenedor = document.getElementById('expenses-list');
    
    try {
        const response = await fetch(`${API_URL}/expenses`);
        if (!response.ok) throw new Error('Error conectando con la API');
        
        const gastos = await response.json();
        
        contenedor.innerHTML = '';
        
        if (gastos.length === 0) {
            contenedor.innerHTML = '<p style="text-align:center; color: #666; margin-top: 2rem;">No hay gastos registrados.</p>';
            return;
        }

        gastos.forEach(gasto => {
            const card = crearTarjetaGasto(gasto);
            contenedor.appendChild(card);
        });

        actualizarTotalGastos(gastos);
        
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p class="error" style="text-align:center; color: var(--danger);">Error cargando los gastos. Revisa el servidor.</p>';
    }
}

function crearTarjetaGasto(gasto) {
    const article = document.createElement('article');
    article.className = 'expense-card';
    article.id = `gasto-${gasto.id}`; 
    
    const icono = obtenerIcono(gasto.description);
    const fecha = new Date(gasto.date);
    const fechaStr = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    const precioFmt = formatCurrency(gasto.amount);

    article.innerHTML = `
        <header class="card-summary">
            <div class="expense-icon" aria-hidden="true">${icono}</div>
            <div class="expense-details">
                <h3>${gasto.description}</h3>
                <time datetime="${gasto.date}">${fechaStr}</time>
            </div>
            <div class="expense-amount">
                <span class="price">${precioFmt}</span>
                <span class="status pending">Ver detalles</span>
            </div>
        </header>
        
        <section class="card-details mobile-only" id="mobile-details-${gasto.id}">
            <div class="loading-spinner" style="text-align:center; padding: 1rem; color: #888;">
                Cargando información...
            </div>
        </section>
    `;

    article.addEventListener('click', async () => {
        // Gestión visual selección (Desktop)
        document.querySelectorAll('.expense-card').forEach(c => {
            c.classList.remove('selected');
            if(c !== article) c.classList.remove('expanded');
        });
        article.classList.add('selected');

        // Acordeón (Móvil)
        const isExpanded = article.classList.toggle('expanded');

        // Cargar detalles
        await cargarYMostrarDetalles(gasto.id, article, isExpanded);
    });

    return article;
}

// LÓGICA CENTRAL DE DETALLES
async function cargarYMostrarDetalles(id, cardElement, isMobileExpanded) {
    try {
        const [gasto, participantes] = await Promise.all([
            fetch(`${API_URL}/expenses/${id}`).then(r => r.json()),
            fetch(`${API_URL}/expenses/${id}/friends`).then(r => r.json())
        ]);

        // CÁLCULOS SEGUROS (Evitar NaN)
        const total = Number(gasto.amount) || 0;
        let pagado = 0;
        
        // Sumar lo pagado (creditBalance) asegurando que es número
        participantes.forEach(p => {
            const credito = Number(p.creditBalance || p.credit_balance || 0);
            pagado += credito;
        });
        
        // Si el endpoint del gasto ya trae el pagado, lo usamos preferentemente
        if(gasto.credit_balance !== undefined) {
            pagado = Number(gasto.credit_balance);
        }
        
        const pendiente = total - pagado;

        // Renderizar Desktop
        renderizarPanelEscritorio(gasto, total, pagado, pendiente, participantes);

        // Renderizar Móvil
        if (isMobileExpanded && cardElement) {
            const detailsContainer = cardElement.querySelector('.card-details');
            if(detailsContainer) {
                detailsContainer.innerHTML = generarHtmlDetalles(total, pagado, pendiente, participantes);
            }
        }

    } catch (error) {
        console.error("Error cargando detalles:", error);
    }
}

// GENERADOR DE HTML COMÚN (Para evitar duplicar lógica visual)
function generarItemsParticipantes(participantes) {
    return participantes.map(p => {
        // Normalizar nombres de propiedades (API a veces usa snake_case o camelCase)
        const credit = Number(p.creditBalance || p.credit_balance || 0);
        const debit = Number(p.debitBalance || p.debit_balance || 0);
        
        // Cálculo de deuda neta (Lo que debe - lo que pagó)
        // Ejemplo: Si debo 10 y pagué 0 -> Debo 10.
        // Ejemplo: Si debo 10 y pagué 10 -> Saldo 0.
        // Ejemplo: Si debo 10 y pagué 100 -> A favor 90 (Pagado)
        const deudaNeta = debit - credit;
        
        let infoHtml = '';
        
        if (credit > 0.01 && deudaNeta <= 0.01) {
             // Caso: Ha pagado su parte o más (Pagador)
             infoHtml = `<span class="friend-status settled">Pagado (${formatCurrency(credit)})</span>`;
        } else if (deudaNeta > 0.01) {
             // Caso: Debe dinero
             infoHtml = `<span class="friend-status pending">Debe ${formatCurrency(deudaNeta)}</span>`;
        } else {
             // Caso: No debe nada y no pagó (o saldado exacto sin ser pagador principal)
             infoHtml = `<span class="friend-status settled">Al día</span>`;
        }

        return `
            <li>
                <div class="participant-info">
                    <span class="name">${p.name}</span>
                </div>
                ${infoHtml}
            </li>
        `;
    }).join('');
}

function generarHtmlDetalles(total, pagado, pendiente, participantes) {
    const listaAmigosHtml = generarItemsParticipantes(participantes);

    return `
        <div class="financial-summary">
            <div class="fin-item">
                <span class="label">Total</span>
                <span class="value">${formatCurrency(total)}</span>
            </div>
            <div class="fin-item">
                <span class="label">Pagado</span>
                <span class="value text-success">${formatCurrency(pagado)}</span>
            </div>
            <div class="fin-item">
                <span class="label">Pendiente</span>
                <span class="value text-danger">${formatCurrency(pendiente)}</span>
            </div>
        </div>

        <hr class="separator">

        <div class="participants-section">
            <h4>Participantes</h4>
            <ul class="participants-list">
                ${listaAmigosHtml}
            </ul>
        </div>
    `;
}

function renderizarPanelEscritorio(gasto, total, pagado, pendiente, participantes) {
    // 1. Textos Cabecera
    document.getElementById('detail-title').textContent = gasto.description;
    const fechaObj = new Date(gasto.date);
    document.getElementById('detail-date').textContent = fechaObj.toLocaleDateString('es-ES', { dateStyle: 'long' });
    document.getElementById('detail-subtitle').textContent = `ID: ${gasto.id}`;
    
    // 2. Bloques de Colores (Ahora igual que en móvil)
    document.getElementById('detail-total').textContent = formatCurrency(total);
    
    // Asegurarse de que los elementos existen en el HTML de escritorio (los añadimos en index.html)
    const elPaid = document.getElementById('detail-paid');
    const elPending = document.getElementById('detail-pending');
    
    if(elPaid) elPaid.textContent = formatCurrency(pagado);
    if(elPending) elPending.textContent = formatCurrency(pendiente);
    
    // 3. Lista Participantes
    const listaContainer = document.getElementById('detail-participants');
    if(listaContainer) {
        listaContainer.innerHTML = generarItemsParticipantes(participantes);
    }
}


// --- RESTO DE FUNCIONES (Resumen, Crear, Utilidades) ---

function actualizarTotalGastos(gastos) {
    const total = gastos.reduce((acc, g) => acc + (Number(g.amount) || 0), 0);
    const el = document.getElementById('dashboard-total');
    if(el) el.textContent = formatCurrency(total);
}

async function cargarResumenGlobal() {
    try {
        const response = await fetch(`${API_URL}/friends`);
        if (!response.ok) return;
        const amigos = await response.json();
        
        let saldo = 0;
        amigos.forEach(a => {
            const credit = Number(a.creditBalance || a.credit_balance || 0);
            const debit = Number(a.debitBalance || a.debit_balance || 0);
            saldo += (credit - debit);
        });
        
        const el = document.getElementById('dashboard-balance');
        if(el) {
            el.textContent = formatCurrency(Math.abs(saldo));
            const card = el.closest('.summary-card');
            const label = card.querySelector('p');
            
            if (saldo >= -0.01) { // Margen pequeño por decimales
                card.classList.remove('negative');
                label.textContent = "Te deben";
            } else {
                card.classList.add('negative');
                label.textContent = "Debes";
            }
        }
    } catch (e) { console.error(e); }
}

async function crearGasto(datosGasto) {
    try {
        const response = await fetch(`${API_URL}/expenses/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosGasto)
        });
        if (response.ok) {
            cargarListaGastos();
        } else {
            console.error('Error creando gasto');
        }
    } catch (e) { console.error(e); }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}

function obtenerIcono(texto) {
    const t = (texto || "").toLowerCase();
    if (t.includes('viaje') || t.includes('vuelo')) return '✈️';
    if (t.includes('cena') || t.includes('comida') || t.includes('compra')) return '🍔';
    if (t.includes('gasolina') || t.includes('coche')) return '⛽';
    if (t.includes('hotel')) return '🏨';
    return '💸';
}