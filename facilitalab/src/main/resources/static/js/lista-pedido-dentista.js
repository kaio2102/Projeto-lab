// ── Labels ────────────────────────────────────────────────────────────────
const TIPO_PROTESE_LABEL = {
    COROA:      'Coroa',
    PONTE:      'Ponte',
    IMPLANTE:   'Implante',
    PROVISORIO: 'Provisório',
    FACETA:     'Faceta',
    INLAY:      'Inlay',
};

const MATERIAL_LABEL = {
    ZIRCONIA: 'Zircônia',
    RESINA:   'Resina',
    METAL:    'Metal',
    CERAMICA: 'Cerâmica',
};

const ESTADO_LABEL = {
    AGUARDANDO_TRIAGEM:          'Aguardando Triagem',
    AGUARDANDO_INFORMACOES:      'Aguardando Informações',
    AGUARDANDO_APROVACAO_DESIGN: 'Aguardando Aprovação',
    EM_ANALISE:                  'Em Análise',
    EM_MODELAGEM:                'Em Modelagem',
    EM_CORRECAO:                 'Em Correção',
    USINAGEM:                    'Usinagem',
    FINALIZADO:                  'Finalizado',
    CANCELADO:                   'Cancelado',
};

const ESTADO_CLASSE = {
    AGUARDANDO_TRIAGEM:          'badge--triagem',
    AGUARDANDO_INFORMACOES:      'badge--info',
    AGUARDANDO_APROVACAO_DESIGN: 'badge--aprovacao',
    EM_ANALISE:                  'badge--analise',
    EM_MODELAGEM:                'badge--modelagem',
    EM_CORRECAO:                 'badge--correcao',
    USINAGEM:                    'badge--usinagem',
    FINALIZADO:                  'badge--finalizado',
    CANCELADO:                   'badge--cancelado',
};

const PRIORIDADE_LABEL = { URGENTE: 'Urgente', NORMAL: 'Normal' };

// ── Estado local ──────────────────────────────────────────────────────────
let todosPedidos = [];
let intervalId   = null;
const POLLING_INTERVALO_MS = 30_000;

// ── Helpers ───────────────────────────────────────────────────────────────
function formatarData(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
}

// ── Ordenação ─────────────────────────────────────────────────────────────
function ordenar(lista, criterio) {
    const copia = [...lista];
    switch (criterio) {
        case 'recente':
            return copia.sort((a, b) => b.id - a.id);
        case 'antigo':
            return copia.sort((a, b) => a.id - b.id);
        case 'prazo':
            return copia.sort((a, b) => {
                if (!a.prazoEntrega) return 1;
                if (!b.prazoEntrega) return -1;
                return a.prazoEntrega.localeCompare(b.prazoEntrega);
            });
        case 'urgente':
            return copia.sort((a, b) => {
                if (a.prioridade === 'URGENTE' && b.prioridade !== 'URGENTE') return -1;
                if (a.prioridade !== 'URGENTE' && b.prioridade === 'URGENTE') return 1;
                return 0;
            });
        default:
            return copia;
    }
}

// ── Renderização ──────────────────────────────────────────────────────────
function renderizar() {
    const estadoFiltro = document.querySelector('.filtro-btn.active')?.dataset.estado ?? '';
    const criterio     = document.getElementById('selectOrdem').value;

    const corpo      = document.getElementById('corpo');
    const vazio      = document.getElementById('vazio');
    const tabela     = document.getElementById('tabela');
    const carregando = document.getElementById('carregando');
    const contador   = document.getElementById('contadorPedidos');

    carregando.style.display = 'none';

    let lista = estadoFiltro
        ? todosPedidos.filter(p => p.estado === estadoFiltro)
        : todosPedidos;

    lista = ordenar(lista, criterio);
    contador.textContent = `${lista.length} pedido${lista.length !== 1 ? 's' : ''}`;

    corpo.innerHTML = '';

    if (lista.length === 0) {
        tabela.style.display = 'none';
        vazio.style.display  = 'block';
        return;
    }

    tabela.style.display = '';
    vazio.style.display  = 'none';

    lista.forEach(p => {
        const tr = document.createElement('tr');
        const badgeClasse = ESTADO_CLASSE[p.estado] ?? '';
        const urgente     = p.prioridade === 'URGENTE';
        tr.innerHTML = `
            <td>${TIPO_PROTESE_LABEL[p.tipoProtese] ?? p.tipoProtese}</td>
            <td>${p.cor ?? '—'}</td>
            <td>${MATERIAL_LABEL[p.material] ?? p.material}</td>
            <td><span class="badge ${urgente ? 'badge--urgente' : 'badge--normal'}">${PRIORIDADE_LABEL[p.prioridade] ?? p.prioridade}</span></td>
            <td><span class="badge ${badgeClasse}">${ESTADO_LABEL[p.estado] ?? p.estado}</span></td>
            <td>${formatarData(p.prazoEntrega)}</td>
            <td class="acoes">
                <button class="btn-editar" onclick="window.location.href='/editar-pedido/${p.id}'">Ver / Editar</button>
            </td>
        `;
        corpo.appendChild(tr);
    });
}

// ── Carga de dados ────────────────────────────────────────────────────────
async function carregarPedidos() {
    const dentistaId = localStorage.getItem('id');
    if (!dentistaId) {
        document.getElementById('carregando').textContent = 'Sessão inválida. Faça login novamente.';
        return;
    }

    try {
        const res = await authFetch(`/pedidos/dentista/${dentistaId}`);
        if (!res || !res.ok) throw new Error('Falha na requisição');

        todosPedidos = await res.json();
        renderizar();
        document.getElementById('ultimaAtualizacao').textContent =
            new Date().toLocaleTimeString('pt-BR');
    } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
        document.getElementById('carregando').textContent =
            'Erro ao carregar pedidos. Tentando novamente em 30s...';
    }
}

// ── Inicialização ─────────────────────────────────────────────────────────
function inicializar() {
    // Filtros de estado
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderizar();
        });
    });

    // Ordenação
    document.getElementById('selectOrdem').addEventListener('change', renderizar);

    // Carga inicial + polling
    carregarPedidos();
    intervalId = setInterval(carregarPedidos, POLLING_INTERVALO_MS);
}

window.addEventListener('beforeunload', () => {
    if (intervalId) clearInterval(intervalId);
});

inicializar();
