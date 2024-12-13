    // Obtendo os dados do localStorage
    const usuarioNome = localStorage.getItem('usuario_nome');

    // Exibindo o nome do usuário na página
    document.getElementById('usuario-name').textContent = usuarioNome;

    const logout = document.getElementById('logout')
    if(logout){
    // Adiciona o evento de clique ao botão de sair
    document.querySelector('.logout').addEventListener('click', () => {
    // Opção 1: Remover informações do usuário da sessão (localStorage ou sessionStorage)
    localStorage.clear; // Remova a chave usada para armazenar os dados do usuário

    window.location.href = './pg_login.html'; // Ajuste o caminho para a página de login
    });
}