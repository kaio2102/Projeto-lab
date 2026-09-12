async function recuperarSenha() {
    const btn = document.getElementById('btnRecuperar');
    const msg = document.getElementById('mensagem');

    const email = document.getElementById('email').value.trim();

    if (!email) {
        mostrar(msg, ['O e-mail é obrigatório.'], 'erro');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';
    msg.className = '';
    msg.style.display = 'none';

    try {
        const res = await fetch('/auth/recuperar-senha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (res.ok) {
            mostrar(msg, ['Se este e-mail estiver cadastrado, você receberá as instruções em breve.'], 'sucesso');
        } else {
            mostrar(msg, [`Erro ${res.status}. Tente novamente.`], 'erro');
        }
    } catch {
        mostrar(msg, ['Não foi possível conectar ao servidor.'], 'erro');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Enviar instruções';
    }
}

function mostrar(el, textos, tipo) {
    el.innerHTML = Array.isArray(textos)
        ? textos.map(t => `<p>${t}</p>`).join('')
        : `<p>${textos}</p>`;
    el.className = tipo;
    el.style.display = 'block';
}

// Permite submeter com Enter no campo de e-mail
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('email').addEventListener('keydown', e => {
        if (e.key === 'Enter') recuperarSenha();
    });
});
