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

// Classe CSS para badge de estado
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

// ── Grupos de estado para cards de estatística ───────────────────────────
const ESTADOS_AGUARDANDO = new Set([
    'AGUARDANDO_TRIAGEM',
    'AGUARDANDO_INFORMACOES',
    'AGUARDANDO_APROVACAO_DESIGN',
]);
const ESTADOS_PRODUCAO = new Set([
    'EM_ANALISE',
    'EM_MODELAGEM',
    'EM_CORRECAO',
    'USINAGEM',
]);

// ── Estado ────────────────────────────────────────────────────────────────
let intervalId = null;
const POLLING_INTERVALO_MS = 30_000; // 30 segundos

// ── Helpers ───────────────────────────────────────────────────────────────
function formatarData(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
}

function formatarHora(date) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── Renderização ──────────────────────────────────────────────────────────
function atualizarCards(pedidos) {
    document.getElementById('statTotal').textContent     = pedidos.length;
    document.getElementById('statAguardando').textContent =
        pedidos.filter(p => ESTADOS_AGUARDANDO.has(p.estado)).length;
    document.getElementById('statProducao').textContent  =
        pedidos.filter(p => ESTADOS_PRODUCAO.has(p.estado)).length;
    document.getElementById('statFinalizado').textContent =
        pedidos.filter(p => p.estado === 'FINALIZADO').length;
}

function renderizarTabela(pedidos) {
    const corpo     = document.getElementById('corpo');
    const vazio     = document.getElementById('vazio');
    const tabela    = document.getElementById('tabela');
    const carregando = document.getElementById('carregando');

    carregando.style.display = 'none';

    if (pedidos.length === 0) {
        tabela.style.display = 'none';
        vazio.style.display  = 'block';
        return;
    }

    tabela.style.display = '';
    vazio.style.display  = 'none';

    // Mostra os 10 mais recentes (por ID desc)
    const recentes = [...pedidos]
        .sort((a, b) => b.id - a.id)
        .slice(0, 10);

    corpo.innerHTML = '';
    recentes.forEach(p => {
        const tr = document.createElement('tr');
        const badgeClasse = ESTADO_CLASSE[p.estado] ?? '';
        const urgente = p.prioridade === 'URGENTE';
        tr.innerHTML = `
            <td>${TIPO_PROTESE_LABEL[p.tipoProtese] ?? p.tipoProtese}</td>
            <td>${MATERIAL_LABEL[p.material] ?? p.material}</td>
            <td><span class="badge ${urgente ? 'badge--urgente' : 'badge--normal'}">${PRIORIDADE_LABEL[p.prioridade] ?? p.prioridade}</span></td>
            <td><span class="badge ${badgeClasse}">${ESTADO_LABEL[p.estado] ?? p.estado}</span></td>
            <td>${formatarData(p.prazoEntrega)}</td>
            <td class="acoes">
                <button class="btn-editar" onclick="window.location.href='/editar-pedido/${p.id}'">Ver</button>
            </td>
        `;
        corpo.appendChild(tr);
    });
}

function atualizarHoraPolling() {
    document.getElementById('ultimaAtualizacao').textContent = formatarHora(new Date());
}

// ── Carga de dados ────────────────────────────────────────────────────────
async function carregarDados() {
    const dentistaId = localStorage.getItem('id');
    if (!dentistaId) {
        console.warn('ID do dentista não encontrado no localStorage.');
        return;
    }

    try {
        const res = await authFetch(`/pedidos/dentista/${dentistaId}`);
        if (!res || !res.ok) throw new Error('Resposta inválida');

        const pedidos = await res.json();
        atualizarCards(pedidos);
        renderizarTabela(pedidos);
        atualizarHoraPolling();
    } catch (err) {
        console.error('Erro ao carregar pedidos do dentista:', err);
        document.getElementById('carregando').textContent = 'Erro ao carregar pedidos. Tentando novamente...';
    }
}

// ── Inicialização ─────────────────────────────────────────────────────────
function inicializar() {
    // Preenche o nome do usuário logado
    const nome = localStorage.getItem('nome');
    if (nome) document.getElementById('nomeUsuario').textContent = nome;

    // Primeira carga
    carregarDados();

    // Polling a cada 30 segundos
    intervalId = setInterval(carregarDados, POLLING_INTERVALO_MS);
}

// Para o polling ao sair da página (evita requisições desnecessárias)
window.addEventListener('beforeunload', () => {
    if (intervalId) clearInterval(intervalId);
});

inicializar();
