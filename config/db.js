const mysql = require('mysql2')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
});

connection.connect((err) => {
    if(err){
        console.log('dados incorretos' + err.stack)
        return
    }
    console.log(connection.threadId)
});

module.exports = connection;