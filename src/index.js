const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Caminho para a pasta 'certificado' fora da pasta 'src'
const privateKey = fs.readFileSync(path.resolve(__dirname, '../certificado/privkey.pem'), 'utf8');
const certificate = fs.readFileSync(path.resolve(__dirname, '../certificado/cert.pem'), 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate
};

const app = express();
const port = 3000; // Porta para HTTPS

// Importar rotas de usuário
const userRoutes = require('../routes/userRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de usuários
app.use('/user', userRoutes);

// Rota home
app.get('/', (req, res) => {
  res.send(`Para ter Acesso aos Usuários /user <br> 
      Exemplo:<br> 
      Listas: /user/lista  <br> 
      Insert: /user/insert  <br> 
      Update: /user/update/:id  <br> 
      Delete: /user/delete/:id  <br> 
      `);
});

// Iniciar servidor HTTPS
https.createServer(credentials, app).listen(port, () => {
  console.log(`Servidor rodando em HTTPS na porta ${port}`);
});
