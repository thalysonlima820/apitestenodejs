const express = require('express')
const connection = require('../config/db')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keyToken = require('../key/keyToken')

// Cria um router do Express
const routerLogin = express.Router();

//LOGIN
routerLogin.post('/login', (req, res) => {
    const { email, senha } = req.body;

    // Consultar o usuário na base de dados
    const query = "SELECT * FROM usuarios WHERE email = ?";
    connection.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).send('Erro no servidor.');
        }

        // Verificar se o usuário existe
        if (results.length === 0) {
            return res.status(404).send('Usuário não encontrado!');
        }

        const user = results[0];

        // Comparar a senha fornecida com a senha criptografada no banco de dados
        bcrypt.compare(senha, user.senha, (err, isMatch) => {
            if (err) {
                return res.status(500).send('Erro no servidor ao verificar a senha.');
            }

            if (!isMatch) {
                return res.status(401).send('Senha incorreta!');
            }

            // Se a senha for correta, gerar o token JWT
            const token = jwt.sign({ id: user.id, nome: user.nome, email: user.email }, keyToken, { expiresIn: '1h' });
    
            const UpdateQueryToken = "UPDATE usuarios SET token = ? WHERE id = ?"
            connection.query(UpdateQueryToken, [token, user.id], (err, result) => {
                if (err) {
                    return res.status(500).send('Erro no servidor ao verificar a senha.');
                }

                return res.json({ token });
            })     
        });
    });
});

//INSERT USUARIOS
routerLogin.post('/insert', async (req, res) => {
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




module.exports = routerLogin;