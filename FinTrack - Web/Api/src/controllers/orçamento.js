const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createOrcamento = async (req, res) => {
    const { categoria, valor } = req.body;
    const usuarioId = req.user.id;

    if (!categoria || valor === undefined) {
        return res.status(400).json({ error: 'Categoria e valor são obrigatórios.' });
    }

    try {
        const orcamento = await prisma.orcamento.create({
            data: {
                usuarioId,
                categoria: categoria.toUpperCase(),
                valor
            }
        });
        res.status(201).json(orcamento);
    } catch (error) {
        console.error('Erro ao criar orçamento:', error);
        res.status(500).json({ error: 'Erro ao criar orçamento.' });
    }
};


const readOrcamento = async (req, res) => {
    try {
        const orcamentos = await prisma.orcamento.findMany({
            where: { usuarioId: req.user.id }
        });
        res.json(orcamentos);
    } catch (error) {
        console.error('Erro ao ler orçamentos:', error);
        res.status(500).json({ message: 'Erro ao ler orçamentos.' });
    }
};

const updateOrcamento = async (req, res) => {
    const { id, categoria, valor } = req.body;
    const usuarioId = req.user.id;

    if (!id || !categoria || valor === undefined) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        const orcamento = await prisma.orcamento.update({
            where: { id },
            data: {
                categoria: categoria.toUpperCase(),
                valor
            }
        });

        if (orcamento.usuarioId !== usuarioId) {
            return res.status(403).json({ error: 'Você não tem permissão para atualizar este orçamento.' });
        }

        res.json(orcamento);
    } catch (error) {
        console.error('Erro ao atualizar orçamento:', error);
        res.status(500).json({ error: 'Erro ao atualizar orçamento.' });
    }
};

const deleteOrcamento = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.user.id;

    if (!id) {
        return res.status(400).json({ error: 'ID do orçamento é obrigatório.' });
    }

    try {
        const orcamento = await prisma.orcamento.delete({
            where: { id }
        });

        if (orcamento.usuarioId !== usuarioId) {
            return res.status(403).json({ error: 'Você não tem permissão para deletar este orçamento.' });
        }

        res.json({ message: 'Orçamento deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar orçamento:', error);
        res.status(500).json({ error: 'Erro ao deletar orçamento.' });
    }
};

module.exports = {
    createOrcamento,
    readOrcamento,
    updateOrcamento,
    deleteOrcamento
};
