const express = require('express');
const cors = require('cors');
const app = express();
const usuarioRoutes = require('./src/routes');

// Configurar o middleware CORS
app.use(cors());

// Configurar o Express para usar JSON
app.use(express.json());

// Usar as rotas
app.use('/api', usuarioRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
