async function login() {
    const btn = document.getElementById('btnLogin');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const emailErro = document.getElementById('emailErro');
    const senhaErro = document.getElementById('senhaErro');

    limparErrosCampos();

    const body = {
        email: emailInput.value.trim(),
        senha: senhaInput.value,
    };

    let temErroCampo = false;

    if (!body.email) {
        marcarInvalido(emailInput, emailErro, 'Informe o e-mail.');
        temErroCampo = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        marcarInvalido(emailInput, emailErro, 'Informe um e-mail válido.');
        temErroCampo = true;
    }

    if (!body.senha) {
        marcarInvalido(senhaInput, senhaErro, 'Informe a senha.');
        temErroCampo = true;
    }

    if (temErroCampo) return;

    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('nome', data.nome);
            localStorage.setItem('perfil', data.perfil);
            localStorage.setItem('id', data.id);

            redirecionarPorPerfil(data.perfil);

        } else if (res.status === 401) {
            // Credencial errada não aponta qual campo está incorreto — marca os dois
            marcarInvalido(emailInput, emailErro, '');
            marcarInvalido(senhaInput, senhaErro, '');
            mostrar(['As informações de login que você inseriu estão incorretas.']);
        } else if (res.status === 400) {
            try {
                const errosBack = await res.json();
                mostrar(errosBack.errors ?? ['Erro de validação.']);
            } catch {
                mostrar(['Erro de validação.']);
            }
        } else {
            mostrar([`Erro ${res.status}. Tente novamente.`]);
        }
    } catch {
        mostrar(['Não foi possível conectar ao servidor.']);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Entrar';
    }
}

function marcarInvalido(input, elErro, mensagem) {
    input.classList.add('is-invalid');
    elErro.textContent = mensagem;
}

function limparErrosCampos() {
    ['email', 'senha'].forEach(id => {
        const input = document.getElementById(id);
        input.classList.remove('is-invalid');
        document.getElementById(id + 'Erro').textContent = '';
    });
}

function redirecionarPorPerfil(perfil) {
    const rotas = {
        DENTISTA: '/dashboard-dentista',
        RECEPCAO: '/dashboard-recepcao',
        CADISTA: '/dashboard-cadista',
        GESTOR: '/dashboard',
    };
    window.location.href = rotas[perfil] ?? '/dashboard';
}

function mostrar(textos) {
    const toastEl = document.getElementById('toastErro');
    const body = document.getElementById('toastErroBody');

    body.innerHTML = Array.isArray(textos)
        ? textos.map(t => `<p>${t}</p>`).join('')
        : `<p>${textos}</p>`;

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 5000 });
    toast.show();
}

/* ─── Animação da splash — CSS puro, sem dependências externas ─── */
window.addEventListener('load', () => {
    setTimeout(() => {
        document.body.classList.add('playing');

        setTimeout(() => {
            document.getElementById('login-screen').classList.add('show');
        }, 950);

    }, 100);
});

// Permite submeter com Enter em qualquer campo do formulário
document.addEventListener('DOMContentLoaded', () => {
    ['email', 'senha'].forEach(id => {
        const input = document.getElementById(id);

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') login();
        });

        // Limpa o estado de erro do campo assim que o usuário volta a digitar
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
            document.getElementById(id + 'Erro').textContent = '';
        });
    });
});