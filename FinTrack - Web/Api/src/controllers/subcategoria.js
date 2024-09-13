const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Função de criação de subcategoria
const createSubcategoria = async (req, res) => {
    try {
        const { categoriaId, nome } = req.body;
        const subcategoria = await prisma.subcategoria.create({
            data: {
                categoriaId: categoriaId,
                nome: nome
            }
        });
        return res.status(201).json(subcategoria);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Função para leitura de subcategoria
const readSubcategoria = async (req, res) => {
    if (req.params.id) {
        const subcategoria = await prisma.subcategoria.findUnique({
            where: { id: parseInt(req.params.id, 10) }
        });
        return res.json(subcategoria);
    } else {
        const subcategorias = await prisma.subcategoria.findMany();
        return res.json(subcategorias);
    }
};

// Função de atualização de subcategoria
const updateSubcategoria = async (req, res) => {
    const { id } = req.params;
    try {
        const { categoriaId, nome } = req.body;
        const subcategoria = await prisma.subcategoria.update({
            where: { id: parseInt(id, 10) },
            data: { categoriaId: categoriaId, nome: nome }
        });
        return res.status(202).json(subcategoria);
    } catch (error) {
        return res.status(404).json({ message: "Subcategoria não encontrada" });
    }
};

// Função de exclusão de subcategoria
const deleteSubcategoria = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.subcategoria.delete({
            where: { id: parseInt(id, 10) }
        });
        return res.status(204).send();
    } catch (error) {
        return res.status(404).json({ message: "Subcategoria não encontrada" });
    }
};

module.exports = {
    createSubcategoria,
    readSubcategoria,
    updateSubcategoria,
    deleteSubcategoria
};
