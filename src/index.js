const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Usar a porta definida pela Vercel ou 3000 como fallback

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

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
