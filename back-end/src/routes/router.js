import { Router } from "express";
import db from '../db/mysql.js'

const router = Router();

// Rota de login
router.post('/login', async (req, res) => {
    const { login, senha } = req.body;

    if (!login || !senha) {
        return res.status(400).json({ success: false, message: 'Login e senha são obrigatórios.' });
    }

    try {
        // Consulta ao banco de dados para verificar se existe o usuário com a senha fornecida
        const [results] = await db.execute('SELECT * FROM usuarios WHERE login = ? AND senha = ?', [login, senha]);

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos.' });
        }

        // Sucesso! Usuário encontrado
        res.json({ success: true, message: 'Login bem-sucedido!', user: results[0] });
    } catch (err) {
        console.error('Erro ao consultar o banco:', err);
        return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }
});

router.delete('/animais/:brinco', async (req, res) => {
    console.log('Rota DELETE /animais/:brinco acessada'); // Log inicial
    const { brinco } = req.params;
    console.log('Brinco capturado no backend:', brinco); // Log para o brinco
    if (!brinco) {
        return res.status(400).json({ success: false, message: 'O brinco do animal é obrigatório.' });
    }

    try {
        // Exclui os registros da carteira de saúde associados ao animal
        const queryCarteira = 'DELETE FROM carteira_saude WHERE animal_brinco = ?';
        await db.execute(queryCarteira, [brinco]);

        // Exclui o animal da tabela animal
        const queryAnimal = 'DELETE FROM animal WHERE brinco = ?';
        const [result] = await db.execute(queryAnimal, [brinco]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Animal não encontrado.' });
        }

        res.status(200).json({ success: true, message: 'Animal excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir animal:', err);
        res.status(500).json({ success: false, message: 'Erro ao excluir animal.' });
    }
});

//Cadastrar um insumo do armazém de saúde
router.post('/saude/cadastro', async (req, res) => {
    const { produto, validade, qtd, tipo, registro, id_fazenda } = req.body;

    if (!produto || !validade || !qtd || !tipo || !registro || !id_fazenda) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const query = `
            INSERT INTO armazens (produto, validade, qtd, tipo, registro, id_fazenda)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const [result] = await db.execute(query, [produto, validade, qtd, tipo, registro, id_fazenda]);

        res.status(201).json({ success: true, message: 'Insumo cadastrado com sucesso!', id: result.insertId });
    } catch (err) {
        console.error('Erro ao cadastrar insumo:', err);
        res.status(500).json({ success: false, message: 'Erro ao cadastrar insumo.' });
    }
});

//Rota para deletar os insumos do armazém de saúde
router.delete('/saude/insumos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Query para excluir o insumo pelo ID
        const query = 'DELETE FROM armazens WHERE id = ?';
        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Insumo não encontrado.' });
        }

        res.status(200).json({ success: true, message: 'Insumo excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir insumo:', err);
        res.status(500).json({ success: false, message: 'Erro ao excluir insumo.' });
    }
});

//Rota para atualizar a quantidade atual do produto
router.get('/saude/estoque', async (req, res) => {
    try {
        const query = `
            SELECT 
                MIN(id) AS id, 
                produto, 
                SUM(CASE WHEN registro = 'entrada' THEN qtd ELSE 0 END) AS entradas,
                SUM(CASE WHEN registro = 'saida' THEN qtd ELSE 0 END) AS saidas,
                (SUM(CASE WHEN registro = 'entrada' THEN qtd ELSE 0 END) - 
                 SUM(CASE WHEN registro = 'saida' THEN qtd ELSE 0 END)) AS estoque_atual,
                COALESCE(MIN(validade), '0000-00-00') AS validade_proxima
            FROM armazens
            WHERE tipo = 'saude' -- Filtra apenas pelo tipo 'saude'
            GROUP BY produto
            ORDER BY produto;
        `;
        const [results] = await db.execute(query);

        // Log dos resultados para verificar o que está sendo retornado
        console.log('Resultados do banco:', results);

        res.status(200).json({ success: true, data: results });
    } catch (err) {
        console.error('Erro ao calcular o estoque:', err);
        res.status(500).json({ success: false, message: 'Erro ao calcular o estoque.' });
    }
});

//Rota para buscar os insumos do tipo saude
router.get('/saude/insumos', async (req, res) => {
    try {
        const query = `
            SELECT produto 
            FROM armazens 
            WHERE tipo = 'saude'
            GROUP BY produto
            ORDER BY produto;
        `;
        const [results] = await db.execute(query);

        res.status(200).json({ success: true, data: results });
    } catch (err) {
        console.error('Erro ao buscar insumos de saúde:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar insumos.' });
    }
});

//ROta para adicionar uma nova entrada
router.post('/saude/entrada', async (req, res) => {
    const { insumo, validade, quantidade, fazenda } = req.body;

    // Validação dos campos
    if (!insumo || !validade || !quantidade || !fazenda) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const query = `
            INSERT INTO armazens (produto, validade, qtd, tipo, registro, id_fazenda)
            VALUES (?, ?, ?, 'saude', 'entrada', ?);
        `;
        await db.execute(query, [insumo, validade, quantidade, fazenda]);

        res.status(201).json({ success: true, message: 'Entrada registrada com sucesso!' });
    } catch (err) {
        console.error('Erro ao registrar entrada:', err);
        res.status(500).json({ success: false, message: 'Erro ao registrar entrada.' });
    }
});


//Rota para adicionar uma nova saida
router.post('/saude/saida', async (req, res) => {
    const { insumo, validade, quantidade, fazenda } = req.body;

    // Validação dos campos
    if (!insumo || !validade || !quantidade || !fazenda) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const query = `
            INSERT INTO armazens (produto, validade, qtd, tipo, registro, id_fazenda)
            VALUES (?, ?, ?, 'saude', 'saida', ?);
        `;
        await db.execute(query, [insumo, validade, quantidade, fazenda]);

        res.status(201).json({ success: true, message: 'Saída registrada com sucesso!' });
    } catch (err) {
        console.error('Erro ao registrar saída:', err);
        res.status(500).json({ success: false, message: 'Erro ao registrar saída.' });
    }
});

//Rota para atualizar a quantidade atual do produto alimento
router.get('/racao/estoque', async (req, res) => {
    try {
        const query = `
            SELECT 
                MIN(id) AS id, 
                produto, 
                SUM(CASE WHEN registro = 'entrada' THEN qtd ELSE 0 END) AS entradas,
                SUM(CASE WHEN registro = 'saida' THEN qtd ELSE 0 END) AS saidas,
                (SUM(CASE WHEN registro = 'entrada' THEN qtd ELSE 0 END) - 
                 SUM(CASE WHEN registro = 'saida' THEN qtd ELSE 0 END)) AS estoque_atual,
                COALESCE(MIN(validade), '0000-00-00') AS validade_proxima
            FROM armazens
            WHERE tipo = 'racao'
            GROUP BY produto
            ORDER BY produto;
        `;
        const [results] = await db.execute(query);

        // Log dos resultados para verificar o que está sendo retornado
        console.log('Resultados do banco:', results);

        res.status(200).json({ success: true, data: results });
    } catch (err) {
        console.error('Erro ao calcular o estoque:', err);
        res.status(500).json({ success: false, message: 'Erro ao calcular o estoque.' });
    }
});

//Cadastrar um insumo de alimento
router.post('/racao/cadastro', async (req, res) => {
    const { produto, validade, qtd, tipo = 'racao', registro = 'entrada', id_fazenda } = req.body;

    // Validação de dados
    if (!produto || !validade || !qtd || !id_fazenda) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Query de inserção no banco
        const query = `
            INSERT INTO armazens (produto, validade, qtd, tipo, registro, id_fazenda) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        // Executa a query com os valores recebidos
        const [result] = await db.execute(query, [produto, validade, qtd, tipo, registro, id_fazenda]);

        // Responde com sucesso
        res.status(201).json({ success: true, message: 'Insumo cadastrado com sucesso!',id: result.insertId });
    } catch (err) {
        console.error('Erro ao inserir no banco:', err);
        res.status(500).json({ success: false, message: 'Erro no servidor ao cadastrar insumo.' });
    }
});

//Rota para buscar os insumos do tipo alimentos
router.get('/racao/insumos', async (req, res) => {
    try {
        const query = `
            SELECT produto 
            FROM armazens 
            WHERE tipo = 'racao'
            GROUP BY produto
            ORDER BY produto;
        `;
        const [results] = await db.execute(query);

        res.status(200).json({ success: true, data: results });
    } catch (err) {
        console.error('Erro ao buscar insumos de saúde:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar insumos.' });
    }
});

//ROta para adicionar uma nova entrada de alimento
router.post('/racao/entrada', async (req, res) => {
    const { insumo, validade, quantidade, fazenda } = req.body;

    if (!insumo || !validade || !quantidade || !fazenda) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const query = `
            INSERT INTO armazens (produto, validade, qtd, tipo, registro, id_fazenda)
            VALUES (?, ?, ?, 'racao', 'entrada', ?);
        `;
        await db.execute(query, [insumo, validade, quantidade, fazenda]);

        res.status(201).json({ success: true, message: 'Entrada registrada com sucesso!' });
    } catch (err) {
        console.error('Erro ao registrar entrada:', err);
        res.status(500).json({ success: false, message: 'Erro ao registrar entrada.' });
    }
});

//Rota para adicionar uma nova saida
router.post('/racao/saida', async (req, res) => {
    const { insumo, validade, quantidade, fazenda } = req.body;

    if (!insumo || !validade || !quantidade || !fazenda) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const query = `
            INSERT INTO armazens (produto, validade, qtd, tipo, registro, , id_fazenda)
            VALUES (?, ?, ?, 'racao', 'saida', ?);
        `;
        await db.execute(query, [insumo, validade, quantidade, fazenda]);

        res.status(201).json({ success: true, message: 'Saída registrada com sucesso!' });
    } catch (err) {
        console.error('Erro ao registrar saída:', err);
        res.status(500).json({ success: false, message: 'Erro ao registrar saída.' });
    }
});

//Rota pegar as fazendas do banco
router.get('/fazendas', async (req, res) => {
    try {
        const query = 'SELECT id, nome, local, estado FROM fazenda ORDER BY nome';
        const [results] = await db.execute(query);

        res.status(200).json({ success: true, data: results });
    } catch (err) {
        console.error('Erro ao buscar fazendas:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar fazendas.' });
    }
});

//Rota para cadastrar fazenda
router.post('/fazendas', async (req, res) => {
    const { nome, local, estado } = req.body;

    if (!nome || !local || !estado) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const query = `
            INSERT INTO fazenda (nome, local, estado)
            VALUES (?, ?, ?);
        `;
        const [result] = await db.execute(query, [nome, local, estado]);

        res.status(201).json({ success: true, message: 'Fazenda cadastrada com sucesso!', id: result.insertId });
    } catch (err) {
        console.error('Erro ao cadastrar fazenda:', err);
        res.status(500).json({ success: false, message: 'Erro ao cadastrar fazenda.' });
    }
});

router.get('/listafazendas', async (req, res) => {
    try {
        console.log('Iniciando busca de fazendas e lotes...');
        
        const query = `
            SELECT f.id AS fazenda_id, f.nome AS fazenda_nome, f.local, f.estado, 
                   l.id AS lote_id, l.registro AS lote_registro
            FROM fazenda f
            LEFT JOIN lote l ON f.id = l.fazenda_id
            ORDER BY f.nome, l.registro;
        `;

        console.log('Executando query...');
        const [results] = await db.execute(query);
        console.log('Resultados da query:', results);

        const fazendas = {};
        results.forEach(row => {
            if (!fazendas[row.fazenda_id]) {
                fazendas[row.fazenda_id] = {
                    id: row.fazenda_id,
                    nome: row.fazenda_nome,
                    local: row.local,
                    estado: row.estado,
                    lotes: []
                };
            }
            if (row.lote_id) {
                fazendas[row.fazenda_id].lotes.push({
                    id: row.lote_id,
                    registro: row.lote_registro
                });
            }
        });

        const fazendasArray = Object.values(fazendas);
        console.log('Fazendas processadas:', fazendasArray);

        res.status(200).json({ success: true, data: fazendasArray });
    } catch (err) {
        console.error('Erro ao buscar fazendas:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar fazendas.' });
    }
});


router.post('/lotes', async (req, res) => {
    const { fazenda_id, registro, qtd_refeicoes, horario_refeicoes, qtd_alimento } = req.body;

    if (!fazenda_id || !registro || !qtd_refeicoes || !horario_refeicoes || !qtd_alimento) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const query = `
            INSERT INTO lote (registro, qtd_refeicoes, horario_refeicoes, qtd_alimento, fazenda_id)
            VALUES (?, ?, ?, ?, ?);
        `;
        await db.execute(query, [registro, qtd_refeicoes, horario_refeicoes, qtd_alimento, fazenda_id]);

        res.status(201).json({ success: true, message: 'Lote cadastrado com sucesso!' });
    } catch (err) {
        console.error('Erro ao cadastrar lote:', err);
        res.status(500).json({ success: false, message: 'Erro ao cadastrar lote.' });
    }
});

router.get('/lotes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT registro, qtd_refeicoes, horario_refeicoes, qtd_alimento
            FROM lote
            WHERE id = ?;
        `;

        const [results] = await db.execute(query, [id]);

        if (results.length > 0) {
            res.status(200).json({ success: true, data: results[0] });
        } else {
            res.status(404).json({ success: false, message: 'Lote não encontrado.' });
        }
    } catch (err) {
        console.error('Erro ao buscar informações do lote:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar informações do lote.' });
    }
});


router.post('/lotes/:id/vacinar', async (req, res) => {
    const { id } = req.params;
    const { insumo_id, quantidade, data_aplicacao } = req.body;

    if (!insumo_id || !quantidade || !data_aplicacao) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Busca todos os animais do lote
        const queryAnimais = 'SELECT brinco FROM animal WHERE lote_id = ?';
        const [animais] = await db.execute(queryAnimais, [id]);

        if (animais.length === 0) {
            return res.status(404).json({ success: false, message: 'Nenhum animal encontrado no lote.' });
        }

        // Insere a vacinação para cada animal
        const queryVacinar = `
            INSERT INTO carteira_saude (data_aplicacao, id_insumo, quantidade, animal_brinco)
            VALUES (?, ?, ?, ?)
        `;

        const promises = animais.map(animal =>
            db.execute(queryVacinar, [data_aplicacao, insumo_id, quantidade, animal.brinco])
        );

        await Promise.all(promises);

        res.status(201).json({ success: true, message: 'Vacinação registrada para todos os animais do lote!' });
    } catch (err) {
        console.error('Erro ao registrar vacinação:', err);
        res.status(500).json({ success: false, message: 'Erro ao registrar vacinação.' });
    }
});

router.get('/insumos', async (req, res) => {
    const { tipo } = req.query; // Captura o tipo passado como parâmetro na URL

    try {
        let query = 'SELECT id, produto FROM armazens';
        let params = [];

        // Se o tipo for fornecido, filtra os insumos
        if (tipo) {
            query += ' WHERE tipo = ?';
            params.push(tipo);
        }

        query += ' ORDER BY produto'; // Ordena por nome para facilitar a exibição

        const [results] = await db.execute(query, params);

        res.status(200).json({ success: true, data: results });
    } catch (err) {
        console.error('Erro ao buscar insumos:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar insumos.' });
    }
});

router.get('/animais/:brinco', async (req, res) => {
    const { brinco } = req.params;

    try {
        const query = `
            SELECT brinco, raca, sexo, ano_nascimento
            FROM animal
            WHERE brinco = ?;
        `;
        const [results] = await db.execute(query, [brinco]);

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Animal não encontrado.' });
        }

        res.status(200).json({ success: true, data: results[0] });
    } catch (err) {
        console.error('Erro ao buscar animal:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar animal.' });
    }
});


router.post('/animais', async (req, res) => {
    const { brinco, raca, ano_nascimento, peso_inicial, sexo, lote_id } = req.body;

    if (!brinco || !raca || !ano_nascimento || !peso_inicial || !sexo || !lote_id) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const query = `
            INSERT INTO animal (brinco, raca, ano_nascimento, peso_inicial, sexo, lote_id)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        await db.execute(query, [brinco, raca, ano_nascimento, peso_inicial, sexo, lote_id]);

        res.status(201).json({ success: true, message: 'Animal cadastrado com sucesso!' });
    } catch (err) {
        console.error('Erro ao cadastrar animal:', err);
        res.status(500).json({ success: false, message: 'Erro ao cadastrar animal.' });
    }
});

router.get('/animais', async (req, res) => {
    const { lote_id } = req.query;

    if (!lote_id) {
        return res.status(400).json({ success: false, message: 'O ID do lote é obrigatório.' });
    }

    try {
        const query = `
            SELECT brinco, raca, sexo, ano_nascimento
            FROM animal
            WHERE lote_id = ?;
        `;
        const [results] = await db.execute(query, [lote_id]);

        res.status(200).json({ success: true, data: results });
    } catch (err) {
        console.error('Erro ao buscar animais:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar animais.' });
    }
});


router.get('/carteira_vacinacao/:brinco', async (req, res) => {
    const { brinco } = req.params;

    try {
        const query = `
            SELECT cs.data_aplicacao, a.produto AS insumo, cs.quantidade
            FROM carteira_saude cs
            INNER JOIN armazens a ON cs.id_insumo = a.id
            WHERE cs.animal_brinco = ?;
        `;
        const [results] = await db.execute(query, [brinco]);

        res.status(200).json({ success: true, data: results });
    } catch (err) {
        console.error('Erro ao buscar histórico de vacinação:', err);
        res.status(500).json({ success: false, message: 'Erro ao buscar histórico de vacinação.' });
    }
});

router.post('/carteira_vacinacao', async (req, res) => {
    const { animal_brinco, id_insumo, quantidade, data_aplicacao } = req.body;

    if (!animal_brinco || !id_insumo || !quantidade || !data_aplicacao) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const query = `
            INSERT INTO carteira_saude (animal_brinco, id_insumo, quantidade, data_aplicacao)
            VALUES (?, ?, ?, ?);
        `;
        await db.execute(query, [animal_brinco, id_insumo, quantidade, data_aplicacao]);

        res.status(201).json({ success: true, message: 'Vacina registrada com sucesso!' });
    } catch (err) {
        console.error('Erro ao registrar vacina:', err);
        res.status(500).json({ success: false, message: 'Erro ao registrar vacina.' });
    }
});



export default router;