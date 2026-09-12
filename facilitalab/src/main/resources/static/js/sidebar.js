// Carrega a sidebar a partir de um arquivo estático e define o item ativo.
// Substitui o th:replace + th:classappend do Thymeleaf.
async function carregarSidebar() {
    const res  = await fetch('/fragments/sidebar.html');
    const html = await res.text();
    document.getElementById('sidebar-container').innerHTML = html;

    document.querySelectorAll('.nav-item').forEach(a => {
        const perfis = a.getAttribute('data-perfil');
        if (perfis) {
            const perfilAtual = localStorage.getItem('perfil');
            const temAcesso = perfis.split(',').map(p => p.trim()).includes(perfilAtual);
            a.style.display = temAcesso ? '' : 'none';
        }
    });

    const path = window.location.pathname;

    document.querySelectorAll('.nav-item').forEach(a => {
        const href = a.getAttribute('href');
        // /editar-usuario/* pertence à seção de usuários; /editar-pedido/* à de pedidos
        const ativo = path === href
            || (href === '/lista-usuarios' && path.startsWith('/editar-usuario'))
            || (href === '/lista-pedidos'  && path.startsWith('/editar-pedido'))
            || (href === '/cadastro-pedido' && path === '/cadastro-pedido')
            || (href === '/triagem-pedido'  && path === '/triagem-pedido');
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
