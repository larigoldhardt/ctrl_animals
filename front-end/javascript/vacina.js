// Captura o brinco do animal a partir da URL
function getBrincoFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('brinco');
}

// Função para carregar os dados do animal
async function carregarDadosAnimal() {
    const brinco = getBrincoFromURL();
    if (!brinco) {
        alert('Brinco do animal não encontrado na URL.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/animais/${encodeURIComponent(brinco)}`);
        const result = await response.json();

        if (response.ok && result.success) {
            document.getElementById('animal-brinco').textContent = result.data.brinco;
            document.getElementById('animal-raca').textContent = result.data.raca;
            document.getElementById('animal-sexo').textContent = result.data.sexo;
            document.getElementById('animal-ano').textContent = result.data.ano_nascimento;
        } else {
            console.error('Erro ao carregar dados do animal:', result.message);
        }
    } catch (err) {
        console.error('Erro ao buscar dados do animal:', err);
    }
}

// Função para carregar o histórico de vacinas
async function carregarHistoricoVacinas() {
    const brinco = getBrincoFromURL();

    try {
        const response = await fetch(`http://localhost:3000/carteira_vacinacao/${encodeURIComponent(brinco)}`);
        const result = await response.json();

        if (response.ok && result.success) {
            const tbody = document.querySelector('#vacinas tbody');
            tbody.innerHTML = result.data
                .map(vacina => `
                    <tr>
                        <td>${new Date(vacina.data_aplicacao).toLocaleDateString()}</td>
                        <td>${vacina.insumo}</td>
                        <td>${vacina.quantidade}</td>
                    </tr>
                `)
                .join('');
        } else {
            console.error('Erro ao carregar histórico de vacinas:', result.message);
        }
    } catch (err) {
        console.error('Erro ao carregar histórico de vacinas:', err);
    }
}

// Função para carregar insumos de saúde no formulário
async function carregarInsumos() {
    try {
        const response = await fetch('http://localhost:3000/insumos?tipo=saude');
        const result = await response.json();

        if (response.ok) {
            const insumoSelect = document.getElementById('insumo');
            insumoSelect.innerHTML = result.data
                .map(insumo => `<option value="${insumo.id}">${insumo.produto}</option>`)
                .join('');
        } else {
            console.error('Erro ao carregar insumos:', result.message);
        }
    } catch (err) {
        console.error('Erro ao carregar insumos:', err);
    }
}

// Função para adicionar insumo
document.getElementById('form-adicionar-insumo').addEventListener('submit', async (event) => {
    event.preventDefault();

    const brinco = getBrincoFromURL();
    const insumo = document.getElementById('insumo').value;
    const quantidade = document.getElementById('quantidade').value;
    const dataAplicacao = document.getElementById('data-aplicacao').value;

    if (!insumo || !quantidade || !dataAplicacao) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/carteira_vacinacao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                animal_brinco: brinco,
                id_insumo: insumo,
                quantidade,
                data_aplicacao: dataAplicacao
            })
        });

        if (response.ok) {
            alert('Vacina adicionada com sucesso!');
            carregarHistoricoVacinas(); // Atualiza o histórico
        } else {
            const result = await response.json();
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error('Erro ao adicionar vacina:', err);
    }
});

// Inicializa os dados ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosAnimal();
    carregarHistoricoVacinas();
    carregarInsumos();
});
