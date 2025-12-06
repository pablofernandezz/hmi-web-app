// js/main.js

const API_URL = 'http://127.0.0.1:8000';

let currentEditId = null;

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupModalListeners();
    setupAddModalListeners();
});

async function initDashboard() {
    await Promise.all([
        cargarListaGastos(),
        cargarResumenGlobal()
    ]);
}

// --- SETUP LISTENERS ---

function setupModalListeners() {
    const modal = document.getElementById('edit-modal');
    const btnCancel = document.getElementById('btn-cancel-edit');
    const form = document.getElementById('edit-form');

    if(btnCancel) {
        btnCancel.addEventListener('click', () => {
            modal.close();
            currentEditId = null;
        });
    }

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await guardarEdicion();
        });
    }
}

function setupAddModalListeners() {
    const btnAdd = document.getElementById('btn-add-expense');
    const modal = document.getElementById('add-modal');
    const btnCancel = document.getElementById('btn-cancel-add');
    const form = document.getElementById('add-form');

    if(btnAdd) {
        btnAdd.addEventListener('click', async () => {
            form.reset();
            document.getElementById('add-date').value = new Date().toISOString().split('T')[0];
            
            await cargarAmigosEnModal('add-friends-list', 'friend_ids');
            
            modal.showModal();
        });
    }

    if(btnCancel) {
        btnCancel.addEventListener('click', () => modal.close());
    }

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await crearNuevoGasto();
        });
    }
}

// --- HELPER TO LOAD FRIENDS INTO MODALS ---

async function cargarAmigosEnModal(containerId, inputName, participantesActuales = []) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<p class="text-muted">Cargando...</p>';

    try {
        const response = await fetch(`${API_URL}/friends`);
        if (!response.ok) throw new Error('Error getting friends');
        const amigos = await response.json();

        container.innerHTML = '';

        const mapParticipantes = {};
        participantesActuales.forEach(p => {
            mapParticipantes[p.id] = p; 
        });

        if (amigos.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay amigos registrados.</p>';
            return;
        }

        amigos.forEach(amigo => {
            const isParticipant = mapParticipantes.hasOwnProperty(amigo.id);
            const datosParticipacion = mapParticipantes[amigo.id];
            
            let haPagado = false;
            if (isParticipant && (datosParticipacion.creditBalance > 0 || datosParticipacion.credit_balance > 0)) {
                haPagado = true;
            }

            const label = document.createElement('label');
            label.className = `friend-checkbox ${haPagado ? 'disabled' : ''}`;
            
            let inputHtml = `<input type="checkbox" name="${inputName}" value="${amigo.id}"`;
            
            if (isParticipant) {
                inputHtml += ' checked';
            }
            if (haPagado) {
                inputHtml += ' disabled'; 
            }
            inputHtml += '>';

            label.innerHTML = `${inputHtml} ${amigo.name} ${haPagado ? '<small>(Pagó)</small>' : ''}`;
            container.appendChild(label);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="text-danger">Error al cargar amigos.</p>';
    }
}

// --- 1. EXPENSE MANAGEMENT ---

async function cargarListaGastos() {
    const contenedor = document.getElementById('expenses-list');
    
    try {
        const response = await fetch(`${API_URL}/expenses`);
        if (!response.ok) throw new Error('Error connecting to API');
        
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
        document.querySelectorAll('.expense-card').forEach(c => {
            c.classList.remove('selected');
            if(c !== article) c.classList.remove('expanded');
        });
        article.classList.add('selected');

        const isExpanded = article.classList.toggle('expanded');
        await cargarYMostrarDetalles(gasto.id, article, isExpanded);
    });

    return article;
}

async function cargarYMostrarDetalles(id, cardElement, isMobileExpanded) {
    try {
        const [gasto, participantes] = await Promise.all([
            fetch(`${API_URL}/expenses/${id}`).then(r => r.json()),
            fetch(`${API_URL}/expenses/${id}/friends`).then(r => r.json())
        ]);

        const total = Number(gasto.amount) || 0;
        let pagado = 0;
        
        participantes.forEach(p => {
            const credito = Number(p.creditBalance || p.credit_balance || 0);
            pagado += credito;
        });
        
        if(gasto.credit_balance !== undefined) {
            pagado = Number(gasto.credit_balance);
        }
        
        const pendiente = total - pagado;

        renderizarPanelEscritorio(gasto, total, pagado, pendiente, participantes);

        if (isMobileExpanded && cardElement) {
            const detailsContainer = cardElement.querySelector('.card-details');
            if(detailsContainer) {
                detailsContainer.innerHTML = generarHtmlDetalles(gasto.id, total, pagado, pendiente, participantes);
            }
        }

    } catch (error) {
        console.error("Error cargando detalles:", error);
    }
}

function generarItemsParticipantes(participantes) {
    return participantes.map(p => {
        const credit = Number(p.creditBalance || p.credit_balance || 0);
        const debit = Number(p.debitBalance || p.debit_balance || 0);
        const deudaNeta = debit - credit;
        
        let infoHtml = '';
        
        if (credit > 0.01 && deudaNeta <= 0.01) {
             infoHtml = `<span class="friend-status settled">Pagado (${formatCurrency(credit)})</span>`;
        } else if (deudaNeta > 0.01) {
             infoHtml = `<span class="friend-status pending">Debe ${formatCurrency(deudaNeta)}</span>`;
        } else {
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

function generarHtmlDetalles(id, total, pagado, pendiente, participantes) { 
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
        
        <div class="actions-container">
            <button class="btn-action btn-edit" onclick="abrirModalEdicion(${id})">✏️ Editar</button>
            <button class="btn-action btn-delete" onclick="eliminarGasto(${id})">🗑️ Eliminar</button>
        </div>
    `;
}

function renderizarPanelEscritorio(gasto, total, pagado, pendiente, participantes) {
    document.getElementById('detail-title').textContent = gasto.description;
    const fechaObj = new Date(gasto.date);
    document.getElementById('detail-date').textContent = fechaObj.toLocaleDateString('es-ES', { dateStyle: 'long' });
    document.getElementById('detail-subtitle').textContent = `ID: ${gasto.id}`;
    document.getElementById('detail-total').textContent = formatCurrency(total);
    
    const elPaid = document.getElementById('detail-paid');
    const elPending = document.getElementById('detail-pending');
    if(elPaid) elPaid.textContent = formatCurrency(pagado);
    if(elPending) elPending.textContent = formatCurrency(pendiente);
    
    const listaContainer = document.getElementById('detail-participants');
    if(listaContainer) {
        listaContainer.innerHTML = generarItemsParticipantes(participantes);
    }

    const actionsPlaceholder = document.querySelector('.expense-detail-panel .actions-placeholder');
    if(actionsPlaceholder) {
        actionsPlaceholder.innerHTML = `
            <div class="actions-container">
                <button class="btn-action btn-edit" onclick="abrirModalEdicion(${gasto.id})">✏️ Editar</button>
                <button class="btn-action btn-delete" onclick="eliminarGasto(${gasto.id})">🗑️ Eliminar gasto</button>
            </div>
        `;
    }
}

// --- 2. LOGICA DE CREAR Y EDITAR ---

// CREATE - AJUSTADO PARA ENVIAR PARÁMETROS COMO QUERY STRING
async function crearNuevoGasto() {
    const desc = document.getElementById('add-desc').value;
    const amount = parseFloat(document.getElementById('add-amount').value);
    const date = document.getElementById('add-date').value;

    const checkboxes = document.querySelectorAll('#add-friends-list input[name="friend_ids"]:checked');
    const friendIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    if (friendIds.length === 0) {
        alert("Debes seleccionar al menos un amigo.");
        return;
    }

    const nuevoGasto = {
        description: desc,
        amount: amount,
        date: date
    };

    try {
        // 1. Crear el gasto (sin amigos)
        const response = await fetch(`${API_URL}/expenses/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoGasto)
        });

        if (!response.ok) {
            alert("Error al crear el gasto.");
            return;
        }

        const gastoCreado = await response.json();
        const gastoId = gastoCreado.id;

        // 2. Asociar amigos uno por uno usando query parameters
        let todosAsociados = true;
        for (const friendId of friendIds) {
            // IMPORTANTE: Usar parámetros de consulta como en la app de escritorio
            const asociacionResponse = await fetch(`${API_URL}/expenses/${gastoId}/friends?friend_id=${friendId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!asociacionResponse.ok) {
                console.error(`Error asociando amigo ${friendId} al gasto ${gastoId}:`, await asociacionResponse.text());
                todosAsociados = false;
            }
        }

        if (!todosAsociados) {
            alert("Gasto creado, pero hubo problemas al asociar algunos amigos.");
        }

        document.getElementById('add-modal').close();
        await initDashboard(); 
    } catch (error) {
        console.error(error);
        alert("Error de conexión.");
    }
}

// EDIT - OPEN
async function abrirModalEdicion(id) {
    try {
        const [gastoRes, participantesRes] = await Promise.all([
            fetch(`${API_URL}/expenses/${id}`),
            fetch(`${API_URL}/expenses/${id}/friends`)
        ]);

        const gasto = await gastoRes.json();
        const participantes = await participantesRes.json();

        document.getElementById('edit-desc').value = gasto.description;
        document.getElementById('edit-amount').value = gasto.amount;
        document.getElementById('edit-date').value = gasto.date.split('T')[0];
        
        currentEditId = id;

        await cargarAmigosEnModal('edit-friends-list', 'edit_friend_ids', participantes);

        document.getElementById('edit-modal').showModal();

    } catch (error) {
        console.error(error);
        alert("Error cargando datos para editar.");
    }
}

// EDIT - SAVE - AJUSTADO PARA ENVIAR PARÁMETROS COMO QUERY STRING
async function guardarEdicion() {
    if (!currentEditId) return;

    const descripcion = document.getElementById('edit-desc').value;
    const importe = parseFloat(document.getElementById('edit-amount').value);
    const fecha = document.getElementById('edit-date').value;

    const checkboxes = document.querySelectorAll('#edit-friends-list input[name="edit_friend_ids"]');
    const nuevosAmigosIds = [];
    
    checkboxes.forEach(cb => {
        if (cb.checked) {
            nuevosAmigosIds.push(parseInt(cb.value));
        }
    });

    if (nuevosAmigosIds.length === 0) {
        alert("El gasto debe tener al menos un participante.");
        return;
    }

    try {
        // 1. Obtener el gasto actual y sus amigos actuales
        const [currentRes, amigosRes] = await Promise.all([
            fetch(`${API_URL}/expenses/${currentEditId}`),
            fetch(`${API_URL}/expenses/${currentEditId}/friends`)
        ]);

        if (!currentRes.ok || !amigosRes.ok) {
            throw new Error("Error al obtener datos del gasto");
        }

        const current = await currentRes.json();
        const amigosActuales = await amigosRes.json();
        const amigosActualesIds = amigosActuales.map(a => a.id);

        // 2. Actualizar los datos básicos del gasto
        const datosActualizados = {
            ...current,
            description: descripcion,
            amount: importe,
            date: fecha
        };

        const updateRes = await fetch(`${API_URL}/expenses/${currentEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });

        if (!updateRes.ok) {
            alert("Error al guardar los cambios del gasto.");
            return;
        }

        // 3. Comparar listas de amigos y actualizar
        const idsAmigosOriginales = new Set(amigosActualesIds);
        const idsAmigosNuevos = new Set(nuevosAmigosIds);
        
        // Amigos a añadir
        const idsAnadir = [...idsAmigosNuevos].filter(id => !idsAmigosOriginales.has(id));
        // Amigos a quitar (solo si no han pagado)
        const idsQuitar = [...idsAmigosOriginales].filter(id => !idsAmigosNuevos.has(id));
        
        // 4. Añadir nuevos amigos usando query parameters
        for (const amigoId of idsAnadir) {
            await fetch(`${API_URL}/expenses/${currentEditId}/friends?friend_id=${amigoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 5. Quitar amigos (solo si no han pagado)
        for (const amigoId of idsQuitar) {
            // Verificar si el amigo ha pagado
            const amigo = amigosActuales.find(a => a.id === amigoId);
            const haPagado = amigo && (amigo.creditBalance > 0 || amigo.credit_balance > 0);
            
            if (!haPagado) {
                await fetch(`${API_URL}/expenses/${currentEditId}/friends/${amigoId}`, {
                    method: 'DELETE'
                });
            }
        }

        document.getElementById('edit-modal').close();
        await initDashboard(); 
        
        const selected = document.querySelector(`.expense-card.selected`);
        if(selected && selected.id === `gasto-${currentEditId}`) {
            cargarYMostrarDetalles(currentEditId, selected, false);
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión.");
    }
}

async function eliminarGasto(id) {
    if(!confirm("¿Estás seguro de que quieres eliminar este gasto?")) return;

    try {
        const response = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'DELETE'
        });

        if (response.ok || response.status === 204) {
            document.getElementById('detail-title').textContent = "Selecciona un gasto";
            document.getElementById('detail-date').textContent = "--/--/----";
            document.getElementById('detail-total').textContent = "0,00 €";
            document.getElementById('detail-participants').innerHTML = "";
            const placeholder = document.querySelector('.expense-detail-panel .actions-placeholder');
            if(placeholder) placeholder.innerHTML = '<p class="text-muted">Selecciona un gasto...</p>';
            
            await initDashboard(); 
        } else {
            alert("Error al eliminar el gasto.");
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión.");
    }
}

// --- UTILS ---

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
            
            if (saldo >= -0.01) { 
                card.classList.remove('negative');
                label.textContent = "Te deben";
            } else {
                card.classList.add('negative');
                label.textContent = "Debes";
            }
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
    if (t.includes('hotel') || t.includes('alojamiento') || t.includes('casa')) return '🏨';
    return '💸';
}