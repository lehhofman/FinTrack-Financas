const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Função de criação de categoria
const createCategoria = async (req, res) => {
    try {
        const { nome, tipo } = req.body;
        const categoria = await prisma.categoria.create({
            data: {
                nome: nome,
                tipo: tipo
            }
        });
        return res.status(201).json(categoria);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Função para leitura de categoria
const readCategoria = async (req, res) => {
    if (req.params.id) {
        const categoria = await prisma.categoria.findUnique({
            where: { id: parseInt(req.params.id, 10) }
        });
        return res.json(categoria);
    } else {
        const categorias = await prisma.categoria.findMany();
        return res.json(categorias);
    }
};

// Função de atualização de categoria
const updateCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        const { nome, tipo } = req.body;
        const categoria = await prisma.categoria.update({
            where: { id: parseInt(id, 10) },
            data: { nome: nome, tipo: tipo }
        });
        return res.status(202).json(categoria);
    } catch (error) {
        return res.status(404).json({ message: "Categoria não encontrada" });
    }
};

// Função de exclusão de categoria
const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.categoria.delete({
            where: { id: parseInt(id, 10) }
        });
        return res.status(204).send();
    } catch (error) {
        return res.status(404).json({ message: "Categoria não encontrada" });
    }
};

module.exports = {
    createCategoria,
    readCategoria,
    updateCategoria,
    deleteCategoria
};
