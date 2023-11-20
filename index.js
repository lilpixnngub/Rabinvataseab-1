const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

const connection = mysql.createPool({
    host : 'localhost',
    port: 8889,
    user : 'root',
    password : 'root',
    database : 'Rabinvataseab'
})

const bodypaser = require('body-parser');

app.use(bodypaser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'Rabinvataseab')));
app.use(express.static('View/Routes/stylesheet'));

// Serve the HTML file for the signup page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Rabinvataseab', 'View', 'Routes', 'SignupPage.html'));
});

app.post('/signup', (req, res) => {
  const {
    F_name,
    L_name,
    Email,
    Address,
    DoB,
    Username,
    Password,
    Phone_no
  } = req.body;

  const INSERT_MEMBER_QUERY = `INSERT INTO Member (F_name, L_name, Email, Address, DoB, Username, Password, Phone_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.execute(
    INSERT_MEMBER_QUERY,
    [F_name, L_name, Email, Address, DoB, Username, Password, Phone_no],
    (error, results, fields) => {
        console.log('Data inserted successfully:', results);
        res.redirect('/log');
    });
});

app.get('/start', (req, res) => {
  res.sendFile(path.join(__dirname, 'Rabinvataseab', 'View', 'Routes', 'StartPage.html'));
})
app.get('/log', (req, res) =>{
    res.sendFile(path.join(__dirname, 'Rabinvataseab', 'View', 'Routes','LoginPage.html'));
})
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname,'Rabinvataseab', 'View', 'Routes', 'HomePage.html'))
})
app.post('/login', (req, res) => {
  const { Email, Password } = req.body;

  // Query to retrieve hashed password from the database based on the provided username
  const SELECT_USER_QUERY = 'SELECT Password FROM Member WHERE Email = ?';

  connection.query(SELECT_USER_QUERY, [Email], (error, results, fields) => {
    if (error) {
      res.status(500).json({ message: 'Error retrieving data from the database' });
    } else {
      if(results.length>0) {
        res.redirect('/start')
      }
  }
});
})
app.post('/homepage', (req, res) => {
  res.redirect('/home');
})

app.listen(3000, ()=> console.log('Server is running on port 3000'));
