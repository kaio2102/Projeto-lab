// ==========================================================================
// triagem.js
// Lógica da tela de triagem de pedidos.
// Responsável por: carregar pedidos com estado AGUARDANDO_TRIAGEM,
// renderizar a tabela, aprovar (PUT → EM_ANALISE), devolver via modal
// (PUT → AGUARDANDO_INFORMACOES) e tratar erros.
// ==========================================================================

// ── Referências do DOM ──────────────────────────────────────────────────
// Captura os elementos estáticos da página uma única vez.
const elCorpo       = document.getElementById('corpo-triagem');
const elTabela      = document.getElementById('tabela-triagem');
const elVazio       = document.getElementById('vazio-triagem');
// Modal desativado para PoC - comentado até implementação após PoC
// const elModal       = document.getElementById('modal-devolucao');
// const elMotivo      = document.getElementById('motivoDevolucao');
// const elErroMotivo  = document.getElementById('erroMotivo');
// const elBtnFechar   = document.getElementById('btnFecharModal');
// const elBtnCancelar = document.getElementById('btnCancelarModal');
// const elBtnConfirmar = document.getElementById('btnConfirmarDevolucao');

// ── Labels legíveis para os enums ───────────────────────────────────────
// Mapa que traduz os valores dos enums do backend em texto amigável.
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

const PRIORIDADE_LABEL = {
    URGENTE: 'Urgente',
    NORMAL:  'Normal',
};

// ── Estado do modal ─────────────────────────────────────────────────────
// Guarda o ID do pedido que está sendo devolvido enquanto o modal está aberto.
let pedidoParaDevolver = null;

function checarId() {
    const dentistaId = localStorage.getItem('dentistaId');
    if (dentistaId === null || dentistaId === '') {
        window.location.href = '/login';
    }
}

// ── Toast de notificação ────────────────────────────────────────────────
// Exibe uma mensagem temporária no canto inferior direito.
// Tipos: 'success' (verde) ou 'error' (vermelho).
function showToast(mensagem, tipo) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast' + (tipo === 'error' ? ' toast--error' : '');
    toast.textContent = mensagem;
    container.appendChild(toast);

    // Remove o toast após 3 segundos (tempo da animação de saída)
    setTimeout(() => toast.remove(), 3000);
}

// ── Renderização da tabela ──────────────────────────────────────────────
// Recebe a lista de pedidos e cria uma <tr> para cada um.
// Se a lista estiver vazia, exibe o empty state.
function renderizar(pedidos) {
    elCorpo.innerHTML = '';

    if (pedidos.length === 0) {
        elTabela.style.display = 'none';
        elVazio.style.display  = 'block';
        return;
    }

    elTabela.style.display = '';
    elVazio.style.display  = 'none';

    pedidos.forEach(p => {
        // Formata a data de prazo no padrão brasileiro (dd/mm/aaaa)
        // Appending T00:00:00 evita shift de timezone ao converter LocalDate
        const prazo = p.prazoEntrega
            ? new Date(p.prazoEntrega + 'T00:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            })
            : '—';

        // Define a classe CSS do badge de prioridade com base no valor do enum
        const prioridadeClasse = p.prioridade === 'URGENTE'
            ? 'badge-prioridade badge-prioridade--urgente'
            : 'badge-prioridade badge-prioridade--normal';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${p.id}</strong></td>
            <td>${TIPO_PROTESE_LABEL[p.tipoProtese] ?? p.tipoProtese}</td>
            <td>${MATERIAL_LABEL[p.material] ?? p.material}</td>
            <td><span class="${prioridadeClasse}">${PRIORIDADE_LABEL[p.prioridade] ?? p.prioridade}</span></td>
            <td>${prazo}</td>
            <td class="acoes">
                <button class="btn-aprovar" data-id="${p.id}">Aprovar</button>
                <button class="btn-devolver" data-id="${p.id}">Devolver</button>
            </td>
        `;
        elCorpo.appendChild(tr);
    });

    // ── Event delegation para botões de ação ────────────────────────────
    // Conecta os botões de Aprovar e Devolver via data-id.
    elCorpo.querySelectorAll('.btn-aprovar').forEach(btn => {
        btn.addEventListener('click', () => aprovar(Number(btn.dataset.id), btn));
    });

    elCorpo.querySelectorAll('.btn-devolver').forEach(btn => {
        btn.addEventListener('click', () => abrirModalDevolucao(Number(btn.dataset.id)));
    });
}

// ── Carregar pedidos aguardando triagem ──────────────────────────────────
// Faz GET /pedidos/estado?estado=AGUARDANDO_TRIAGEM via authFetch.
// Chamado ao carregar a página e após cada ação (aprovar/devolver).
async function carregarPedidos() {
    try {
        const res = await authFetch('/pedidos/estado?estado=AGUARDANDO_TRIAGEM');

        if (!res.ok) {
            showToast('Erro ao carregar pedidos.', 'error');
            elTabela.style.display = 'none';
            elVazio.style.display  = 'block';
            return;
        }

        const pedidos = await res.json();
        renderizar(pedidos);
    } catch {
        // Falha de rede — servidor fora do ar ou sem conexão
        showToast('Não foi possível conectar ao servidor.', 'error');
        elTabela.style.display = 'none';
        elVazio.style.display  = 'block';
    }
}

// ── Aprovar pedido ──────────────────────────────────────────────────────
// PUT /pedidos/{id}/estado?novoEstado=EM_ANALISE
// Em caso de sucesso, recarrega a lista para atualizar a tabela.
async function aprovar(id, btn) {
    btn.disabled = true;
    btn.textContent = '...';

    try {
        const res = await authFetch(`/pedidos/${id}/estado?novoEstado=EM_ANALISE`, {
            method: 'PUT',
        });

        if (res.ok) {
            showToast(`Pedido #${id} aprovado com sucesso!`, 'success');
            await carregarPedidos();
        } else {
            const texto = await res.text();
            showToast(`Erro ao aprovar: ${texto}`, 'error');
            btn.disabled = false;
            btn.textContent = 'Aprovar';
        }
    } catch {
        showToast('Não foi possível conectar ao servidor.', 'error');
        btn.disabled = false;
        btn.textContent = 'Aprovar';
    }
}

// ── Modal de devolução — abrir ──────────────────────────────────────────
// Guarda o ID do pedido e exibe o modal para o usuário digitar o motivo.
// Desativado para PoC - TODO: implementar após PoC
function abrirModalDevolucao(id) {
    pedidoParaDevolver = id;
    // elMotivo.value = ''; comentado para a PoC de hoje (18/10/2025)
    // elModal.style.display = 'flex';
}

// ── Modal de devolução — fechar ─────────────────────────────────────────
// Esconde o modal e limpa o estado.
// Desativado para PoC - TODO: implementar após PoC
function fecharModal() {
    // elModal.style.display = 'none';
    pedidoParaDevolver = null;
    // elMotivo.value = ''; comentado para a PoC de hoje (18/10/2025)
}

/* Remove o estado de erro do textarea do modal
function limparErroModal() {
    const field = elMotivo.closest('.field');
    field.classList.remove('has-error');
    elErroMotivo.textContent = '';
    elErroMotivo.style.display = 'none';
}
*/

// ── Confirmar devolução ─────────────────────────────────────────────────
// Faz PUT /pedidos/{id}/estado?novoEstado=AGUARDANDO_INFORMACOES
// TODO: após PoC, implementar validação de motivo obrigatório
async function confirmarDevolucao() {
   
   // const motivo = elMotivo.value.trim();

    /* Validação do textarea obrigatório
    if (!motivo) {
        const field = elMotivo.closest('.field');
        field.classList.add('has-error');
        elErroMotivo.textContent = 'O motivo da devolução é obrigatório.';
        elErroMotivo.style.display = 'block';
        return;
    }
    */

    // elBtnConfirmar.disabled = true;
    // elBtnConfirmar.textContent = 'Enviando...';

    try {
        const res = await authFetch(
            `/pedidos/${pedidoParaDevolver}/estado?novoEstado=AGUARDANDO_INFORMACOES`,
            { method: 'PUT' }
        );

        if (res.ok) {
            showToast(`Pedido #${pedidoParaDevolver} devolvido.`, 'success');
            fecharModal();
            await carregarPedidos();
        } else {
            const texto = await res.text();
            showToast(`Erro ao devolver: ${texto}`, 'error');
        }
    } catch {
        showToast('Não foi possível conectar ao servidor.', 'error');
    } finally {
        // elBtnConfirmar.disabled = false;
        // elBtnConfirmar.textContent = 'Confirmar Devolução';
    }
}

// ── Event listeners do modal ────────────────────────────────────────────
// Conecta os botões de fechar, cancelar e confirmar.
// Desativado para PoC - TODO: implementar após PoC
// elBtnFechar.addEventListener('click', fecharModal);
// elBtnCancelar.addEventListener('click', fecharModal);
// elBtnConfirmar.addEventListener('click', confirmarDevolucao);

// Fecha o modal ao clicar no overlay escuro (fora da caixa branca)
// elModal.addEventListener('click', (e) => {
//     if (e.target === elModal) fecharModal();
// });

// ── Inicialização ───────────────────────────────────────────────────────
// Carrega os pedidos assim que a página é aberta.
carregarPedidos();
