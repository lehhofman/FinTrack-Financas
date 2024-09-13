const express = require('express');
const router = express.Router();

const Middleware = require('./middleware/middleware');
const Usuario = require('./controllers/usuario');
const transacaoController = require('./controllers/transaçao');
const Categoria = require('./controllers/categoria');
const Subcategoria = require('./controllers/subcategoria');
const Orcamento = require('./controllers/orçamento');
const HistoricoOrcamento = require('./controllers/historico');
const Relatorio = require('./controllers/relatorio');
const RelatorioJson = require('./controllers/relatoriojson');

router.post('/signup', Usuario.create);
router.post('/login', Usuario.login);
router.get('/usuarios', Middleware.validaAcesso, Usuario.read);
router.get('/usuarios/:id', Middleware.validaAcesso, Usuario.read);
router.put('/usuarios/:id', Middleware.validaAcesso, Usuario.update);
router.delete('/usuarios/:id', Middleware.validaAcesso, Usuario.del);

router.post('/transacao',Middleware.validaAcesso, transacaoController.createTransacao);
router.get('/transacao/:id?',Middleware.validaAcesso, transacaoController.readTransacao);
router.put('/transacao/:id', Middleware.validaAcesso, transacaoController.updateTransacao);
router.delete('/transacao/:id',Middleware.validaAcesso, transacaoController.deleteTransacao);


router.post('/categoria',Middleware.validaAcesso, Categoria.createCategoria);
router.get('/categoria/:id?',Middleware.validaAcesso, Categoria.readCategoria);
router.put('/categoria/:id',Middleware.validaAcesso, Categoria.updateCategoria);
router.delete('/categoria/:id',Middleware.validaAcesso, Categoria.deleteCategoria);

router.post('/subcategoria',Middleware.validaAcesso, Subcategoria.createSubcategoria);
router.get('/subcategoria/:id?',Middleware.validaAcesso, Subcategoria.readSubcategoria);
router.put('/subcategoria/:id',Middleware.validaAcesso, Subcategoria.updateSubcategoria);
router.delete('/subcategoria/:id',Middleware.validaAcesso, Subcategoria.deleteSubcategoria);

router.post('/orcamento',Middleware.validaAcesso, Orcamento.createOrcamento);
router.get('/orcamento',Middleware.validaAcesso, Orcamento.readOrcamento); 
router.put('/orcamento',Middleware.validaAcesso, Orcamento.updateOrcamento); 
router.delete('/orcamento/:id',Middleware.validaAcesso, Orcamento.deleteOrcamento); 

router.post('/historico-orcamento',Middleware.validaAcesso, HistoricoOrcamento.createHistoricoOrcamento);
router.get('/historico-orcamento/:id?',Middleware.validaAcesso, HistoricoOrcamento.readHistoricoOrcamento); 
router.put('/historico-orcamento/:id',Middleware.validaAcesso, HistoricoOrcamento.updateHistoricoOrcamento); 
router.delete('/historico-orcamento/:id',Middleware.validaAcesso, HistoricoOrcamento.deleteHistoricoOrcamento); 

router.post('/relatorio',Middleware.validaAcesso, Relatorio.createRelatorio);
router.get('/relatorio/:id?',Middleware.validaAcesso, Relatorio.readRelatorio); 
router.put('/relatorio/:id',Middleware.validaAcesso, Relatorio.updateRelatorio); 
router.delete('/relatorio/:id',Middleware.validaAcesso, Relatorio.deleteRelatorio);

router.post('/relatorio-json',Middleware.validaAcesso, RelatorioJson.createRelatorioJson);
router.get('/relatorio-json/:id?',Middleware.validaAcesso, RelatorioJson.readRelatorioJson);
router.put('/relatorio-json/:id',Middleware.validaAcesso, RelatorioJson.updateRelatorioJson);
router.delete('/relatorio-json/:id',Middleware.validaAcesso, RelatorioJson.deleteRelatorioJson);


router.get('/', (req, res) => { 

    return res.json("API respondendo"); 

});

module.exports = router;
