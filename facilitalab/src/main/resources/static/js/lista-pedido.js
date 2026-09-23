let todosPedidos = [];

function editar(id) {
    abrirModalEditarPedido(id);
}

async function abrirModalCadastroPedido() {
    const body = document.getElementById('modalCadastroPedidoBody');
    const res = await fetch('/fragments/form-cadastro-pedido.html');
    body.innerHTML = await res.text();

    inicializarCadastroPedido();

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCadastroPedido')).show();
}

async function abrirModalEditarPedido(id) {
    const body = document.getElementById('modalEditarPedidoBody');
    const res = await fetch('/fragments/form-editar-pedido.html');
    body.innerHTML = await res.text();

    inicializarEdicaoPedido(id);

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarPedido')).show();
}

document.getElementById('modalCadastroPedido').addEventListener('hidden.bs.modal', () => {
    document.getElementById('modalCadastroPedidoBody').innerHTML = '';
});
document.getElementById('modalEditarPedido').addEventListener('hidden.bs.modal', () => {
    document.getElementById('modalEditarPedidoBody').innerHTML = '';
});

async function deletar(id, btn) {
    if (!confirm('Deseja realmente excluir este pedido?')) return;

    btn.disabled = true;
    btn.textContent = '...';

    try {
        const res = await authFetch(`/pedidos/${id}`, {method: 'DELETE'});
        if (res.status === 204) {
            todosPedidos = todosPedidos.filter(p => p.id !== id);
            const estadoAtivo = document.querySelector('.filtro-btn.active')?.dataset.estado ?? '';
            renderizar(estadoAtivo);
        } else {
            alert('Erro ao excluir pedido.');
            btn.disabled = false;
            btn.textContent = 'Excluir';
        }
    } catch {
        alert('Não foi possível conectar ao servidor.');
        btn.disabled = false;
        btn.textContent = 'Excluir';
    }
}

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
    AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
    EM_ANALISE: 'Em Análise',
    EM_MODELAGEM: 'Em Modelagem',
    EM_CORRECAO: 'Em Correção',
    USINAGEM: 'Usinagem',
    FINALIZADO: 'Finalizado',
    CANCELADO: 'Cancelado',
};

const PRIORIDADE_LABEL = {URGENTE: 'Urgente', NORMAL: 'Normal'};

function renderizar(estadoFiltro) {
    const corpo = document.getElementById('corpo');
    const vazio = document.getElementById('vazio');
    const tabela = document.getElementById('tabela');

    const lista = estadoFiltro
        ? todosPedidos.filter(p => p.estado === estadoFiltro)
        : todosPedidos;

    corpo.innerHTML = '';

    if (lista.length === 0) {
        tabela.style.display = 'none';
        vazio.style.display = 'block';
        return;
    }

    tabela.style.display = '';
    vazio.style.display = 'none';

    lista.forEach(p => {
        const prazo = p.prazoEntrega
            ? new Date(p.prazoEntrega + 'T00:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            })
            : '—';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${TIPO_PROTESE_LABEL[p.tipoProtese] ?? p.tipoProtese}</td>
            <td>${p.cor}</td>
            <td>${MATERIAL_LABEL[p.material] ?? p.material}</td>
            <td>${p.nomeDentista ?? '—'}</td>
            <td><span>${PRIORIDADE_LABEL[p.prioridade] ?? p.prioridade}</span></td>
            <td>${ESTADO_LABEL[p.estado] ?? p.estado}</td>
            <td>${prazo}</td>
            <td class="acoes">
                <button class="btn-editar" onclick="editar(${p.id})"><i class="bi bi-pencil-fill"></i> Editar</button>
                <button class="btn-deletar" onclick="deletar(${p.id}, this)"><i class="bi bi-trash-fill"></i> Excluir</button>
            </td>
        `;
        corpo.appendChild(tr);
    });
}

function inicializarFiltros() {
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderizar(btn.dataset.estado);
        });
    });
}

async function carregarPedidos() {
    const vazio = document.getElementById('vazio');
    const tabela = document.getElementById('tabela');

    try {
        const perfil = localStorage.getItem('perfil');
        const dentistaId = localStorage.getItem('id');

        let url = '/pedidos';
        if (perfil === 'DENTISTA' && dentistaId) {
            url = `/pedidos/dentista/${dentistaId}`;
        }

        const res = await authFetch(url);
        todosPedidos = await res.json();
        const estadoAtivo = document.querySelector('.filtro-btn.active')?.dataset.estado ?? '';
        renderizar(estadoAtivo);
    } catch {
        vazio.textContent = 'Erro ao carregar pedidos.';
        vazio.style.display = 'block';
        tabela.style.display = 'none';
    }
}

inicializarFiltros();
carregarPedidos();