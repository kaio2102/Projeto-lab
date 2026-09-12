const id = window.location.pathname.split('/').pop();

async function carregarDentistas(dentistaId) {
    const sel = document.getElementById('dentistaId');
    try {
        const res = await authFetch('/usuarios/perfil/DENTISTA');
        const dentistas = await res.json();
        sel.innerHTML = '<option value="">Selecione o dentista...</option>';
        dentistas.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.nome;
            if (d.id === dentistaId) opt.selected = true;
            sel.appendChild(opt);
        });
    } catch {
        sel.innerHTML = '<option value="">Erro ao carregar dentistas</option>';
    }
}

async function carregarPedido() {
    try {
        const res = await authFetch(`/pedidos/id/${id}`);
        if (!res.ok) throw new Error();
        const p = await res.json();

        document.getElementById('cor').value          = p.cor ?? '';
        document.getElementById('tipoProtese').value  = p.tipoProtese ?? '';
        document.getElementById('material').value     = p.material ?? '';
        document.getElementById('prioridade').value   = p.prioridade ?? 'NORMAL';
        document.getElementById('prazoEntrega').value = p.prazoEntrega ?? '';
        document.getElementById('observacoes').value  = p.observacoes ?? '';

        await carregarDentistas(p.dentistaId);
    } catch {
        mostrar(document.getElementById('mensagem'), ['Erro ao carregar dados do pedido.'], 'erro');
    }
}

async function salvar() {
    const btn = document.getElementById('btnSalvar');
    const msg = document.getElementById('mensagem');

    const body = {
        cor:          document.getElementById('cor').value.trim(),
        tipoProtese:  document.getElementById('tipoProtese').value,
        material:     document.getElementById('material').value,
        prioridade:   document.getElementById('prioridade').value,
        prazoEntrega: document.getElementById('prazoEntrega').value,
        dentistaId:   document.getElementById('dentistaId').value
            ? Number(document.getElementById('dentistaId').value)
            : null,
        observacoes:  document.getElementById('observacoes').value.trim() || null,
    };

    const erros = [];

    if (!body.cor) {
        erros.push('A cor é obrigatória.');
    } else if (body.cor.length > 50) {
        erros.push('A cor deve ter no máximo 50 caracteres.');
    }

    if (!body.tipoProtese) erros.push('O tipo de prótese é obrigatório.');
    if (!body.material)    erros.push('O material é obrigatório.');
    if (!body.prioridade)  erros.push('A prioridade é obrigatória.');
    if (!body.prazoEntrega) erros.push('O prazo de entrega é obrigatório.');
    if (!body.dentistaId)  erros.push('O dentista é obrigatório.');

    if (erros.length > 0) {
        mostrar(msg, erros, 'erro');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Salvando...';
    msg.className = '';
    msg.style.display = 'none';

    try {
        const res = await authFetch(`/pedidos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.status === 200) {
            window.location.href = '/lista-pedidos';
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

carregarPedido();
