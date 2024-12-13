// Seleciona os elementos do modal
const rotinaAlimenticiaBtn = document.getElementById('openModalEntrada');
const modal = document.getElementById('modalEntrada');
const infoLoteDiv = document.getElementById('infoLote');
const params = new URLSearchParams(window.location.search);
const loteId = params.get('id');

// Função para abrir o modal e carregar as informações do lote
async function abrirRotinaAlimenticia() {
    try {
        const response = await fetch(`http://localhost:3000/lotes/${loteId}`);
        const result = await response.json();

        if (response.ok) {
            const { registro, qtd_refeicoes, horario_refeicoes, qtd_alimento } = result.data;

            // Preenche as informações do modal
            infoLoteDiv.innerHTML = `
                <p><strong>Registro:</strong> ${registro}</p>
                <p><strong>Quantidade de Refeições:</strong> ${qtd_refeicoes}</p>
                <p><strong>Horário das Refeições:</strong> ${horario_refeicoes}</p>
                <p><strong>Quantidade de Alimento:</strong> ${qtd_alimento} kg</p>
            `;

            modalEntrada.style.display = 'block'; // Exibe o modal
        } else {
            alert('Erro ao carregar as informações do lote: ' + result.message);
        }
    } catch (err) {
        console.error('Erro ao carregar as informações do lote:', err);
        alert('Erro ao carregar as informações do lote.');
    }
}

// Evento para abrir o modal
rotinaAlimenticiaBtn.addEventListener('click', abrirRotinaAlimenticia);

function adicionarAnimalNaTabela(animal) {
    const tabelaBody = document.querySelector('.tabela-animais tbody');

    const linha = document.createElement('tr');
    linha.innerHTML = `
        <td>
            <button class="btn-editar" data-id="${animal.brinco}">
                <i class="fas fa-trash-alt"></i>
            </button>
            ${animal.brinco}
        </td>
        <td>${animal.raca}</td>
        <td>${animal.sexo}</td>
        <td>${animal.ano_nascimento}</td>
        <td>
            <button class="btn-vacina" data-id="${animal.brinco}">
                <i class="fas fa-syringe"></i>
            </button>
        </td>
    `;

    tabelaBody.appendChild(linha);
}

// Atualize o código de cadastro para chamar a função
document.getElementById('form-cadastro-animais').addEventListener('submit', async (event) => {
    event.preventDefault();

    const brinco = document.getElementById('brinco').value;
    const raca = document.getElementById('raca').value;
    const anoNascimento = document.getElementById('ano_nascimento').value;
    const pesoInicial = document.getElementById('peso_inicial').value;
    const sexo = document.getElementById('sexo').value;


    if (!brinco || !raca || !anoNascimento || !pesoInicial || !sexo || !loteId) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/animais', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                brinco,
                raca,
                ano_nascimento: anoNascimento,
                peso_inicial: pesoInicial,
                sexo,
                lote_id: loteId,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Animal cadastrado com sucesso!');
            document.getElementById('form-cadastro-animais').reset();
            document.getElementById('closeModalBtnS').click(); // Fecha o modal

            // Atualiza a tabela com o novo animal
            adicionarAnimalNaTabela({
                brinco,
                raca,
                ano_nascimento: anoNascimento,
                sexo,
            });
            carregarAnimais();
        } else {
            alert(`Erro ao cadastrar animal: ${result.message}`);
        }
    } catch (err) {
        console.error('Erro ao cadastrar animal:', err);
        alert('Erro ao cadastrar animal. Tente novamente.');
    }
});

function atualizarTotalAnimais(total) {
    const totalAnimaisElement = document.getElementById('total-animais');
    totalAnimaisElement.textContent = total; // Atualiza o texto com o total de animais
}

async function carregarAnimais() {

    if (!loteId) {
        console.error('ID do lote não encontrado na URL.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/animais?lote_id=${loteId}`);
        const result = await response.json();

        if (response.ok) {
            const tabelaBody = document.querySelector('.tabela-animais tbody');
            tabelaBody.innerHTML = ''; // Limpa a tabela antes de preencher

            result.data.forEach(animal => {
                adicionarAnimalNaTabela(animal); // Adiciona cada animal à tabela
            });
            // Atualiza o total de animais
            atualizarTotalAnimais(result.data.length);
        } else {
            console.error('Erro ao carregar animais:', result.message);
        }
    } catch (err) {
        console.error('Erro ao carregar animais:', err);
    }
}

// Chama a função ao carregar a página
document.addEventListener('DOMContentLoaded', carregarAnimais);


//modo vacinar
async function carregarInsumosSaude() {
    try {
        const response = await fetch('http://localhost:3000/insumos?tipo=saude');
        const result = await response.json();

        if (response.ok) {
            const insumoSelect = document.getElementById('insumo');
            insumoSelect.innerHTML = '<option value="" disabled selected>Selecione um insumo</option>';

            result.data.forEach(insumo => {
                const option = document.createElement('option');
                option.value = insumo.id; // ID do insumo
                option.textContent = insumo.produto; // Nome do insumo
                insumoSelect.appendChild(option);
            });
        } else {
            console.error('Erro ao carregar insumos:', result.message);
        }
    } catch (err) {
        console.error('Erro ao carregar insumos:', err);
    }
}

// Carrega os insumos ao abrir o modal
document.getElementById('openModalCadastro').addEventListener('click', carregarInsumosSaude);

document.getElementById('modo-vacinar').addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!loteId) {
        alert('Erro: ID do lote não encontrado.');
        return;
    }

    const insumoId = document.getElementById('insumo').value;
    const quantidade = document.getElementById('quantidade').value;
    const dataAplicacao = document.getElementById('dataAplicacao').value;

    if (!insumoId || !quantidade || !dataAplicacao) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/lotes/${loteId}/vacinar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                insumo_id: insumoId,
                quantidade,
                data_aplicacao: dataAplicacao,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Vacinação registrada com sucesso!');
            document.getElementById('modo-vacinar').reset();
            document.getElementById('closeModalBtn').click(); // Fecha o modal
        } else {
            alert(`Erro ao registrar vacinação: ${result.message}`);
        }
    } catch (err) {
        console.error('Erro ao registrar vacinação:', err);
        alert('Erro ao registrar vacinação. Tente novamente.');
    }
});

async function excluirAnimal(brinco) {
    if (!brinco) {
        console.error('ID do brinco não encontrado.');
        return;
    }

    if (!confirm('Tem certeza que deseja excluir este animal?')) {
        return;
    }
    console.log(brinco);

    try {
        const response = await fetch(`http://localhost:3000/animais/${encodeURIComponent(brinco)}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
            alert('Animal excluído com sucesso!');
            // Remove a linha correspondente da tabela
            document.querySelector(`button[data-id="${brinco}"]`).closest('tr').remove();
        } else {
            alert(`Erro ao excluir animal: ${result.message}`);
        }
    } catch (err) {
        console.error('Erro ao excluir animal:', err);
        alert('Erro ao excluir animal. Tente novamente.');
    }
}

// Adiciona o evento de clique para os botões de exclusão
document.querySelector('.tabela-animais tbody').addEventListener('click', (event) => {
    const button = event.target.closest('button.btn-editar'); // Verifica o botão clicado

    if (button) {
        const brinco = button.dataset.id; // Captura o ID do brinco
        excluirAnimal(brinco); // Chama a função de exclusão
    }
});

// Captura o clique no botão de vacinação
document.querySelector('.tabela-animais tbody').addEventListener('click', (event) => {
    const button = event.target.closest('button.btn-vacina');
    
    if (button) {
        const brinco = button.dataset.id; // Obtém o ID do brinco do atributo data-id
        if (brinco) {
            // Redireciona para a página do cartão de vacinação
            window.location.href = `cartao_vacinacao.html?brinco=${encodeURIComponent(brinco)}`;
        } else {
            console.error('Brinco não encontrado.');
        }
    }
});