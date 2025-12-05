// js/main.js

const API_URL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
    cargarListaGastos();
    
    // Listener para el botón de añadir
    document.getElementById('btn-add-expense').addEventListener('click', async () => {
        const nuevoGasto = {
            description: "Gasto de prueba Web",
            amount: 15.50,
            date: new Date().toISOString().split('T')[0],
            friend_ids: [1, 2] 
        };
        await crearGasto(nuevoGasto);
    });
});

// VER LISTA DE GASTOS
async function cargarListaGastos() {
    try {
        const response = await fetch(`${API_URL}/expenses`);
        if (!response.ok) throw new Error('Error al cargar gastos');
        
        const gastos = await response.json();
        
        renderizarLista(gastos);
        
        actualizarResumen(gastos); 
        
    } catch (error) {
        console.error(error);
        document.getElementById('expenses-list').innerHTML = '<p class="error">Error de conexión</p>';
    }
}

function actualizarResumen(gastos) {
    const total = gastos.reduce((acc, gasto) => acc + gasto.amount, 0);
    
    const totalElement = document.getElementById('dashboard-total');
    const balanceElement = document.getElementById('dashboard-balance');

    if(totalElement) totalElement.textContent = `${total.toFixed(2)} €`;
    
    if(balanceElement) {
        balanceElement.textContent = `${balance.toFixed(2)} €`;
        
        if (balance > 0) {
            balanceElement.parentElement.classList.remove('negative');
            balanceElement.parentElement.classList.add('positive');
        }
    }
}

function renderizarLista(gastos) {
    const contenedor = document.getElementById('expenses-list');
    contenedor.innerHTML = ''; // Limpiar lista

    gastos.forEach(gasto => {
        // Crear la tarjeta HTML
        const card = document.createElement('article');
        card.className = 'expense-card';
        card.innerHTML = `
            <div class="expense-info">
                <h3>${gasto.description}</h3>
                <div class="expense-meta">${gasto.date || 'Sin fecha'}</div>
            </div>
            <div class="expense-amount">${gasto.amount.toFixed(2)}€</div>
        `;

        // Click para ver detalles
        card.addEventListener('click', () => {
            // Quitar clase selected de otros
            document.querySelectorAll('.expense-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            cargarDetalleGasto(gasto.id);
        });

        contenedor.appendChild(card);
    });
}

// VER DETALLES DE UN GASTO
async function cargarDetalleGasto(id) {
    try {
        // Pedimos el gasto
        const responseGasto = await fetch(`${API_URL}/expenses/${id}`);
        const gasto = await responseGasto.json();

        // Pedimos los participantes
        const responseAmigos = await fetch(`${API_URL}/expenses/${id}/friends`);
        const participantes = await responseAmigos.json();

        // Actualizar UI
        document.getElementById('detail-title').textContent = gasto.description;
        document.getElementById('detail-subtitle').textContent = `ID: ${gasto.id}`;
        document.getElementById('detail-total').textContent = `${gasto.amount.toFixed(2)}€`;
        document.getElementById('detail-date').textContent = gasto.date || '--';

        // Renderizar participantes
        const listaPart = document.getElementById('detail-participants');
        listaPart.innerHTML = '';
        
        participantes.forEach(p => {
            const li = document.createElement('li');
            li.className = 'participant-item';
            
            // Calculamos estado
            const balance = p.creditBalance - p.debitBalance; 
            let estadoHTML = '';
            
            if (balance > 0) {
                estadoHTML = `<span class="participant-status success">Pagó: ${p.creditBalance.toFixed(2)}€</span>`;
            } else if (p.debitBalance > 0) {
                estadoHTML = `<span class="participant-status danger">Debe: ${p.debitBalance.toFixed(2)}€</span>`;
            } else {
                estadoHTML = `<span class="participant-status">Sin deuda</span>`;
            }

            li.innerHTML = `
                <div class="participant-info">
                    <span class="participant-name">${p.name}</span>
                    ${estadoHTML}
                </div>
            `;
            listaPart.appendChild(li);
        });

    } catch (error) {
        console.error("Error cargando detalle", error);
    }
}

// AÑADIR GASTO
async function crearGasto(datosGasto) {
    try {
        const response = await fetch(`${API_URL}/expenses/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosGasto)
        });

        if (response.ok) {
            alert('Gasto creado correctamente');
            cargarListaGastos(); // Recargar la lista
        } else {
            alert('Error al crear gasto');
        }
    } catch (error) {
        console.error("Error al crear:", error);
    }
}