// js/main.js - VERSIÓN COMPLETA CORREGIDA

const API_URL = 'http://127.0.0.1:8000';

let currentEditId = null;
let currentContributionData = null;
let loadingCounter = 0;
let listaGastosCache = [];

// --- FUNCIONES PARA MODALES DE MENSAJE ---
function showMessage(message, title = 'Aviso') {
    return new Promise((resolve) => {
        const modal = document.getElementById('message-modal');
        document.getElementById('title-message-modal').textContent = title;
        document.getElementById('message-text').textContent = message;
        
        const btnOk = document.getElementById('message-ok');
        
        const handleClick = () => {
            modal.close();
            btnOk.removeEventListener('click', handleClick);
            resolve();
        };
        
        btnOk.addEventListener('click', handleClick);
        modal.showModal();
    });
}

function showConfirm(message, title = 'Confirmar') {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        document.getElementById('confirm-text').textContent = message;
        modal.showModal();
        
        const btnOk = document.getElementById('confirm-ok');
        const btnCancel = document.getElementById('confirm-cancel');
        
        const handleOk = () => {
            modal.close();
            btnOk.removeEventListener('click', handleOk);
            btnCancel.removeEventListener('click', handleCancel);
            resolve(true);
        };
        
        const handleCancel = () => {
            modal.close();
            btnOk.removeEventListener('click', handleOk);
            btnCancel.removeEventListener('click', handleCancel);
            resolve(false);
        };
        
        btnOk.addEventListener('click', handleOk);
        btnCancel.addEventListener('click', handleCancel);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupModalListeners();
    setupAddModalListeners();
    setupContributionListeners();
    setupNavigation();
    setupGlobalEventListeners();
});

// --- UTILIDADES DE CARGA ---
function showLoading() {
    loadingCounter++;
    const overlay = document.getElementById('loading-overlay');
    if(overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
    loadingCounter--;
    if (loadingCounter <= 0) { 
        loadingCounter = 0;
        const overlay = document.getElementById('loading-overlay');
        if(overlay) overlay.classList.add('hidden');
    }
}

function toggleModalButtons(modalId, disabled) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const buttons = modal.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = disabled);
}

async function initDashboard() {
    showLoading();
    try {
        await Promise.all([
            cargarListaGastos(),
            cargarResumenGlobal()
        ]);
    } finally {
        hideLoading();
    }
}

// --- SETUP LISTENERS GLOBALES ---
function setupGlobalEventListeners() {
    // Delegación de eventos para botones de acción
    document.addEventListener('click', async (e) => {
        // Botones de editar
        if (e.target.closest('.btn-edit')) {
            const button = e.target.closest('.btn-edit');
            const expenseId = button.dataset.expenseId;
            if (expenseId) {
                await abrirModalEdicion(parseInt(expenseId));
            }
        }
        
        // Botones de eliminar
        if (e.target.closest('.btn-delete')) {
            const button = e.target.closest('.btn-delete');
            const expenseId = button.dataset.expenseId;
            if (expenseId) {
                await eliminarGasto(parseInt(expenseId));
            }
        }
        
        // Botones de pagar
        if (e.target.closest('.btn-pay')) {
            const button = e.target.closest('.btn-pay');
            const gastoId = button.dataset.expenseId;
            const amigoId = button.dataset.friendId;
            const nombreAmigo = button.dataset.friendName;
            const deudaActual = parseFloat(button.dataset.debtAmount);
            
            if (gastoId && amigoId && nombreAmigo && deudaActual) {
                abrirModalAporte(
                    parseInt(gastoId), 
                    parseInt(amigoId), 
                    nombreAmigo, 
                    deudaActual
                );
            }
        }
        
        // Botones de ver detalle
        if (e.target.closest('.btn-view-detail')) {
            const button = e.target.closest('.btn-view-detail');
            const expenseId = button.dataset.expenseId;
            if (expenseId) {
                irAVerGasto(parseInt(expenseId));
            }
        }
    });
}

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

function setupContributionListeners() {
    const modal = document.getElementById('contribution-modal');
    const btnCancel = document.getElementById('btn-cancel-contribution');
    const form = document.getElementById('contribution-form');

    if(btnCancel) {
        btnCancel.addEventListener('click', () => {
            modal.close();
            currentContributionData = null;
        });
    }

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await guardarAporte();
        });
    }
}

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

// --- 1. GASTOS ---
async function cargarListaGastos() {
    const contenedor = document.getElementById('expenses-list');
    
    try {
        const response = await fetch(`${API_URL}/expenses`);
        if (!response.ok) throw new Error('Error connecting to API');
        
        const gastos = await response.json();
        listaGastosCache = gastos;
        
        contenedor.innerHTML = '';
        
        if (gastos.length === 0) {
            contenedor.innerHTML = '<p class="text-muted">No hay gastos registrados.</p>';
            return;
        }

        gastos.forEach(gasto => {
            const card = crearTarjetaGasto(gasto);
            contenedor.appendChild(card);
        });

        actualizarTotalGastos(gastos);
        
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p class="text-danger">Error cargando los gastos. Revisa el servidor.</p>';
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
    const total = Number(gasto.amount) || 0;
    const pagado = Number(gasto.credit_balance || gasto.creditBalance || 0);
    const pendiente = total - pagado;
    
    let statusHtml = '';

    if (pendiente <= 0.01) {
        statusHtml = '<span class="status settled">Saldado</span>';
    } else {
        statusHtml = '<span class="status pending">Pendiente</span>';
    }

    article.innerHTML = `
        <button class="card-summary" aria-expanded="false" aria-controls="mobile-details-${gasto.id}">
            <div class="expense-icon" aria-hidden="true">${icono}</div>
            <div class="expense-details">
                <h3>${gasto.description}</h3>
                <time datetime="${gasto.date}">${fechaStr}</time>
            </div>
            <div class="expense-amount">
                <span class="price">${precioFmt}</span>
                ${statusHtml}
            </div>
            <span class="expand-icon" aria-hidden="true">▶</span>
        </button>
        
        <section class="card-details mobile-only" id="mobile-details-${gasto.id}">
            <div class="loading-spinner">Cargando información...</div>
        </section>
    `;

    const summaryBtn = article.querySelector('.card-summary');
    
    summaryBtn.addEventListener('click', async () => {
        const isExpanded = article.classList.contains('expanded');
        
        // Cerrar otros gastos expandidos en móvil
        if (window.innerWidth < 1024) {
            document.querySelectorAll('.expense-card.expanded').forEach(card => {
                if (card !== article) {
                    card.classList.remove('expanded');
                    const btn = card.querySelector('.card-summary');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                }
            });
        }
        
        // Alternar estado
        article.classList.toggle('expanded');
        summaryBtn.setAttribute('aria-expanded', article.classList.contains('expanded'));
        
        // En escritorio: marcar como seleccionado
        if (window.innerWidth >= 1024) {
            document.querySelectorAll('.expense-card').forEach(c => {
                c.classList.remove('selected');
                c.removeAttribute('aria-current'); 
            });
            article.classList.add('selected');
            article.setAttribute('aria-current', 'true'); 
        }
        
        // Cargar detalles si se expande
        if (article.classList.contains('expanded')) {
            await cargarYMostrarDetalles(gasto.id, article, window.innerWidth < 1024);
        }
    });

    return article;
}

async function cargarYMostrarDetalles(id, cardElement, isMobileExpanded) {
    showLoading();
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
    } finally {
        hideLoading();
    }
}

function generarItemsParticipantes(participantes, gastoId = null) {
    return participantes.map(p => {
        const credit = Number(p.creditBalance || p.credit_balance || 0);
        const debit = Number(p.debitBalance || p.debit_balance || 0);
        const deudaNeta = debit - credit;
        
        let infoHtml = '';
        let botonPagarHtml = '';
        
        if (credit > 0.01 && deudaNeta <= 0.01) {
             infoHtml = `<span class="friend-status settled">Pagado (${formatCurrency(credit)})</span>`;
        } else if (deudaNeta > 0.01) {
             infoHtml = `<span class="friend-status pending">Debe ${formatCurrency(deudaNeta)}</span>`;
             
             if (gastoId) {
                 botonPagarHtml = `
                    <button class="btn-pay" 
                            data-expense-id="${gastoId}"
                            data-friend-id="${p.id}"
                            data-friend-name="${p.name.replace(/"/g, '&quot;')}"
                            data-debt-amount="${deudaNeta}">
                        <span aria-hidden="true">💸</span> Pagar
                    </button>`;
             }

        } else {
             infoHtml = `<span class="friend-status settled">Al día</span>`;
        }

        return `
            <li>
                <div class="participant-info">
                    <span class="name">${p.name}</span>
                </div>
                <div style="display:flex; align-items:center;">
                    ${infoHtml}
                    ${botonPagarHtml}
                </div>
            </li>
        `;
    }).join('');
}

function generarHtmlDetalles(id, total, pagado, pendiente, participantes) {
    const listaAmigosHtml = generarItemsParticipantes(participantes, id);
    
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
            <button class="btn-action btn-edit" data-expense-id="${id}">
                <span aria-hidden="true">✏️</span> Editar
            </button>
            <button class="btn-action btn-delete" data-expense-id="${id}">
                <span aria-hidden="true">🗑️</span> Eliminar
            </button>
        </div>
    `;
}

function renderizarPanelEscritorio(gasto, total, pagado, pendiente, participantes) {
    document.getElementById('detail-title').textContent = gasto.description;
    const fechaObj = new Date(gasto.date);
    const timeEl = document.getElementById('detail-date');
    timeEl.textContent = fechaObj.toLocaleDateString('es-ES', { dateStyle: 'long' });
        
    const sub = document.getElementById('detail-subtitle');
    if(sub) sub.textContent = "Detalle del gasto";

    document.getElementById('detail-total').textContent = formatCurrency(total);
    
    const elPaid = document.getElementById('detail-paid');
    const elPending = document.getElementById('detail-pending');
    if(elPaid) elPaid.textContent = formatCurrency(pagado);
    if(elPending) elPending.textContent = formatCurrency(pendiente);
    
    const listaContainer = document.getElementById('detail-participants');
    if(listaContainer) {
        listaContainer.innerHTML = generarItemsParticipantes(participantes, gasto.id);
    }

    const actionsPlaceholder = document.querySelector('.expense-detail-panel .actions-placeholder');
    if(actionsPlaceholder) {
        actionsPlaceholder.innerHTML = `
            <div class="actions-container">
                <button class="btn-action btn-edit" data-expense-id="${gasto.id}">
                    <span aria-hidden="true">✏️</span> Editar
                </button>
                <button class="btn-action btn-delete" data-expense-id="${gasto.id}">
                    <span aria-hidden="true">🗑️</span> Eliminar
                </button>
            </div>
        `;
    }
}

// --- 2. LOGICA DE CREAR Y EDITAR ---
async function crearNuevoGasto() {
    const desc = document.getElementById('add-desc').value;
    const amount = parseFloat(document.getElementById('add-amount').value);
    const date = document.getElementById('add-date').value;

    const checkboxes = document.querySelectorAll('#add-friends-list input[name="friend_ids"]:checked');
    const friendIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    if (friendIds.length === 0) {
        await showMessage("Debes seleccionar al menos un amigo.", "Atención");
        return;
    }

    const nuevoGasto = {
        description: desc,
        amount: amount,
        date: date
    };

    showLoading();
    toggleModalButtons('add-modal', true);

    try {
        const response = await fetch(`${API_URL}/expenses/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoGasto)
        });

        if (!response.ok) {
            await showMessage("Error al crear el gasto.", "Error");
            return;
        }

        const gastoCreado = await response.json();
        const gastoId = gastoCreado.id;

        let todosAsociados = true;
        for (const friendId of friendIds) {
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
            await showMessage("Gasto creado, pero hubo problemas al asociar algunos amigos.", "Aviso");
        }

        document.getElementById('add-modal').close();
        await initDashboard();
        await showMessage("Gasto creado exitosamente.", "Éxito");
    } catch (error) {
        console.error(error);
        await showMessage("Error de conexión con el servidor.", "Error");
    } finally {
        hideLoading();
        toggleModalButtons('add-modal', false);
    }
}

async function abrirModalEdicion(id) {
    showLoading();
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
        await showMessage("Error cargando datos para editar.", "Error");
    }
    finally {
        hideLoading();
        toggleModalButtons('add-modal', false);
    }
}

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
        await showMessage("El gasto debe tener al menos un participante.", "Atención");
        return;
    }

    showLoading();
    toggleModalButtons('edit-modal', true);

    try {
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
            await showMessage("Error al guardar los cambios del gasto.", "Error");
            return;
        }

        const idsAmigosOriginales = new Set(amigosActualesIds);
        const idsAmigosNuevos = new Set(nuevosAmigosIds);
        
        const idsAnadir = [...idsAmigosNuevos].filter(id => !idsAmigosOriginales.has(id));
        const idsQuitar = [...idsAmigosOriginales].filter(id => !idsAmigosNuevos.has(id));
        
        for (const amigoId of idsAnadir) {
            await fetch(`${API_URL}/expenses/${currentEditId}/friends?friend_id=${amigoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        for (const amigoId of idsQuitar) {
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
        
        const tarjetaActualizada = document.getElementById(`gasto-${currentEditId}`);
        
        if (tarjetaActualizada) {
            tarjetaActualizada.classList.add('selected');
            await cargarYMostrarDetalles(currentEditId, tarjetaActualizada, false);
        }
        
        await showMessage("Gasto actualizado correctamente.", "Éxito");
    } catch (error) {
        console.error(error);
        await showMessage("Error de conexión con el servidor.", "Error");
    } finally {
        hideLoading();
        toggleModalButtons('edit-modal', false);
    }
}

async function eliminarGasto(id) {
    const confirmed = await showConfirm("¿Estás seguro de que quieres eliminar este gasto?");
    if(!confirmed) return;

    showLoading();

    try {
        const response = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'DELETE'
        });

        if (response.ok || response.status === 204) {
            document.getElementById('detail-title').textContent = "Selecciona un gasto";
            document.getElementById('detail-date').textContent = "";
            document.getElementById('detail-date').removeAttribute('datetime');
            document.getElementById('detail-total').textContent = "0,00 €";
            document.getElementById('detail-participants').innerHTML = "";
            const placeholder = document.querySelector('.expense-detail-panel .actions-placeholder');
            if(placeholder) placeholder.innerHTML = '<p class="text-muted">Selecciona un gasto...</p>';
            
            await initDashboard();
            await showMessage("Gasto eliminado correctamente.", "Éxito");
        } else {
            await showMessage("Error al eliminar el gasto.", "Error");
        }
    } catch (error) {
        console.error(error);
        await showMessage("Error de conexión con el servidor.", "Error");
    } finally {
        hideLoading();
    }
}

function abrirModalAporte(gastoId, amigoId, nombreAmigo, deudaActual) {
    currentContributionData = { gastoId, amigoId };
    
    const inputAmount = document.getElementById('contribution-amount');
    const labelMax = document.getElementById('max-contribution');
    const subtitle = document.getElementById('contribution-subtitle');
    
    subtitle.textContent = `Aporte de ${nombreAmigo}`;
    labelMax.textContent = deudaActual.toFixed(2);
    
    inputAmount.value = deudaActual.toFixed(2);
    inputAmount.max = deudaActual.toFixed(2);
    
    document.getElementById('contribution-modal').showModal();
}

async function guardarAporte() {
    if (!currentContributionData) return;
    
    const amount = parseFloat(document.getElementById('contribution-amount').value);
    
    if (isNaN(amount) || amount <= 0) {
        await showMessage("Introduce una cantidad válida", "Atención");
        return;
    }

    showLoading();
    
    try {
        const { gastoId, amigoId } = currentContributionData;
        
        const url = `${API_URL}/expenses/${gastoId}/friends/${amigoId}?amount=${amount}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errTxt = await response.text();
            throw new Error(errTxt || "Error al registrar el aporte");
        }

        document.getElementById('contribution-modal').close();
        currentContributionData = null;
        
        await initDashboard();
        
        const tarjeta = document.getElementById(`gasto-${gastoId}`);
        if(tarjeta) {
            const esMovilExpandido = tarjeta.classList.contains('expanded');
            await cargarYMostrarDetalles(gastoId, tarjeta, esMovilExpandido);
        }
        
        await showMessage("Pago registrado correctamente.", "Éxito");
    } catch (error) {
        console.error(error);
        await showMessage("Error al conectar con el servidor: " + error.message, "Error");
    } finally {
        hideLoading();
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
                label.textContent = "Debes";
            } else {
                card.classList.add('negative');
                label.textContent = "Te deben";
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
    if (t.includes('regalo')) return '🎁';
    if (t.includes('gasolina') || t.includes('coche')) return '⛽';
    if (t.includes('hotel') || t.includes('alojamiento') || t.includes('casa')) return '🏨';
    return '💸';
}

function setupNavigation() {
    const btnExpenses = document.getElementById('nav-expenses');
    const btnFriends = document.getElementById('nav-friends');
    
    const viewExpenses = document.getElementById('view-expenses');
    const viewFriends = document.getElementById('view-friends');
    const panelExpenses = document.getElementById('panel-expenses');
    const panelFriends = document.getElementById('panel-friends');
    const fabBtn = document.getElementById('btn-add-expense');

    btnExpenses.addEventListener('click', () => {
        btnExpenses.classList.add('active');
        btnFriends.classList.remove('active');
        
        btnExpenses.setAttribute('aria-selected', 'true');
        btnFriends.setAttribute('aria-selected', 'false');
        
        viewExpenses.classList.remove('hidden');
        viewFriends.classList.add('hidden');
        panelExpenses.classList.remove('hidden');
        panelFriends.classList.add('hidden');
        
        if(fabBtn) fabBtn.style.display = 'flex'; 
    });

    btnFriends.addEventListener('click', () => {
        btnFriends.classList.add('active');
        btnExpenses.classList.remove('active');
        
        btnFriends.setAttribute('aria-selected', 'true');
        btnExpenses.setAttribute('aria-selected', 'false');
        
        viewExpenses.classList.add('hidden');
        viewFriends.classList.remove('hidden');
        panelExpenses.classList.add('hidden');
        panelFriends.classList.remove('hidden');
        
        if(fabBtn) fabBtn.style.display = 'none'; 
        
        cargarListaAmigos(); 
    });
}

async function cargarListaAmigos() {
    const contenedor = document.getElementById('friends-list');
    contenedor.innerHTML = '<p class="text-muted">Cargando...</p>';

    try {
        const response = await fetch(`${API_URL}/friends`);
        const amigos = await response.json();

        contenedor.innerHTML = '';
        if (amigos.length === 0) {
            contenedor.innerHTML = '<p class="text-muted">No hay amigos.</p>';
            return;
        }

        amigos.forEach(amigo => {
            contenedor.appendChild(crearTarjetaAmigo(amigo));
        });

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p class="text-danger">Error al cargar.</p>';
    }
}

function crearTarjetaAmigo(amigo) {
    const article = document.createElement('article');
    article.className = 'expense-card'; 
    article.id = `amigo-${amigo.id}`;

    const credit = Number(amigo.creditBalance || amigo.credit_balance || 0);
    const debit = Number(amigo.debitBalance || amigo.debit_balance || 0);
    const balance = credit - debit;

    let balanceHtml = balance > 0 ? `+${formatCurrency(balance)}` : `${formatCurrency(balance)}`;
    let colorStyle = balance >= 0 ? 'var(--success)' : 'var(--danger)';
    
    if(Math.abs(balance) < 0.01) {
        balanceHtml = "0,00 €";
        colorStyle = "var(--text-muted)";
    }

    article.innerHTML = `
        <button class="card-summary" aria-expanded="false" aria-controls="mobile-details-${amigo.id}">
            <div class="friend-icon" aria-hidden="true">👤</div>
            <div class="expense-details">
                <h3>${amigo.name}</h3>
            </div>
            <div class="expense-amount">
                <span class="price" style="color: ${colorStyle}">${balanceHtml}</span>
                <span class="status settled">Ver gastos</span>
            </div>
            <span class="expand-icon" aria-hidden="true">▶</span>
        </button>

        <section class="card-details mobile-only" id="mobile-details-${amigo.id}">
            <div class="loading-spinner">Cargando historial...</div>
        </section>
    `;

    const summaryBtn = article.querySelector('.card-summary');
    
    summaryBtn.addEventListener('click', async () => {
        const isExpanded = article.classList.contains('expanded');
        
        // Cerrar otros amigos expandidos
        document.querySelectorAll('#friends-list .expense-card.expanded').forEach(card => {
            if (card !== article) {
                card.classList.remove('expanded');
                const btn = card.querySelector('.card-summary');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Alternar estado
        article.classList.toggle('expanded');
        summaryBtn.setAttribute('aria-expanded', article.classList.contains('expanded'));
        
        // En escritorio: marcar como seleccionado
        if (window.innerWidth >= 1024) {
            document.querySelectorAll('#friends-list .expense-card').forEach(c => c.classList.remove('selected'));
            article.classList.add('selected');
        }
        
        // Cargar detalles si se expande
        if (article.classList.contains('expanded')) {
            await cargarDetalleAmigo(amigo, article, true);
        }
    });

    return article;
}

async function cargarDetalleAmigo(amigo, cardElement, isMobileExpanded) {
    document.getElementById('friend-detail-name').textContent = amigo.name;
    const credit = Number(amigo.creditBalance || amigo.credit_balance || 0);
    const debit = Number(amigo.debitBalance || amigo.debit_balance || 0);
    const balanceTotal = credit - debit;
    
    const elBal = document.getElementById('friend-detail-balance');
    if(elBal) {
        elBal.textContent = formatCurrency(Math.abs(balanceTotal));
        const label = elBal.parentElement.querySelector('.label');
        
        if (balanceTotal >= 0) {
            elBal.className = 'value large text-success';
            if(label) label.textContent = "Le deben";
        } else {
            elBal.className = 'value large text-danger';
            if(label) label.textContent = "Debe";
        }
    }

    const listContainerPC = document.getElementById('friend-detail-expenses');
    if(listContainerPC) listContainerPC.innerHTML = '<li class="text-muted">Analizando participación...</li>';

    try {
        let gastosCandidatos = [];
        if (listaGastosCache && listaGastosCache.length > 0) {
            gastosCandidatos = listaGastosCache; 
        } else {
            const res = await fetch(`${API_URL}/expenses`);
            if(!res.ok) throw new Error("Error fetching expenses");
            gastosCandidatos = await res.json();
            listaGastosCache = gastosCandidatos;
        }

        const ultimosGastos = gastosCandidatos
            .sort((a,b) => new Date(b.date) - new Date(a.date))
            .slice(0, 20);

        const promesas = ultimosGastos.map(async (g) => {
            try {
                const r = await fetch(`${API_URL}/expenses/${g.id}/friends`);
                const participantes = await r.json();
                
                const yo = participantes.find(p => p.id === amigo.id);
                
                if (yo) {
                    const debe = Number(yo.debitBalance || yo.debit_balance || 0);
                    const pago = Number(yo.creditBalance || yo.credit_balance || 0);
                    
                    return { 
                        ...g, 
                        miSaldoNeto: debe - pago 
                    };
                }
                return null;
            } catch { return null; }
        });

        const resultados = await Promise.all(promesas);
        const gastosDondeParticipa = resultados.filter(g => g !== null);

        let listaHtml = '';
        
        if (gastosDondeParticipa.length === 0) {
            listaHtml = '<li class="text-muted">No participa en gastos recientes.</li>';
        } else {
            listaHtml = gastosDondeParticipa.map(g => {
                let textoEstado = '';
                let claseColor = 'text-muted';
                
                if (g.miSaldoNeto > 0.01) {
                    textoEstado = `Debes ${formatCurrency(g.miSaldoNeto)}`;
                    claseColor = 'text-danger';
                } else if (g.miSaldoNeto < -0.01) {
                    textoEstado = `Te deben ${formatCurrency(Math.abs(g.miSaldoNeto))}`;
                    claseColor = 'text-success';
                } else {
                    textoEstado = 'Saldado';
                }

                return `
                <li style="display:flex; justify-content:space-between; align-items:center; padding: 10px 0; border-bottom: 1px dashed #eee;">
                    <div class="participant-info">
                        <span class="name" style="font-weight:600; color:var(--text-main);">${g.description}</span>
                        <div style="display:flex; gap: 8px; align-items:center; margin-top:4px;">
                            <small style="color:#999; font-size:0.8rem;">
                                ${new Date(g.date).toLocaleDateString()}
                            </small>
                            <span style="font-size:0.85rem; font-weight:bold;" class="${claseColor}">
                                ${textoEstado}
                            </span>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <button class="btn-view-detail" data-expense-id="${g.id}">
                            <span aria-hidden="true">👁️</span> Ver
                        </button>
                    </div>
                </li>`;
            }).join('');
        }
        if(listContainerPC) listContainerPC.innerHTML = listaHtml;

        if (isMobileExpanded && cardElement) {
            const detailsContainer = cardElement.querySelector('.card-details');
            detailsContainer.innerHTML = `
                <div class="participants-section" style="padding-top:0;">
                    <h4 style="margin-bottom:10px;">Historial de Gastos</h4>
                    <ul class="participants-list">
                        ${listaHtml}
                    </ul>
                </div>
            `;
        }

    } catch (e) {
        console.error(e);
        if(listContainerPC) listContainerPC.innerHTML = '<li class="text-danger">Error al cargar datos.</li>';
    }
}

function irAVerGasto(idGasto) {
    const btnExpenses = document.getElementById('nav-expenses');
    const btnFriends = document.getElementById('nav-friends');
    const viewExpenses = document.getElementById('view-expenses');
    const viewFriends = document.getElementById('view-friends');
    const panelExpenses = document.getElementById('panel-expenses');
    const panelFriends = document.getElementById('panel-friends');
    const fabBtn = document.getElementById('btn-add-expense');

    if(btnExpenses && btnFriends) {
        btnExpenses.classList.add('active');
        btnFriends.classList.remove('active');
        
        viewExpenses.classList.remove('hidden');
        viewFriends.classList.add('hidden');
        panelExpenses.classList.remove('hidden');
        panelFriends.classList.add('hidden');
        if(fabBtn) fabBtn.style.display = 'flex';
    }

    setTimeout(() => {
        const tarjeta = document.getElementById(`gasto-${idGasto}`);
        if (tarjeta) {
            tarjeta.scrollIntoView({ behavior: 'smooth', block: 'center' });
            tarjeta.classList.add('expanded');
            const btn = tarjeta.querySelector('.card-summary');
            if(btn) btn.setAttribute('aria-expanded', 'true');
            cargarYMostrarDetalles(idGasto, tarjeta, window.innerWidth < 1024);
        }
    }, 100);
}
