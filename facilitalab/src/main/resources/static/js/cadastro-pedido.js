// Referências do DOM — preenchidas em inicializarCadastroPedido(),
// não no carregamento do script (o formulário só existe depois de
// o fragmento ser injetado no modal)
let elCor, elTipoProtese, elMaterial, elPrioridade, elPrazoEntrega, elObservacoes, elBtnEnviar;

function definirDataMinima() {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const yyyy = amanha.getFullYear();
    const mm = String(amanha.getMonth() + 1).padStart(2, '0');
    const dd = String(amanha.getDate()).padStart(2, '0');
    elPrazoEntrega.setAttribute('min', `${yyyy}-${mm}-${dd}`);
}

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

function validarTipoProtese() {
    if (!elTipoProtese.value) {
        setFieldError(elTipoProtese, 'Selecione o tipo de prótese.');
        return false;
    }
    setFieldError(elTipoProtese, '');
    return true;
}

function validarMaterial() {
    if (!elMaterial.value) {
        setFieldError(elMaterial, 'Selecione o material.');
        return false;
    }
    setFieldError(elMaterial, '');
    return true;
}

function validarPrioridade() {
    if (!elPrioridade.value) {
        setFieldError(elPrioridade, 'Selecione a prioridade.');
        return false;
    }
    setFieldError(elPrioridade, '');
    return true;
}

function validarPrazo() {
    if (!elPrazoEntrega.value) {
        setFieldError(elPrazoEntrega, 'O prazo de entrega é obrigatório.');
        return false;
    }
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

// Toast — usa os elementos fixos definidos em lista-pedidos.html,
// não os antigos .toast criados dinamicamente (colidiam com o Bootstrap)
function showToast(mensagem, tipo) {
    const idToast = tipo === 'error' ? 'toastErroPedido' : 'toastSucessoPedido';
    const idBody = tipo === 'error' ? 'toastErroPedidoBody' : 'toastSucessoPedidoBody';

    document.getElementById(idBody).innerHTML = `<p>${mensagem}</p>`;
    bootstrap.Toast.getOrCreateInstance(document.getElementById(idToast), {delay: 4000}).show();
}

async function enviarPedido() {
    const corOk = validarCor();
    const tipoOk = validarTipoProtese();
    const materialOk = validarMaterial();
    const prioridadeOk = validarPrioridade();
    const prazoOk = validarPrazo();

    if (!corOk || !tipoOk || !materialOk || !prioridadeOk || !prazoOk) {
        return;
    }

    const body = {
        cor: elCor.value.trim(),
        tipoProtese: elTipoProtese.value,
        material: elMaterial.value,
        prioridade: elPrioridade.value,
        prazoEntrega: elPrazoEntrega.value,
        observacoes: elObservacoes.value.trim() || null,
        dentistaId: Number(localStorage.getItem('id')),
    };

    elBtnEnviar.disabled = true;
    elBtnEnviar.textContent = 'Enviando...';

    try {
        const res = await authFetch('/pedidos', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        });

        if (res.status === 201) {
            showToast('Pedido cadastrado com sucesso!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('modalCadastroPedido')).hide();
            await carregarPedidos();
        } else if (res.status === 400) {
            try {
                const errosBackend = await res.json();
                const lista = errosBackend.errors ?? ['Erro de validação.'];
                lista.forEach(e => showToast(e, 'error'));
            } catch {
                showToast('Erro de validação.', 'error');
            }
        } else {
            const texto = await res.text();
            showToast(`Erro ${res.status}: ${texto}`, 'error');
        }
    } catch {
        showToast('Não foi possível conectar ao servidor.', 'error');
    } finally {
        elBtnEnviar.disabled = false;
        elBtnEnviar.textContent = 'Enviar para Triagem';
    }
}

// Chamado pelo lista-pedido.js depois de injetar o fragmento no modal
function inicializarCadastroPedido() {
    elCor = document.getElementById('cor');
    elTipoProtese = document.getElementById('tipoProtese');
    elMaterial = document.getElementById('material');
    elPrioridade = document.getElementById('prioridade');
    elPrazoEntrega = document.getElementById('prazoEntrega');
    elObservacoes = document.getElementById('observacoes');
    elBtnEnviar = document.getElementById('btnEnviar');

    elCor.addEventListener('blur', validarCor);
    elTipoProtese.addEventListener('change', validarTipoProtese);
    elMaterial.addEventListener('change', validarMaterial);
    elPrioridade.addEventListener('change', validarPrioridade);
    elPrazoEntrega.addEventListener('change', validarPrazo);

    definirDataMinima();
    elBtnEnviar.addEventListener('click', enviarPedido);
}