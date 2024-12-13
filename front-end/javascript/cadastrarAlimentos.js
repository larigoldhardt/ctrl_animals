const tableBody = document.querySelector('#insumoscadastrados tbody');
const formCadastro = document.getElementById('cadastrarinsumos');

// Função para formatar a data no formato DD/MM/AAAA
function formatarData(dataISO) {
    if (!dataISO || dataISO === '0000-00-00') {
        return 'Sem validade'; // Retorna uma string padrão se a data for inválida
    }

    // Verifica se a data já está no formato DD/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataISO)) {
        return dataISO; // Retorna a data diretamente se já estiver formatada
    }

    // Caso contrário, processa como ISO
    const data = new Date(dataISO);
    if (isNaN(data.getTime())) {
        console.error('Data inválida recebida:', dataISO);
        return 'Sem validade';
    }

    const dia = String(data.getUTCDate()).padStart(2, '0');
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
    const ano = data.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Função para adicionar uma linha à tabela
function adicionarInsumoNaTabela(produto, validade, quantidade, id) {
    if (!id) {
        console.error('ID do insumo não encontrado.');
        return;
    }

    const novaValidade = formatarData(validade); // Formata a validade
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-id', id); // Atribui um ID ao elemento da linha

    newRow.innerHTML = `
        <td>${produto}</td>
        <td>${novaValidade}</td>
        <td>${quantidade}</td>
        <td>
            <i class="fas fa-trash-alt btn-excluir" data-id="${id}" style="cursor: pointer;"></i>
        </td>
    `;

    tableBody.appendChild(newRow);

    // Adiciona o evento de clique para o botão de excluir
    newRow.querySelector('.btn-excluir').addEventListener('click', async () => {
        try {
            const response = await fetch(`http://localhost:3000/saude/insumos/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (response.ok) {
                alert('Insumo excluído com sucesso!');
                newRow.remove(); // Remove a linha da tabela
            } else {
                alert(`Erro ao excluir insumo: ${result.message}`);
            }
        } catch (err) {
            console.error('Erro ao excluir insumo:', err);
            alert('Erro ao excluir insumo. Tente novamente.');
        }
    });
}
    
// Função para carregar os insumos existentes ao abrir a página
async function carregarEstoque() {
    try {
        const response = await fetch('http://localhost:3000/racao/estoque');
        const result = await response.json();

        if (response.ok) {
            tableBody.innerHTML = '';
            result.data.forEach(insumo => {
                if (insumo.id) { // Verifica se o ID existe
                    adicionarInsumoNaTabela(
                        insumo.produto,
                        formatarData(insumo.validade_proxima), // Validade mais próxima (formatada)
                        insumo.estoque_atual, // Estoque atual calculado
                        insumo.id // ID do insumo
                    );
                } else {
                    console.error('ID do insumo não encontrado.');
                }
            });
        } else {
            console.error('Erro ao carregar o estoque:', result.message);
        }
    } catch (err) {
        console.error('Erro ao carregar o estoque:', err);
    }
}

// Chama a função ao carregar a página
window.addEventListener('DOMContentLoaded', carregarEstoque);

formCadastro.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita o envio padrão do formulário

    // Captura os valores do formulário
    const idFazenda = document.getElementById('fazendaSelect').value;
    const insumo = document.getElementById('insumoNovo').value;
    const validade = document.getElementById('validadeNovo').value;
    const quantidade = document.getElementById('quantidadeNovo').value;

   // Validação simples
   if (!idFazenda || !insumo || !validade || !quantidade) {
    alert('Por favor, preencha todos os campos.');
    return;
    }

    // Cria o objeto para envio
    const data = {
        produto: insumo,
        validade: validade,
        qtd: quantidade,
        tipo: 'racao', // Valor padrão
        registro: 'entrada', // Valor padrão
        id_fazenda: idFazenda // ID da fazenda selecionada
    };

    try {
        // Envia os dados para o backend
        const response = await fetch('http://localhost:3000/racao/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            // Insere o novo insumo na tabela
            adicionarInsumoNaTabela(insumo, validade, quantidade, result.id);
            // Exibe mensagem de sucesso
            alert('Cadastro realizado com sucesso!');
            formCadastro.reset();  
            carregarEstoque();          
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error('Erro na requisição:', err);
        alert('Erro ao cadastrar o insumo. Tente novamente.');
    }
});

// Seleciona o formulário de entrada
const formEntrada = document.querySelector('#form-Entrada');

// Função para carregar insumos no select
async function carregarInsumos() {
    try {
        const response = await fetch('http://localhost:3000/racao/insumos');
        const result = await response.json();

        if (response.ok) {
            const selectInsumo = document.querySelector('#insumoEn');
            result.data.forEach(insumo => {
                const option = document.createElement('option');
                option.value = insumo.produto; // Use o valor do produto
                option.textContent = insumo.produto; // Texto exibido no dropdown
                selectInsumo.appendChild(option);
            });
        } else {
            console.error('Erro ao carregar insumos:', result.message);
        }
    } catch (err) {
        console.error('Erro ao carregar insumos:', err);
    }
}

// Função para registrar nova entrada
formEntrada.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita o envio padrão do formulário

    const fazenda = document.querySelector('#fazendaEn').value;
    const insumo = document.querySelector('#insumoEn').value;
    const validade = document.querySelector('#validadeEn').value;
    const quantidade = document.querySelector('#quantidadeEn').value;

    if (!fazenda || !insumo || !validade || !quantidade) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/racao/entrada', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ insumo, validade, quantidade, fazenda  })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Entrada cadastrada com sucesso!');
            formEntrada.reset(); // Limpa o formulário
            document.querySelector('#closeModalBtnE').click(); // Fecha o modal
            carregarEstoque(); // Recarrega a tabela para mostrar a atualização
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error('Erro ao registrar entrada:', err);
        alert('Erro ao registrar entrada. Tente novamente.');
    }
});

// Carregar insumos ao abrir a página
document.addEventListener('DOMContentLoaded', carregarInsumos);


async function carregarInsumosSaida() {
    try {
        const response = await fetch('http://localhost:3000/racao/insumos');
        const result = await response.json();

        if (response.ok) {
            const selectInsumo = document.querySelector('#insumoSa');
            selectInsumo.innerHTML = `<option value="" disabled selected>Selecione um insumo</option>`; // Limpa o select antes de preencher

            result.data.forEach(insumo => {
                const option = document.createElement('option');
                option.value = insumo.produto; // Use o valor do produto
                option.textContent = insumo.produto; // Texto exibido no dropdown
                selectInsumo.appendChild(option);
            });
        } else {
            console.error('Erro ao carregar insumos:', result.message);
        }
    } catch (err) {
        console.error('Erro ao carregar insumos:', err);
    }
}

// Carregar insumos ao abrir a página
document.addEventListener('DOMContentLoaded', carregarInsumosSaida);


document.querySelector('#form-saida').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita o envio padrão do formulário

    const fazenda = document.querySelector('#fazendaSa').value;
    const insumo = document.querySelector('#insumoSa').value;
    const validade = document.querySelector('#validadeSa').value;
    const quantidade = document.querySelector('#quantidadeSa').value;

    if (!fazenda || !insumo || !validade || !quantidade) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/racao/saida', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ insumo, validade, quantidade,fazenda })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Saída registrada com sucesso!');
            document.querySelector('#form-saida').reset(); // Limpa o formulário
            document.querySelector('#closeModalBtnS').click(); // Fecha o modal
            carregarEstoque(); // Atualiza a tabela
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error('Erro ao registrar saída:', err);
        alert('Erro ao registrar saída. Tente novamente.');
    }
});

async function carregarFazendas() {
    try {
        const response = await fetch('http://localhost:3000/fazendas'); // Certifique-se de que a rota está correta
        const result = await response.json();

        if (response.ok) {
            // Listas de selects para popular
            const selects = [
                document.querySelector('#fazendaEn'),  // Select do modal de entrada
                document.querySelector('#fazendaSa'), // Select do modal de saída
                document.querySelector('#fazendaSelect') // Select do modal de cadastrar novo insumo
            ];

            // Itera sobre os selects e popula todos
            selects.forEach(select => {
                if (select) {
                    select.innerHTML = '<option value="" disabled selected>Selecione uma fazenda</option>';
                    result.data.forEach(fazenda => {
                        const option = document.createElement('option');
                        option.value = fazenda.id;
                        option.textContent = fazenda.nome;
                        select.appendChild(option);
                    });
                }
            });
        } else {
            console.error('Erro ao carregar fazendas:', result.message);
        }
    } catch (err) {
        console.error('Erro ao carregar fazendas:', err);
    }
}

// Chama a função para carregar as fazendas ao abrir a página
document.addEventListener('DOMContentLoaded', carregarFazendas);