const TAMANHO_MINIMO_SENHA = 6;

const token = new URLSearchParams(window.location.search).get('token');

async function redefinirSenha() {
    const btn = document.getElementById('btnRedefinir');
    const msg = document.getElementById('mensagem');

    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    if (!novaSenha || !confirmarSenha) {
        mostrar(msg, ['Preencha os dois campos de senha.'], 'erro');
        return;
    }

    if (novaSenha.length < TAMANHO_MINIMO_SENHA) {
        mostrar(msg, [`A senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`], 'erro');
        return;
    }

    if (novaSenha !== confirmarSenha) {
        mostrar(msg, ['As senhas não coincidem.'], 'erro');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Redefinindo...';
    msg.className = '';
    msg.style.display = 'none';

    try {
        const res = await fetch('/auth/redefinir-senha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, novaSenha }),
        });

        if (res.ok) {
            mostrar(msg, ['Senha redefinida com sucesso! Redirecionando para o login...'], 'sucesso');
            setTimeout(() => { window.location.href = '/login'; }, 2000);
        } else {
            mostrar(msg, ['Não foi possível redefinir a senha. O link pode ter expirado ou já ter sido usado. Solicite um novo.'], 'erro');
            btn.disabled = false;
            btn.textContent = 'Redefinir senha';
        }
    } catch {
        mostrar(msg, ['Não foi possível conectar ao servidor.'], 'erro');
        btn.disabled = false;
        btn.textContent = 'Redefinir senha';
    }
}

function mostrar(el, textos, tipo) {
    el.innerHTML = Array.isArray(textos)
        ? textos.map(t => `<p>${t}</p>`).join('')
        : `<p>${textos}</p>`;
    el.className = tipo;
    el.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const msg = document.getElementById('mensagem');

    // Sem token na URL não há como redefinir — desabilita o formulário
    if (!token) {
        mostrar(msg, ['Link inválido. Solicite uma nova recuperação de senha.'], 'erro');
        document.getElementById('btnRedefinir').disabled = true;
        return;
    }

    // Permite submeter com Enter nos campos de senha
    ['novaSenha', 'confirmarSenha'].forEach(id => {
        document.getElementById(id).addEventListener('keydown', e => {
            if (e.key === 'Enter') redefinirSenha();
        });
    });
});
