import express from 'express';
import router from './routes/router.js';
import cors from 'cors'; // Importa o pacote CORS

const server = express();

server.use(express.json());
server.use(express.urlencoded({extended:true}));
server.use(cors());

server.get('/ping',(req,res)=>res.json({pong:true}));

server.use('/', router);

server.use((req, res, next) => {
    console.log(`Método: ${req.method}, Rota: ${req.originalUrl}`);
    next();
});

server.listen(3000, ()=>console.log("Servidor rodando!"));
