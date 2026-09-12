// ==========================================================================
// cadastro-pedido.js
// Lógica da tela de cadastro de pedido.
// Responsável por: validação inline campo a campo, montagem do body JSON,
// envio via authFetch (POST /pedidos), toast de sucesso e redirect.
// ==========================================================================

// ── Referências do DOM ──────────────────────────────────────────────────
// Captura os elementos uma única vez para evitar buscas repetidas.
const elCor          = document.getElementById('cor');
const elTipoProtese  = document.getElementById('tipoProtese');
const elMaterial     = document.getElementById('material');
const elPrioridade   = document.getElementById('prioridade');
const elPrazoEntrega = document.getElementById('prazoEntrega');
const elObservacoes  = document.getElementById('observacoes');
const elBtnEnviar    = document.getElementById('btnEnviar');

function checarId() {
    const dentistaId = localStorage.getItem('dentistaId');
    if (dentistaId === null || dentistaId === '') {
        window.location.href = '/login';
    }
}

// ── Data mínima do prazo ────────────────────────────────────────────────
// O prazo deve ser no mínimo amanhã. Calcula a data de amanhã e define
// como atributo "min" do input date para impedir seleção de datas passadas.
function definirDataMinima() {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const yyyy = amanha.getFullYear();
    const mm   = String(amanha.getMonth() + 1).padStart(2, '0');
    const dd   = String(amanha.getDate()).padStart(2, '0');
    elPrazoEntrega.setAttribute('min', `${yyyy}-${mm}-${dd}`);
}

// ── Validação inline campo a campo ──────────────────────────────────────
// Cada função valida um campo específico, adiciona/remover a classe
// "has-error" no .field pai e atualiza o texto de .field-error.
// Retorna true se o campo é válido.

/**
 * Marca ou desmarca o estado de erro em um campo.
 * @param {HTMLElement} input  — o input/select/textarea
 * @param {string}      msg   — mensagem de erro (vazia = sem erro)
 */
function setFieldError(input, msg) {
    const field = input.closest('.field');
    const errorEl = field.querySelector('.field-error');
    if (msg) {
        field.classList.add('has-error');
        errorEl.textContent = msg;
    } else {
        field.classList.remove('has-error');
        errorEl.textContent = '';
    }
}

// Valida o campo Cor/Shade — obrigatório, máx. 50 caracteres
function validarCor() {
    const val = elCor.value.trim();
    if (!val) {
        setFieldError(elCor, 'A cor/shade é obrigatória.');
        return false;
    }
    if (val.length > 50) {
        setFieldError(elCor, 'Máximo de 50 caracteres.');
        return false;
    }
    setFieldError(elCor, '');
    return true;
}

// Valida o select Tipo de Prótese — obrigatório
function validarTipoProtese() {
    if (!elTipoProtese.value) {
        setFieldError(elTipoProtese, 'Selecione o tipo de prótese.');
        return false;
    }
    setFieldError(elTipoProtese, '');
    return true;
}

// Valida o select Material — obrigatório
function validarMaterial() {
    if (!elMaterial.value) {
        setFieldError(elMaterial, 'Selecione o material.');
        return false;
    }
    setFieldError(elMaterial, '');
    return true;
}

// Valida o select Prioridade — obrigatório
function validarPrioridade() {
    if (!elPrioridade.value) {
        setFieldError(elPrioridade, 'Selecione a prioridade.');
        return false;
    }
    setFieldError(elPrioridade, '');
    return true;
}

// Valida o campo Prazo de Entrega — obrigatório e deve ser >= amanhã
function validarPrazo() {
    if (!elPrazoEntrega.value) {
        setFieldError(elPrazoEntrega, 'O prazo de entrega é obrigatório.');
        return false;
    }
    // Compara a data selecionada com "hoje" (sem hora) para garantir data futura
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(0, 0, 0, 0);
    const selecionada = new Date(elPrazoEntrega.value + 'T00:00:00');
    if (selecionada < amanha) {
        setFieldError(elPrazoEntrega, 'O prazo deve ser a partir de amanhã.');
        return false;
    }
    setFieldError(elPrazoEntrega, '');
    return true;
}

// ── Listeners de validação em tempo real ─────────────────────────────────
// Cada campo valida ao perder o foco (blur) para feedback imediato.
elCor.addEventListener('blur', validarCor);
elTipoProtese.addEventListener('change', validarTipoProtese);
elMaterial.addEventListener('change', validarMaterial);
elPrioridade.addEventListener('change', validarPrioridade);
elPrazoEntrega.addEventListener('change', validarPrazo);

// ── Toast de notificação ────────────────────────────────────────────────
// Exibe uma mensagem temporária no canto inferior direito da tela.
// Tipos aceitos: 'success' (verde) e 'error' (vermelho).
function showToast(mensagem, tipo) {
    // Cria o container se ainda não existir no DOM
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

    // Remove o toast após a animação de saída (3s total)
    setTimeout(() => toast.remove(), 3000);
}

// ── Envio do formulário ─────────────────────────────────────────────────
// Valida todos os campos, monta o body JSON com dentistaId vindo do
// localStorage, envia via authFetch e trata a resposta.
async function enviarPedido() {
    // Executa todas as validações — usa & (não &&) para rodar todas mesmo
    // que a primeira falhe, garantindo feedback completo ao usuário.
    const corOk       = validarCor();
    const tipoOk      = validarTipoProtese();
    const materialOk  = validarMaterial();
    const prioridadeOk = validarPrioridade();
    const prazoOk     = validarPrazo();

    if (!corOk || !tipoOk || !materialOk || !prioridadeOk || !prazoOk) {
        return; // Há campos inválidos — não envia
    }

    // Monta o payload com os valores do formulário
    const body = {
        cor:          elCor.value.trim(),
        tipoProtese:  elTipoProtese.value,
        material:     elMaterial.value,
        prioridade:   elPrioridade.value,
        prazoEntrega: elPrazoEntrega.value,
        observacoes:  elObservacoes.value.trim() || null,
        dentistaId:   Number(localStorage.getItem('id')),
    };

    // Desabilita o botão para evitar duplo envio
    elBtnEnviar.disabled = true;
    elBtnEnviar.textContent = 'Enviando...';

    try {
        const res = await authFetch('/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.status === 201) {
            // Sucesso — exibe toast e redireciona para a lista de pedidos
            showToast('Pedido cadastrado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = '/lista-pedidos';
            }, 1200);
        } else if (res.status === 400) {
            // Erro de validação do backend — exibe mensagens retornadas
            try {
                const errosBackend = await res.json();
                const lista = errosBackend.errors ?? ['Erro de validação.'];
                lista.forEach(e => showToast(e, 'error'));
            } catch {
                showToast('Erro de validação.', 'error');
            }
        } else {
            // Erro genérico — mostra o status HTTP
            const texto = await res.text();
            showToast(`Erro ${res.status}: ${texto}`, 'error');
        }
    } catch {
        // Falha de rede — servidor fora do ar ou sem conexão
        showToast('Não foi possível conectar ao servidor.', 'error');
    } finally {
        // Reabilita o botão independentemente do resultado
        elBtnEnviar.disabled = false;
        elBtnEnviar.textContent = 'Enviar para Triagem';
    }
}

// ── Inicialização ───────────────────────────────────────────────────────
// Define a data mínima do prazo e conecta o botão de envio.
definirDataMinima();
elBtnEnviar.addEventListener('click', enviarPedido);
