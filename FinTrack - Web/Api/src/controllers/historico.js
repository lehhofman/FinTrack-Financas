const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Função de criação de histórico de orçamento
const createHistoricoOrcamento = async (req, res) => {
    try {
        const { orcamentoId, data, valor, status, tipoAjuste } = req.body;

        // Verificar se o orçamento existe
        const orcamentoExistente = await prisma.orcamento.findUnique({
            where: { id: parseInt(orcamentoId, 10) }
        });

        if (!orcamentoExistente) {
            return res.status(400).json({ message: "Orçamento não encontrado" });
        }

        const historicoOrcamento = await prisma.historicoOrcamento.create({
            data: {
                orcamentoId,
                data: new Date(data),
                valor,
                status,
                tipoAjuste
            }
        });
        return res.status(201).json(historicoOrcamento);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Função para leitura de histórico de orçamento
const readHistoricoOrcamento = async (req, res) => {
    if (req.params.id) {
        const historicoOrcamento = await prisma.historicoOrcamento.findUnique({
            where: { id: parseInt(req.params.id, 10) }
        });
        return res.json(historicoOrcamento);
    } else {
        const historicosOrcamento = await prisma.historicoOrcamento.findMany();
        return res.json(historicosOrcamento);
    }
};

// Função de atualização de histórico de orçamento
const updateHistoricoOrcamento = async (req, res) => {
    const { id } = req.params;
    try {
        const { orcamentoId, data, valor, status, tipoAjuste } = req.body;

        // Verificar se o orçamento existe
        const orcamentoExistente = await prisma.orcamento.findUnique({
            where: { id: parseInt(orcamentoId, 10) }
        });

        if (!orcamentoExistente) {
            return res.status(400).json({ message: "Orçamento não encontrado" });
        }

        const historicoOrcamento = await prisma.historicoOrcamento.update({
            where: { id: parseInt(id, 10) },
            data: {
                orcamentoId,
                data: new Date(data),
                valor,
                status,
                tipoAjuste
            }
        });
        return res.status(202).json(historicoOrcamento);
    } catch (error) {
        return res.status(404).json({ message: "Histórico de orçamento não encontrado" });
    }
};

// Função de exclusão de histórico de orçamento
const deleteHistoricoOrcamento = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.historicoOrcamento.delete({
            where: { id: parseInt(id, 10) }
        });
        return res.status(204).send();
    } catch (error) {
        return res.status(404).json({ message: "Histórico de orçamento não encontrado" });
    }
};

module.exports = {
    createHistoricoOrcamento,
    readHistoricoOrcamento,
    updateHistoricoOrcamento,
    deleteHistoricoOrcamento
};
