const express = require('express')
const connection = require('../config/db')
const bcrypt = require('bcrypt');


// Cria um router do Express
const router = express.Router();

//PUXAR USUARIOS
router.get('/lista', (req, res) => {
    connection.query("SELECT id, nome, email, senha FROM usuarios", (err, results) => {
        if (err) {
            res.status(500).send('erro')
        } else {
            res.json(results)
        }
    });
});

//INSERT USUARIOS
router.post('/insert', async (req, res) => {
    const { nome, email, senha, token } = req.body;

    // Verificar se todos os campos foram preenchidos
    if (!nome || !email || !senha || !token) {
        return res.status(400).send("Preencha todos os campos!");
    }

    // Verificar se o nome ou o e-mail já existem
    const checkQuery = 'SELECT nome, email FROM usuarios WHERE nome = ? OR email = ?';
    connection.query(checkQuery, [nome, email], async (err, results) => {
        if (err) {
            console.error('Erro ao verificar existência de nome ou e-mail: ' + err.stack);
            return res.status(500).send('Erro no servidor');
        }

        // Se o usuário já existir
        if (results.length > 0) {
            return res.status(409).send('Nome ou e-mail já está em uso!');
        }

        // Criptografar a senha
        const hashedSenha = await bcrypt.hash(senha, 10);

        // Inserir novo usuário no banco de dados
        const insertQuery = "INSERT INTO usuarios (nome, email, senha, token) VALUES (?, ?, ?, ?)";
        connection.query(insertQuery, [nome, email, hashedSenha, token], (err, results) => {
            if (err) {
                console.error('Erro ao inserir usuário: ' + err.stack);
                return res.status(500).send('Erro no servidor');
            }
            res.status(201).send('Usuário inserido com sucesso!');
        });
    });
});
//UPDATE
router.put('/update/:id', (req, res) => {
    const userId = req.params.id;
    const { nome, email, senha } = req.body;

    // Verificar se todos os campos necessários estão presentes
    if (!nome || !email || !senha) {
        return res.status(400).send('Preencha todos os campos!');
    }

    // Primeiro, verificar se o usuário existe
    const checkQuery = "SELECT * FROM usuarios WHERE id = ?";
    connection.query(checkQuery, [userId], (err, userResult) => {
        if (err) {
            console.error('Erro ao verificar usuário: ' + err.stack);
            return res.status(500).send('Erro no servidor');
        }

        // Se o usuário não for encontrado
        if (userResult.length === 0) {
            return res.status(404).send('Usuário não encontrado!');
        }

        const currentUser = userResult[0]; // Usuário atual com o ID fornecido

        // Verificar se o nome ou o e-mail já estão em uso por outro usuário
        const nomeEmailQuery = "SELECT * FROM usuarios WHERE (nome = ? OR email = ?) AND id != ?";
        connection.query(nomeEmailQuery, [nome, email, userId], async (err, nameEmailResults) => {
            if (err) {
                console.error('Erro ao verificar nome e e-mail: ' + err.stack);
                return res.status(500).send('Erro no servidor');
            }

            // Se o nome ou e-mail já existir e não for do atual usuário
            if (nameEmailResults.length > 0) {
                return res.status(409).send('O nome ou e-mail já está em uso por outro usuário!');
            }

            // Criptografar a senha antes de atualizar
            const hashedSenha = await bcrypt.hash(senha, 10);
                if (err) {
                    return res.status(500).send('Erro ao criptografar a senha');
                }

                // Atualizar o usuário
                const updateQuery = "UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?";
                connection.query(updateQuery, [nome, email, hashedSenha, userId], (err, results) => {
                    if (err) {
                        console.error('Erro ao atualizar usuário: ' + err.stack);
                        return res.status(500).send('Erro no servidor');
                    }

                    res.status(200).send('Usuário atualizado com sucesso!');
                });
        });
    });
});
//DELETE
router.delete('/delete/:id', (req, res) => {
    const userId = req.params.id;

    // Primeiro, buscar o nome do usuário
    const nomeQuery = "SELECT nome FROM usuarios WHERE id = ?";
    connection.query(nomeQuery, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário: ' + err.stack);
            return res.status(500).send('Erro no servidor');
        }

        // Verificar se o usuário existe
        if (results.length === 0) {
            return res.status(404).send('Usuário não encontrado!');
        }

        const nome = results.nome; // Pegando o nome do usuário

        // Agora, deletar o usuário
        const deleteQuery = "DELETE FROM usuarios WHERE id = ?";
        connection.query(deleteQuery, [userId], (err, results) => {
            if (err) {
                console.error('Erro ao deletar usuário: ' + err.stack);
                return res.status(500).send('Erro no servidor');
            }

            return res.status(200).send(`Usuário ${nome} deletado com sucesso!`);
        });
    });
});


module.exports = router;