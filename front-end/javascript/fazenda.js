const fazendasContainer = document.getElementById("fazendas-container");

async function carregarFazendas() {
    try {
        const response = await fetch('http://localhost:3000/listafazendas');
        const result = await response.json();

        if (response.ok && Array.isArray(result.data)) {
            const fazendas = result.data;
            fazendasContainer.innerHTML = ''; // Limpa o contêiner
            console.log('Fazendas carregadas:', fazendas);

            fazendas.forEach(fazenda => {
                console.log('Renderizando fazenda:', fazenda);

                // Cria o elemento da fazenda
                const fazendaDiv = document.createElement('div');
                fazendaDiv.className = 'fazenda';
                fazendaDiv.dataset.id = fazenda.id;

                fazendaDiv.innerHTML = `
                    <span class="seta">&#8250;</span> <!-- Seta inicial -->
                    <span class="nome-fazenda">${fazenda.nome} - ${fazenda.local} (${fazenda.estado})</span>
                
                `;

                fazendaDiv.addEventListener('click', (event) => {
                    if (event.target.tagName === 'INPUT' || event.target.classList.contains('editar')) return;

                    const lotesDiv = fazendaDiv.nextElementSibling;
                    if (!lotesDiv) {
                        console.warn('Lotes não encontrados para a fazenda:', fazenda.id);
                        return;
                    }

                    const seta = fazendaDiv.querySelector('.seta');
                    if (lotesDiv.style.display === 'block') {
                        lotesDiv.style.display = 'none';
                        seta.innerHTML = '&#8250;';
                    } else {
                        lotesDiv.style.display = 'block';
                        seta.innerHTML = '&#9660;';
                    }
                });

                fazendasContainer.appendChild(fazendaDiv);

                // Cria o contêiner de lotes
                const lotesDiv = document.createElement('div');
                lotesDiv.className = 'lotes';

                fazenda.lotes.forEach(lote => {
                    const loteDiv = document.createElement('div');
                    loteDiv.className = 'lote';
                    loteDiv.innerHTML = `
                        <a href="pg_lotes.html?id=${lote.id}" class="lote-link">
                            <span>${lote.registro}</span>
                        </a>
                    `;
                    lotesDiv.appendChild(loteDiv);
                });

                fazendasContainer.appendChild(lotesDiv);
            });
        } else {
            console.error('Erro ao carregar fazendas:', result.message || 'Formato inválido de resposta.');
        }
    } catch (err) {
        console.error('Erro ao carregar fazendas:', err);
    }
}
// Carrega as fazendas ao abrir a página
document.addEventListener('DOMContentLoaded', carregarFazendas);

const formCadastroFazenda = document.querySelector('#modalEntrada form');

formCadastroFazenda.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita o envio padrão do formulário

    const nome = document.querySelector('#fazenda').value;
    const local = document.querySelector('#cidade').value;
    const estado = document.querySelector('#estado').value;

    if (!nome || !cidade || !estado) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/fazendas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, local, estado })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Fazenda cadastrada com sucesso!');
            formCadastroFazenda.reset();
            document.querySelector('#closeModalBtnE').click(); // Fecha o modal
            carregarFazendas(); // Recarrega a lista de fazendas
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error('Erro ao cadastrar fazenda:', err);
        alert('Erro ao cadastrar fazenda. Tente novamente.');
    }
});


async function carregarFazendasLotes() {
    try {
        const response = await fetch('http://localhost:3000/fazendas');
        const result = await response.json();

        if (response.ok && Array.isArray(result.data)) {
            const selectFazenda = document.querySelector('#fazendaLote');
            selectFazenda.innerHTML = '<option value="" disabled selected>Selecione uma fazenda</option>';

            result.data.forEach(fazenda => {
                const option = document.createElement('option');
                option.value = fazenda.id;
                option.textContent = `${fazenda.nome} - ${fazenda.local} (${fazenda.estado})`;
                selectFazenda.appendChild(option);
            });
        } else {
            console.error('Erro ao carregar fazendas:', result.message || 'Resposta inválida do servidor.');
        }
    } catch (err) {
        console.error('Erro ao carregar fazendas:', err);
    }
}

// Chama a função ao abrir o modal
document.getElementById('openModalSaida').addEventListener('click', carregarFazendasLotes);



document.getElementById('form-cadastro-lote').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fazendaId = document.getElementById('fazendaLote').value;
    const registro = document.getElementById('reg').value;
    const qtdRefeicoes = document.getElementById('qtd_refeicoes').value;
    const horarioRefeicoes = document.getElementById('horario_refeicoes').value;
    const qtdAlimento = document.getElementById('qtd_alimento').value;

    if (!fazendaId || !registro || !qtdRefeicoes || !horarioRefeicoes || !qtdAlimento) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/lotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                registro,
                qtd_refeicoes: qtdRefeicoes,
                horario_refeicoes: horarioRefeicoes,
                qtd_alimento: qtdAlimento,
                fazenda_id: fazendaId,
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Lote cadastrado com sucesso!');
            document.getElementById('form-cadastro-lote').reset();
            carregarFazendas(); // Recarrega a lista de fazendas;
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error('Erro ao cadastrar lote:', err);
        alert('Erro ao cadastrar lote. Tente novamente.');
    }
});

