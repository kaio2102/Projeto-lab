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

const ESTADOS_PRODUCAO = new Set(['EM_ANALISE', 'EM_MODELAGEM', 'EM_CORRECAO', 'USINAGEM']);

// ── Helpers ───────────────────────────────────────────────────────────────
function formatarData(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function diasParaVencer(dateStr) {
    if (!dateStr) return null;
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const prazo = new Date(dateStr + 'T00:00:00');
    return Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
}

function prazoComAlerta(dateStr) {
    const dias = diasParaVencer(dateStr);
    if (dias === null) return '—';
    const label = formatarData(dateStr);
    if (dias < 0)  return `<span class="prazo-vencido">${label} (vencido)</span>`;
    if (dias <= 2) return `<span class="prazo-critico">${label} (${dias}d)</span>`;
    if (dias <= 5) return `<span class="prazo-atencao">${label} (${dias}d)</span>`;
    return label;
}

// ── Cards de estatística ──────────────────────────────────────────────────
function atualizarCards(pedidos) {
    document.getElementById('statTriagem').textContent =
        pedidos.filter(p => p.estado === 'AGUARDANDO_TRIAGEM').length;
    document.getElementById('statUrgentes').textContent =
        pedidos.filter(p => p.prioridade === 'URGENTE').length;
    document.getElementById('statProducao').textContent =
        pedidos.filter(p => ESTADOS_PRODUCAO.has(p.estado)).length;
    document.getElementById('statFinalizado').textContent =
        pedidos.filter(p => p.estado === 'FINALIZADO').length;
}

// ── Alertas de prazo ──────────────────────────────────────────────────────
function renderizarAlertas(pedidos) {
    const vencidos = pedidos.filter(p => {
        const dias = diasParaVencer(p.prazoEntrega);
        return dias !== null && dias < 0 && p.estado !== 'FINALIZADO' && p.estado !== 'CANCELADO';
    });
    const criticos = pedidos.filter(p => {
        const dias = diasParaVencer(p.prazoEntrega);
        return dias !== null && dias >= 0 && dias <= 2 && p.estado !== 'FINALIZADO' && p.estado !== 'CANCELADO';
    });

    const container = document.getElementById('alertas');
    container.innerHTML = '';

    if (vencidos.length > 0) {
        container.innerHTML += `
            <div class="alerta alerta--erro">
                🚫 <strong>${vencidos.length} pedido${vencidos.length > 1 ? 's' : ''} com prazo vencido</strong>
                — verifique a lista completa e entre em contato com o dentista.
            </div>`;
    }
    if (criticos.length > 0) {
        container.innerHTML += `
            <div class="alerta alerta--aviso">
                ⚠️ <strong>${criticos.length} pedido${criticos.length > 1 ? 's' : ''} vencem em até 2 dias</strong>
                — atenção à produção.
            </div>`;
    }
}

// ── Tabela: Urgentes ──────────────────────────────────────────────────────
function renderizarUrgentes(pedidos) {
    const urgentes = pedidos
        .filter(p => p.prioridade === 'URGENTE' && p.estado !== 'FINALIZADO' && p.estado !== 'CANCELADO')
        .sort((a, b) => {
            const da = diasParaVencer(a.prazoEntrega) ?? 9999;
            const db = diasParaVencer(b.prazoEntrega) ?? 9999;
            return da - db;
        });

    const corpo     = document.getElementById('corpoUrgentes');
    const vazio     = document.getElementById('vazioUrgentes');
    const tabela    = document.getElementById('tabelaUrgentes');
    const carregando = document.getElementById('carregandoUrgentes');

    carregando.style.display = 'none';
    corpo.innerHTML = '';

    if (urgentes.length === 0) {
        tabela.style.display = 'none';
        vazio.style.display  = 'block';
        return;
    }

    tabela.style.display = '';
    vazio.style.display  = 'none';

    urgentes.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${TIPO_PROTESE_LABEL[p.tipoProtese] ?? p.tipoProtese}</td>
            <td>${p.nomeDentista ?? '—'}</td>
            <td>${MATERIAL_LABEL[p.material] ?? p.material}</td>
            <td><span class="badge ${ESTADO_CLASSE[p.estado] ?? ''}">${ESTADO_LABEL[p.estado] ?? p.estado}</span></td>
            <td>${prazoComAlerta(p.prazoEntrega)}</td>
            <td class="acoes">
                <button class="btn-editar" onclick="window.location.href='/editar-pedido/${p.id}'">Ver</button>
                <button class="btn-deletar" onclick="deletar(${p.id}, this)">Excluir</button>
            </td>`;
        corpo.appendChild(tr);
    });
}

// ── Tabela: Aguardando triagem ────────────────────────────────────────────
function renderizarTriagem(pedidos) {
    const triagem = pedidos
        .filter(p => p.estado === 'AGUARDANDO_TRIAGEM')
        .sort((a, b) => {
            // Urgente primeiro, depois por prazo
            if (a.prioridade === 'URGENTE' && b.prioridade !== 'URGENTE') return -1;
            if (a.prioridade !== 'URGENTE' && b.prioridade === 'URGENTE') return 1;
            const da = diasParaVencer(a.prazoEntrega) ?? 9999;
            const db = diasParaVencer(b.prazoEntrega) ?? 9999;
            return da - db;
        });

    const corpo      = document.getElementById('corpoTriagem');
    const vazio      = document.getElementById('vazioTriagem');
    const tabela     = document.getElementById('tabelaTriagem');
    const carregando = document.getElementById('carregandoTriagem');

    carregando.style.display = 'none';
    corpo.innerHTML = '';

    if (triagem.length === 0) {
        tabela.style.display = 'none';
        vazio.style.display  = 'block';
        return;
    }

    tabela.style.display = '';
    vazio.style.display  = 'none';

    triagem.forEach(p => {
        const urgente = p.prioridade === 'URGENTE';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${TIPO_PROTESE_LABEL[p.tipoProtese] ?? p.tipoProtese}</td>
            <td>${p.nomeDentista ?? '—'}</td>
            <td>${MATERIAL_LABEL[p.material] ?? p.material}</td>
            <td><span class="badge ${urgente ? 'badge--urgente' : 'badge--normal'}">${urgente ? 'Urgente' : 'Normal'}</span></td>
            <td>${prazoComAlerta(p.prazoEntrega)}</td>
            <td class="acoes">
                <button class="btn-editar" onclick="window.location.href='/triagem-pedido'">Triar</button>
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
            carregarDados();
        } else {
            alert('Erro ao excluir pedido.');
            btn.disabled = false; btn.textContent = 'Excluir';
        }
    } catch {
        alert('Não foi possível conectar ao servidor.');
        btn.disabled = false; btn.textContent = 'Excluir';
    }
}

// ── Carga e polling ───────────────────────────────────────────────────────
async function carregarDados() {
    try {
        const res = await authFetch('/pedidos');
        if (!res || !res.ok) throw new Error();
        const pedidos = await res.json();

        atualizarCards(pedidos);
        renderizarAlertas(pedidos);
        renderizarUrgentes(pedidos);
        renderizarTriagem(pedidos);
        document.getElementById('ultimaAtualizacao').textContent =
            new Date().toLocaleTimeString('pt-BR');
    } catch {
        console.error('Erro ao carregar pedidos.');
    }
}

carregarDados();
const intervalId = setInterval(carregarDados, 30_000);
window.addEventListener('beforeunload', () => clearInterval(intervalId));
