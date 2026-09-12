// ── Labels ────────────────────────────────────────────────────────────────
const TIPO_PROTESE_LABEL = {
    COROA: 'Coroa', PONTE: 'Ponte', IMPLANTE: 'Implante',
    PROVISORIO: 'Provisório', FACETA: 'Faceta', INLAY: 'Inlay',
};
const MATERIAL_LABEL = {
    ZIRCONIA: 'Zircônia', RESINA: 'Resina', METAL: 'Metal', CERAMICA: 'Cerâmica',
};
const ESTADO_LABEL = {
    AGUARDANDO_TRIAGEM: 'Aguardando Triagem',
    AGUARDANDO_INFORMACOES: 'Aguardando Informações',
    AGUARDANDO_APROVACAO_DESIGN: 'Aguardando Aprovação',
    EM_ANALISE: 'Em Análise', EM_MODELAGEM: 'Em Modelagem',
    EM_CORRECAO: 'Em Correção', USINAGEM: 'Usinagem',
    FINALIZADO: 'Finalizado', CANCELADO: 'Cancelado',
};
const ESTADO_CLASSE = {
    AGUARDANDO_TRIAGEM: 'badge--triagem', AGUARDANDO_INFORMACOES: 'badge--info',
    AGUARDANDO_APROVACAO_DESIGN: 'badge--aprovacao', EM_ANALISE: 'badge--analise',
    EM_MODELAGEM: 'badge--modelagem', EM_CORRECAO: 'badge--correcao',
    USINAGEM: 'badge--usinagem', FINALIZADO: 'badge--finalizado', CANCELADO: 'badge--cancelado',
};

// ── Estado local ──────────────────────────────────────────────────────────
let todosPedidos = [];
let intervalId   = null;

// ── Helpers ───────────────────────────────────────────────────────────────
function formatarData(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
}

function diasParaVencer(dateStr) {
    if (!dateStr) return null;
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    return Math.ceil((new Date(dateStr + 'T00:00:00') - hoje) / (1000 * 60 * 60 * 24));
}

function prazoComAlerta(dateStr) {
    const dias = diasParaVencer(dateStr);
    if (dias === null) return '—';
    const label = formatarData(dateStr);
    if (dias < 0)  return `<span class="prazo-vencido">${label}</span>`;
    if (dias <= 2) return `<span class="prazo-critico">${label} (${dias}d)</span>`;
    if (dias <= 5) return `<span class="prazo-atencao">${label} (${dias}d)</span>`;
    return label;
}

// ── Ordenação ─────────────────────────────────────────────────────────────
function ordenar(lista, criterio) {
    const c = [...lista];
    switch (criterio) {
        case 'recente':
            return c.sort((a, b) => {
                if (!a.dataCriacao && !b.dataCriacao) return b.id - a.id;
                if (!a.dataCriacao) return 1;
                if (!b.dataCriacao) return -1;
                return new Date(b.dataCriacao) - new Date(a.dataCriacao);
            });
        case 'antigo':
            return c.sort((a, b) => {
                if (!a.dataCriacao && !b.dataCriacao) return a.id - b.id;
                if (!a.dataCriacao) return 1;
                if (!b.dataCriacao) return -1;
                return new Date(a.dataCriacao) - new Date(b.dataCriacao);
            });
        case 'prazo':
            return c.sort((a, b) => {
                const da = diasParaVencer(a.prazoEntrega) ?? 9999;
                const db = diasParaVencer(b.prazoEntrega) ?? 9999;
                return da - db;
            });
        case 'urgente':
            return c.sort((a, b) => {
                if (a.prioridade === 'URGENTE' && b.prioridade !== 'URGENTE') return -1;
                if (a.prioridade !== 'URGENTE' && b.prioridade === 'URGENTE') return 1;
                const da = diasParaVencer(a.prazoEntrega) ?? 9999;
                const db = diasParaVencer(b.prazoEntrega) ?? 9999;
                return da - db;
            });
        default:
            return c;
    }
}

// ── Renderização ──────────────────────────────────────────────────────────
function renderizar() {
    const estadoFiltro  = document.querySelector('.filtro-btn.active')?.dataset.estado ?? '';
    const soUrgente     = document.getElementById('checkUrgente').checked;
    const criterio      = document.getElementById('selectOrdem').value;

    const corpo      = document.getElementById('corpo');
    const vazio      = document.getElementById('vazio');
    const tabela     = document.getElementById('tabela');
    const carregando = document.getElementById('carregando');
    const contador   = document.getElementById('contadorPedidos');

    carregando.style.display = 'none';

    let lista = estadoFiltro
        ? todosPedidos.filter(p => p.estado === estadoFiltro)
        : todosPedidos;

    if (soUrgente) lista = lista.filter(p => p.prioridade === 'URGENTE');

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
        const urgente = p.prioridade === 'URGENTE';
        const tr = document.createElement('tr');
        if (urgente) tr.classList.add('linha-urgente');
        tr.innerHTML = `
            <td>${TIPO_PROTESE_LABEL[p.tipoProtese] ?? p.tipoProtese}</td>
            <td>${p.cor ?? '—'}</td>
            <td>${MATERIAL_LABEL[p.material] ?? p.material}</td>
            <td>${p.nomeDentista ?? '—'}</td>
            <td><span class="badge ${urgente ? 'badge--urgente' : 'badge--normal'}">${urgente ? 'Urgente' : 'Normal'}</span></td>
            <td><span class="badge ${ESTADO_CLASSE[p.estado] ?? ''}">${ESTADO_LABEL[p.estado] ?? p.estado}</span></td>
            <td>${prazoComAlerta(p.prazoEntrega)}</td>
            <td class="acoes">
                <button class="btn-editar" onclick="window.location.href='/editar-pedido/${p.id}'">Editar</button>
                <button class="btn-deletar" onclick="deletar(${p.id}, this)">Excluir</button>
            </td>`;
        corpo.appendChild(tr);
    });
}

// ── Excluir ───────────────────────────────────────────────────────────────
async function deletar(id, btn) {
    if (!confirm('Deseja realmente excluir este pedido?')) return;
    btn.disabled = true; btn.textContent = '...';
    try {
        const res = await authFetch(`/pedidos/${id}`, { method: 'DELETE' });
        if (res.status === 204) {
            todosPedidos = todosPedidos.filter(p => p.id !== id);
            renderizar();
        } else {
            alert('Erro ao excluir pedido.');
            btn.disabled = false; btn.textContent = 'Excluir';
        }
    } catch {
        alert('Não foi possível conectar ao servidor.');
        btn.disabled = false; btn.textContent = 'Excluir';
    }
}

// ── Carga de dados ────────────────────────────────────────────────────────
async function carregarPedidos() {
    try {
        const res = await authFetch('/pedidos');
        if (!res || !res.ok) throw new Error();
        todosPedidos = await res.json();
        renderizar();
        document.getElementById('ultimaAtualizacao').textContent =
            new Date().toLocaleTimeString('pt-BR');
    } catch {
        document.getElementById('carregando').textContent =
            'Erro ao carregar pedidos. Tentando novamente em 30s...';
    }
}

// ── Inicialização ─────────────────────────────────────────────────────────
function inicializar() {
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderizar();
        });
    });

    document.getElementById('selectOrdem').addEventListener('change', renderizar);
    document.getElementById('checkUrgente').addEventListener('change', renderizar);

    carregarPedidos();
    intervalId = setInterval(carregarPedidos, 30_000);
}

window.addEventListener('beforeunload', () => clearInterval(intervalId));
inicializar();
