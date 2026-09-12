// Formata CPF como 000.000.000-00 enquanto o usuário digita
function aplicarMascaraCpf(input) {
    input.addEventListener('input', () => {
        let v = input.value.replace(/\D/g, '').slice(0, 11);
        if      (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
        else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
        else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, '$1.$2');
        input.value = v;
    });
}

// Formata telefone como (00) 00000-0000 (celular) ou (00) 0000-0000 (fixo)
function aplicarMascaraTelefone(input) {
    input.addEventListener('input', () => {
        let v = input.value.replace(/\D/g, '').slice(0, 11);
        if      (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        else if (v.length > 6)  v = v.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
        else if (v.length > 2)  v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        else if (v.length > 0)  v = '(' + v;
        input.value = v;
    });
}

// CRO: converte para maiúsculas e permite apenas letras, dígitos, hífen e espaço
function aplicarMascaraCro(input) {
    input.addEventListener('input', () => {
        input.value = input.value.toUpperCase().replace(/[^A-Z0-9\-\s]/g, '');
    });
}

// Formata um CPF de 11 dígitos para exibição (usado ao carregar dados da API)
function formatarCpf(cpf) {
    const v = (cpf ?? '').replace(/\D/g, '').slice(0, 11);
    if (v.length === 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    return v;
}

// Formata um telefone de 10 ou 11 dígitos para exibição (usado ao carregar dados da API)
function formatarTelefone(tel) {
    const v = (tel ?? '').replace(/\D/g, '').slice(0, 11);
    if (v.length === 11) return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (v.length === 10) return v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return v;
}

// Inicializa todas as máscaras dos campos presentes na página
function inicializarMascaras() {
    const cpfInput = document.getElementById('cpf');
    const telInput = document.getElementById('telefone');
    const croInput = document.getElementById('cro');

    if (cpfInput) aplicarMascaraCpf(cpfInput);
    if (telInput) aplicarMascaraTelefone(telInput);
    if (croInput) aplicarMascaraCro(croInput);
}

document.addEventListener('DOMContentLoaded', inicializarMascaras);
