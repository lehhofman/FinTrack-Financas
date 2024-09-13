const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const validCategorias = ['RENDA', 'ALIMENTACAO', 'TRANSPORTE', 'UTILIDADES', 'ENTRETENIMENTO'];

const createTransacao = async (req, res) => {
    const { data, descricao, categoria, valor, tags } = req.body;
    const usuarioId = req.user.id; // Obtém o ID do usuário autenticado

    if (!data || !descricao || !categoria || !valor) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Converter a categoria para maiúsculas
    const normalizedCategoria = categoria.toUpperCase();

    if (!validCategorias.includes(normalizedCategoria)) {
        return res.status(400).json({ message: 'Categoria inválida.' });
    }

    try {
        // Criar transação
        const transacao = await prisma.transacao.create({
            data: {
                usuario: {
                    connect: { id: usuarioId } // Conectar a transação com o usuário pelo ID
                },
                data: new Date(data),
                descricao,
                categoria: normalizedCategoria,
                valor,
                tags
            }
        });
        res.status(201).json(transacao);
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        res.status(500).json({ error: 'Erro ao criar transação.' });
    }
};

const readTransacao = async (req, res) => {
    try {
        if (req.params.id) {
            const transacao = await prisma.transacao.findFirst({
                where: { id: parseInt(req.params.id, 10), usuarioId: req.user.id }
            });
            if (!transacao) {
                return res.status(404).json({ message: 'Transação não encontrada ou não pertence ao usuário.' });
            }
            res.json(transacao);
        } else {
            const transacoes = await prisma.transacao.findMany({
                where: { usuarioId: req.user.id } // Filtra por usuário autenticado
            });
            res.json(transacoes);
        }
    } catch (error) {
        console.error('Erro ao ler transações:', error);
        res.status(500).json({ message: 'Erro ao ler transações.' });
    }
};

const updateTransacao = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoria } = req.body;

        // Converter a categoria para maiúsculas se fornecida
        if (categoria) {
            const normalizedCategoria = categoria.toUpperCase();
            req.body.categoria = normalizedCategoria;
        }

        const transacao = await prisma.transacao.findFirst({
            where: { id: parseInt(id, 10), usuarioId: req.user.id }
        });
        if (!transacao) {
            return res.status(404).json({ message: 'Transação não encontrada ou não pertence ao usuário.' });
        }

        const updatedTransacao = await prisma.transacao.update({
            where: { id: parseInt(id, 10) },
            data: req.body
        });

        res.status(202).json(updatedTransacao);
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        res.status(500).json({ message: 'Erro ao atualizar transação.' });
    }
};

const deleteTransacao = async (req, res) => {
    try {
        const { id } = req.params;
        const transacao = await prisma.transacao.findFirst({
            where: { id: parseInt(id, 10), usuarioId: req.user.id }
        });
        if (!transacao) {
            return res.status(404).json({ message: 'Transação não encontrada ou não pertence ao usuário.' });
        }

        await prisma.transacao.delete({
            where: { id: parseInt(id, 10) }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir transação:', error);
        res.status(500).json({ message: 'Erro ao excluir transação.' });
    }
};

module.exports = {
    createTransacao,
    readTransacao,
    updateTransacao,
    deleteTransacao
};
