const ESTADOS_PRODUCAO = new Set(['EM_ANALISE', 'EM_MODELAGEM', 'EM_CORRECAO', 'USINAGEM']);

function authFetch(url) {
    return fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
}

async function carregarDashboard() {
    const [resUsuarios, resPedidos] = await Promise.allSettled([
    authFetch('/usuarios'),
    authFetch('/pedidos'),
]);

    if (resUsuarios.status === 'fulfilled' && resUsuarios.value.ok) {
        const lista = await resUsuarios.value.json();
        document.getElementById('totalUsuarios').textContent = lista.length;
    } else {
        document.getElementById('totalUsuarios').textContent = '—';
    }

    if (resPedidos.status === 'fulfilled' && resPedidos.value.ok) {
        const lista = await resPedidos.value.json();
        document.getElementById('totalPedidos').textContent = lista.length;
        document.getElementById('pedidosProducao').textContent =
            lista.filter(p => ESTADOS_PRODUCAO.has(p.estado)).length;
        document.getElementById('pedidosConcluidos').textContent =
            lista.filter(p => p.estado === 'FINALIZADO').length;
    } else {
        document.getElementById('totalPedidos').textContent    = '—';
        document.getElementById('pedidosProducao').textContent = '—';
        document.getElementById('pedidosConcluidos').textContent = '—';
    }
}

carregarDashboard();
