async function carregarSidebar() {
    const res = await fetch('/fragments/sidebar.html');
    const html = await res.text();
    const container = document.getElementById('sidebar-container');
    container.innerHTML = html;

    // Filtra QUALQUER elemento com data-perfil — mas só dentro da sidebar
    container.querySelectorAll('[data-perfil]').forEach(el => {
        const perfis = el.getAttribute('data-perfil');
        const perfilAtual = localStorage.getItem('perfil');
        const temAcesso = perfis.split(',').map(p => p.trim()).includes(perfilAtual);
        el.style.display = temAcesso ? '' : 'none';
    });

    const path = window.location.pathname;

    container.querySelectorAll('.nav-item').forEach(a => {
        const href = a.getAttribute('href');
        const ativo = path === href
            || (href === '/lista-usuarios' && path.startsWith('/editar-usuario'))
            || (href === '/lista-pedidos' && path.startsWith('/editar-pedido'));
        a.classList.toggle('active', ativo);
    });
}

carregarSidebar();

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    localStorage.removeItem('perfil');
    window.location.href = '/login';
}