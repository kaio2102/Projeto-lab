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

async function cadastrar() {
    const btn  = document.getElementById('btnCadastrar');
    const msg  = document.getElementById('mensagem');
    const perfil = document.getElementById('perfil').value;

    const body = {
        nome:     document.getElementById('nome').value.trim(),
        email:    document.getElementById('email').value.trim(),
        senha:    document.getElementById('senha').value,
        perfil,
        cpf:      document.getElementById('cpf').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        cro:      perfil === 'DENTISTA' ? (document.getElementById('cro').value.trim() || null) : null,
    };

    // --- Validação no front ---
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

    if (!body.senha) {
        erros.push('A senha é obrigatória.');
    } else if (body.senha.length < 6 || body.senha.length > 100) {
        erros.push('A senha deve ter entre 6 e 100 caracteres.');
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

    if (erros.length > 0) {
        mostrar(msg, erros, 'erro');
        return;
    }

    // --- Envio ---
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    msg.className = '';
    msg.style.display = 'none';

    try {
        const res = await authFetch('/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.status === 201) {
            window.location.href = '/lista-usuarios';
        } else if (res.status === 400) {
            try {
                const errosBackend = await res.json();
                mostrar(msg, errosBackend.errors ?? ['Erro de validação.'], 'erro');
            } catch {
                mostrar(msg, ['Erro de validação.'], 'erro');
            }
        } else {
            mostrar(msg, [`Erro ${res.status}: ${await res.text()}`], 'erro');
        }
    } catch {
        mostrar(msg, 'Não foi possível conectar ao servidor.', 'erro');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Cadastrar';
    }
}

function mostrar(el, textos, tipo) {
    el.innerHTML = Array.isArray(textos)
        ? textos.map(t => `<p>${t}</p>`).join('')
        : `<p>${textos}</p>`;
    el.className = tipo;
    el.style.display = 'block';
}
