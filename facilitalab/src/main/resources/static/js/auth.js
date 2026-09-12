// authFetch — wrapper do fetch() que injeta o token JWT em todas as requisições.
// Redireciona para /login caso o token não exista no localStorage.
// Mescla os headers passados pelo chamador com o Authorization, garantindo
// que Content-Type e outros cabeçalhos customizados não sejam perdidos.
function authFetch(url, options = {}) {
    if (localStorage.getItem('token') === null) {
        window.location.href = '/login';
        return;
    }
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
    });
}
