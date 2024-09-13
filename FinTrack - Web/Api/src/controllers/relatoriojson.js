const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Criar RelatórioJson
const createRelatorioJson = async (req, res) => {
    try {
        const { usuarioId, tipo, dataInicio, dataFim, dados } = req.body;
        const relatorioJson = await prisma.relatorioJson.create({
            data: {
                usuarioId,
                tipo,
                dataInicio: new Date(dataInicio),
                dataFim: new Date(dataFim),
                dados
            }
        });
        return res.status(201).json(relatorioJson);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Ler RelatórioJson (por ID ou todos)
const readRelatorioJson = async (req, res) => {
    try {
        if (req.params.id) {
            const relatorioJson = await prisma.relatorioJson.findUnique({
                where: { id: parseInt(req.params.id, 10) }
            });
            if (!relatorioJson) return res.status(404).json({ message: "Relatório Json não encontrado" });
            return res.json(relatorioJson);
        } else {
            const relatoriosJson = await prisma.relatorioJson.findMany();
            return res.json(relatoriosJson);
        }
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Atualizar RelatórioJson
const updateRelatorioJson = async (req, res) => {
    const { id } = req.params;
    try {
        const { usuarioId, tipo, dataInicio, dataFim, dados } = req.body;
        const relatorioJson = await prisma.relatorioJson.update({
            where: { id: parseInt(id, 10) },
            data: {
                usuarioId,
                tipo,
                dataInicio: new Date(dataInicio),
                dataFim: new Date(dataFim),
                dados
            }
        });
        return res.status(202).json(relatorioJson);
    } catch (error) {
        return res.status(404).json({ message: "Relatório Json não encontrado" });
    }
};

// Excluir RelatórioJson
const deleteRelatorioJson = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.relatorioJson.delete({
            where: { id: parseInt(id, 10) }
        });
        return res.status(204).send();
    } catch (error) {
        return res.status(404).json({ message: "Relatório Json não encontrado" });
    }
};

module.exports = {
    createRelatorioJson,
    readRelatorioJson,
    updateRelatorioJson,
    deleteRelatorioJson
};
