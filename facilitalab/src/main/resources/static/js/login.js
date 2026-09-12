async function login() {
    const btn = document.getElementById('btnLogin');
    const msg = document.getElementById('mensagem');

    const body = {
        email: document.getElementById('email').value.trim(),
        senha: document.getElementById('senha').value,
    };

    const erros = [];

    if (!body.email) {
        erros.push('O e-mail é obrigatório.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        erros.push('E-mail inválido.');
    }

    if (!body.senha) {
        erros.push('A senha é obrigatória.');
    }

    if (erros.length > 0) {
        mostrar(msg, erros, 'erro');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Entrando...';
    msg.className = '';
    msg.style.display = 'none';

    try {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token',  data.token);
            localStorage.setItem('nome',   data.nome);
            localStorage.setItem('perfil', data.perfil);
            localStorage.setItem('id',     data.id);   // ID necessário para buscar pedidos do dentista

            redirecionarPorPerfil(data.perfil);

        } else if (res.status === 401) {
            mostrar(msg, ['E-mail ou senha incorretos.'], 'erro');
        } else if (res.status === 400) {
            try {
                const errosBack = await res.json();
                mostrar(msg, errosBack.errors ?? ['Erro de validação.'], 'erro');
            } catch {
                mostrar(msg, ['Erro de validação.'], 'erro');
            }
        } else {
            mostrar(msg, [`Erro ${res.status}. Tente novamente.`], 'erro');
        }
    } catch {
        mostrar(msg, ['Não foi possível conectar ao servidor.'], 'erro');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Entrar';
    }
}

function redirecionarPorPerfil(perfil) {
    const rotas = {
        DENTISTA: '/dashboard-dentista',
        RECEPCAO: '/dashboard-recepcao',
        CADISTA:  '/dashboard-cadista',
        GESTOR:   '/dashboard',
    };
    window.location.href = rotas[perfil] ?? '/dashboard';
}

function mostrar(el, textos, tipo) {
    el.innerHTML = Array.isArray(textos)
        ? textos.map(t => `<p>${t}</p>`).join('')
        : `<p>${textos}</p>`;
    el.className = tipo;
    el.style.display = 'block';
}


/* ─── Animação da splash — CSS puro, sem dependências externas ─── */
window.addEventListener('load', () => {
    setTimeout(() => {
        document.body.classList.add('playing');

        setTimeout(() => {
            document.getElementById('login-screen').classList.add('show');
        }, 4900);

    }, 400);
});

// Permite submeter com Enter em qualquer campo do formulário
document.addEventListener('DOMContentLoaded', () => {
    ['email', 'senha'].forEach(id => {
        document.getElementById(id).addEventListener('keydown', e => {
            if (e.key === 'Enter') login();
        });
    });
});
