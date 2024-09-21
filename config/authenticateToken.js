const jwt = require('jsonwebtoken');
const keyToken = require('../key/keyToken')

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).send('Acesso negado! Token não fornecido.');
    }

    const actualToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

    jwt.verify(actualToken, keyToken, (err, user) => {
        if (err) {
            return res.status(403).send('Token inválido!');
        }
        req.user = user;  // Armazenar o usuário decodificado
        next(); // Prosseguir para a próxima função (rota)
    });
};

module.exports = authenticateToken;
