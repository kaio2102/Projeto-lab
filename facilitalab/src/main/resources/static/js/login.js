async function login() {
    const btn = document.getElementById('btnLogin');

    const body = {
        email: document.getElementById('email').value.trim(),
        senha: document.getElementById('senha').value,
    };

    const erros = [];

    if (!body.email) {
        erros.push('Informe o e-mail.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        erros.push('Informe um e-mail válido.');
    }

    if (!body.senha) {
        erros.push('Informe a senha.');
    }

    if (erros.length > 0) {
        mostrar(erros);
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('nome', data.nome);
            localStorage.setItem('perfil', data.perfil);
            localStorage.setItem('id', data.id);   // ID necessário para buscar pedidos do dentista

            redirecionarPorPerfil(data.perfil);

        } else if (res.status === 401) {
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

function redirecionarPorPerfil(perfil) {
    const rotas = {
        DENTISTA: '/dashboard-dentista',
        RECEPCAO: '/dashboard-recepcao',
        CADISTA: '/dashboard-cadista',
        GESTOR: '/dashboard',
    };
    window.location.href = rotas[perfil] ?? '/dashboard';
}

/* A função mostrar() dispara uma instância de Toast do Bootstrap */
function mostrar(textos) {
    const toastEl = document.getElementById('toastErro');
    const body = document.getElementById('toastErroBody');

    body.innerHTML = Array.isArray(textos)
        ? textos.map(t => `<p>${t}</p>`).join('')
        : `<p>${textos}</p>`;

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, {delay: 5000});
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
        document.getElementById(id).addEventListener('keydown', e => {
            if (e.key === 'Enter') login();
        });
    });
});