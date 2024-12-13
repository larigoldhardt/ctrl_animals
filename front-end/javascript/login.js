const form = document.getElementById('container-login');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const login = document.getElementById('login').value;
    const senha = document.getElementById('senha').value;

    // Verifica se os campos foram preenchidos
    if (!login || !senha) {
        alert('Por favor, preencha os campos!');
        return;
    }

    try {
        console.log('Enviando dados:', { login, senha });  // Log para verificar o que está sendo enviado
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login, senha }),
        });

        console.log('Resposta do servidor:', response);  // Log para verificar a resposta do servidor

        const data = await response.json();
        console.log('Dados da resposta:', data);  // Log para mostrar os dados recebidos do servidor

        if (data.success) {
             // Salva as informações no localStorage
             localStorage.setItem('usuario_id', data.user.id);  // Salva o ID
             localStorage.setItem('usuario_nome', data.user.login);  // Salva o nome do usuário
            window.location.href = 'pg_inicial.html';  // Redireciona para a página de dashboard ou outra
        } else {
            alert('Usuário ou senha incorretos!');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Ocorreu um erro. Tente novamente.');
    }
});