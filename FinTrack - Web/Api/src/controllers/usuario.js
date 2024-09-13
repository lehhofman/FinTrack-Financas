const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Função de login
const login = async (req, res) => {
    const { email, senha } = req.body;
    const usuario = await prisma.usuario.findFirst({
        where: {
            email: email,
            senha: senha
        }
    });
    if (usuario) {
        const token = jwt.sign({ id: usuario.id }, process.env.KEY, {
            expiresIn: 3600 // expira em uma hora
        });
        usuario.token = token;
        return res.json(usuario);
    } else {
        return res.status(401).json({ message: 'Email ou senha inválidos' });
    }
};

// Função de criação de usuário
const create = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        const usuario = await prisma.usuario.create({
            data: {
                nome: nome,
                email: email,
                senha: senha
            }
        });
        return res.status(201).json(usuario);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Função para leitura de usuário
const read = async (req, res) => {
    if (req.params.id !== undefined) {
        const usuario = await prisma.usuario.findUnique({
            where: {
                id: parseInt(req.params.id, 10)
            }
        }); 
        return res.json(usuario);
    } else {
        const usuarios = await prisma.usuario.findMany();
        return res.json(usuarios);
    }
};

// Função de atualização de usuário
const update = async (req, res) => {
    const { id } = req.params;
    try {
        const usuario = await prisma.usuario.update({
            where: {
                id: parseInt(id, 10)
            },
            data: req.body
        });
        return res.status(202).json(usuario);
    } catch (error) {
        return res.status(404).json({ message: "Usuário não encontrado" });
    }
};

// Função de exclusão de usuário
const del = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.usuario.delete({
            where: {
                id: parseInt(id, 10)
            }
        });
        return res.status(204).send();
    } catch (error) {
        return res.status(404).json({ message: "Usuário não encontrado" });
    }
};

module.exports = {
    login,
    create,
    read,
    update,
    del
};
