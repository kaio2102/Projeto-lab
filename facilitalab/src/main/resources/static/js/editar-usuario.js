const id = window.location.pathname.split('/').pop();

function atualizarCampos() {
    const perfil   = document.getElementById('perfil').value;
    const campoCro = document.getElementById('campo-cro');

    if (perfil === 'DENTISTA') {
        campoCro.style.display = 'block';
    } else {
        campoCro.style.display = 'none';
        document.getElementById('cro').value = '';
    }
}

async function carregarUsuario() {
    try {
        const res = await authFetch(`/usuarios/${id}`);
        if (!res.ok) throw new Error();
        const u = await res.json();

        document.getElementById('nome').value     = u.nome;
        document.getElementById('email').value    = u.email;
        document.getElementById('perfil').value   = u.perfil;
        // CPF e telefone vêm com somente dígitos do banco; formata para exibição
        document.getElementById('cpf').value      = formatarCpf(u.cpf);
        document.getElementById('telefone').value = formatarTelefone(u.telefone);

        atualizarCampos();

        if (u.perfil === 'DENTISTA') {
            document.getElementById('cro').value = u.cro ?? '';
        }

    } catch {
        mostrar(document.getElementById('mensagem'), ['Erro ao carregar dados do usuário.'], 'erro');
    }
}

async function salvar() {
    const btn            = document.getElementById('btnSalvar');
    const msg            = document.getElementById('mensagem');
    const perfil         = document.getElementById('perfil').value;
    const senha          = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    const body = {
        nome:     document.getElementById('nome').value.trim(),
        email:    document.getElementById('email').value.trim(),
        perfil,
        cpf:      document.getElementById('cpf').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        cro:      perfil === 'DENTISTA' ? (document.getElementById('cro').value.trim() || null) : null,
    };

    if (senha) body.senha = senha;

    // --- Validação ---
    const erros = [];

    if (!body.nome) {
        erros.push('O nome é obrigatório.');
    } else if (body.nome.length < 3 || body.nome.length > 100) {
        erros.push('O nome deve ter entre 3 e 100 caracteres.');
    }

    if (!body.email) {
        erros.push('O e-mail é obrigatório.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        erros.push('E-mail inválido.');
    } else if (body.email.length > 250) {
        erros.push('O e-mail deve ter no máximo 250 caracteres.');
    }

    if (!body.perfil) {
        erros.push('O perfil é obrigatório.');
    }

    if (!body.cpf) {
        erros.push('O CPF é obrigatório.');
    } else if (!/^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(body.cpf)) {
        erros.push('CPF inválido.');
    }

    if (!body.telefone) {
        erros.push('O telefone é obrigatório.');
    } else if (!/^[\d\s()\-+]{8,20}$/.test(body.telefone)) {
        erros.push('Telefone inválido. Use apenas números, espaços, parênteses ou hífen.');
    }

    if (perfil === 'DENTISTA' && !body.cro) {
        erros.push('O CRO é obrigatório para dentistas.');
    }

    if (senha || confirmarSenha) {
        if (senha.length < 6 || senha.length > 100) erros.push('A senha deve ter entre 6 e 100 caracteres.');
        if (senha !== confirmarSenha)               erros.push('As senhas não coincidem.');
    }

    if (erros.length > 0) {
        mostrar(msg, erros, 'erro');
        return;
    }

    // --- Envio ---
    btn.disabled = true;
    btn.textContent = 'Salvando...';
    msg.className = '';
    msg.style.display = 'none';

    try {
        const res = await authFetch(`/usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.status === 200) {
            window.location.href = '/lista-usuarios';
        } else if (res.status === 400) {
            try {
                const errosBack = await res.json();
                mostrar(msg, errosBack.errors ?? ['Erro de validação.'], 'erro');
            } catch {
                mostrar(msg, ['Erro de validação.'], 'erro');
            }
        } else {
            mostrar(msg, [`Erro ${res.status}: ${await res.text()}`], 'erro');
        }
    } catch {
        mostrar(msg, ['Não foi possível conectar ao servidor.'], 'erro');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Salvar Alterações';
    }
}

function mostrar(el, textos, tipo) {
    el.innerHTML = Array.isArray(textos)
        ? textos.map(t => `<p>${t}</p>`).join('')
        : `<p>${textos}</p>`;
    el.className = tipo;
    el.style.display = 'block';
}

carregarUsuario();
