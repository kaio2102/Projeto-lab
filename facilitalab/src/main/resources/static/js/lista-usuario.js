// Todos os usuários carregados — filtragem local sem nova requisição
let todosUsuarios = [];

function editar(id) {
    window.location.href = `/editar-usuario/${id}`;
}

async function deletar(id, btn) {
    if (!confirm('Deseja realmente excluir este usuário?')) return;

    btn.disabled = true;
    btn.textContent = '...';

    try {
        const res = await authFetch(`/usuarios/${id}`, { method: 'DELETE' });
        if (res.status === 204) {
            // Remove do array e re-renderiza para manter o filtro ativo
            todosUsuarios = todosUsuarios.filter(u => u.id !== id);
            const perfilAtivo = document.querySelector('.filtro-btn.active')?.dataset.perfil ?? '';
            renderizar(perfilAtivo);
        } else {
            alert('Erro ao excluir usuário.');
            btn.disabled = false;
            btn.textContent = 'Excluir';
        }
    } catch {
        alert('Não foi possível conectar ao servidor.');
        btn.disabled = false;
        btn.textContent = 'Excluir';
    }
}

function renderizar(perfilFiltro) {
    const corpo  = document.getElementById('corpo');
    const vazio  = document.getElementById('vazio');
    const tabela = document.getElementById('tabela');

    const lista = perfilFiltro
        ? todosUsuarios.filter(u => u.perfil === perfilFiltro)
        : todosUsuarios;

    corpo.innerHTML = '';

    if (lista.length === 0) {
        tabela.style.display = 'none';
        vazio.style.display  = 'block';
        return;
    }

    tabela.style.display = '';
    vazio.style.display  = 'none';

    const PERFIL_LABEL = {
        GESTOR:   'Gestor',
        RECEPCAO: 'Recepção',
        CADISTA:  'Cadista',
        DENTISTA: 'Dentista',
    };

    lista.forEach(u => {
        const data = u.dataCriacao
            ? new Date(u.dataCriacao).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            })
            : '—';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.nome}</td>
            <td>${u.email}</td>
            <td><span>${PERFIL_LABEL[u.perfil] ?? u.perfil}</span></td>
            <td>${data}</td>
            <td class="acoes">
                <button class="btn-editar" onclick="editar(${u.id})">Editar</button>
                <button class="btn-deletar" onclick="deletar(${u.id}, this)">Excluir</button>
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
            renderizar(btn.dataset.perfil);
        });
    });
}

async function carregarUsuarios() {
    const vazio  = document.getElementById('vazio');
    const tabela = document.getElementById('tabela');

    try {
        const res = await authFetch('/usuarios');
        todosUsuarios = await res.json();
        renderizar('');
    } catch {
        vazio.textContent    = 'Erro ao carregar usuários.';
        vazio.style.display  = 'block';
        tabela.style.display = 'none';
    }
}

inicializarFiltros();
carregarUsuarios();