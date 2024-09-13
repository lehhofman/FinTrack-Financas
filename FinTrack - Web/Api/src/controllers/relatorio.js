const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Criar um novo relatório
const createRelatorio = async (req, res) => {
    try {
        const { usuarioId, tipo, dataInicio, dataFim, relatorio, formato } = req.body;

        // Verificar se o usuário existe
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { id: usuarioId }
        });

        if (!usuarioExistente) {
            return res.status(400).json({ message: "Usuário não encontrado" });
        }

        const novoRelatorio = await prisma.relatorio.create({
            data: {
                usuarioId,
                tipo,
                dataInicio: new Date(dataInicio),
                dataFim: new Date(dataFim),
                relatorio,
                formato
            }
        });
        return res.status(201).json(novoRelatorio);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Ler relatório(s)
const readRelatorio = async (req, res) => {
    try {
        if (req.params.id) {
            const relatorio = await prisma.relatorio.findUnique({
                where: { id: parseInt(req.params.id, 10) }
            });
            if (!relatorio) {
                return res.status(404).json({ message: "Relatório não encontrado" });
            }
            return res.json(relatorio);
        } else {
            const relatorios = await prisma.relatorio.findMany();
            return res.json(relatorios);
        }
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Atualizar um relatório
const updateRelatorio = async (req, res) => {
    const { id } = req.params;
    try {
        const { usuarioId, tipo, dataInicio, dataFim, relatorio, formato } = req.body;

        // Verificar se o relatório existe
        const relatorioExistente = await prisma.relatorio.findUnique({
            where: { id: parseInt(id, 10) }
        });

        if (!relatorioExistente) {
            return res.status(404).json({ message: "Relatório não encontrado" });
        }

        // Verificar se o usuário existe
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { id: usuarioId }
        });

        if (!usuarioExistente) {
            return res.status(400).json({ message: "Usuário não encontrado" });
        }

        const relatorioAtualizado = await prisma.relatorio.update({
            where: { id: parseInt(id, 10) },
            data: {
                usuarioId,
                tipo,
                dataInicio: new Date(dataInicio),
                dataFim: new Date(dataFim),
                relatorio,
                formato
            }
        });
        return res.status(202).json(relatorioAtualizado);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Excluir um relatório
const deleteRelatorio = async (req, res) => {
    try {
        const { id } = req.params;
        const relatorio = await prisma.relatorio.delete({
            where: { id: parseInt(id, 10) }
        });
        return res.status(204).send();
    } catch (error) {
        return res.status(404).json({ message: "Relatório não encontrado" });
    }
};

module.exports = {
    createRelatorio,
    readRelatorio,
    updateRelatorio,
    deleteRelatorio
};
