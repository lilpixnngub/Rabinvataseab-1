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
app.use(express.static(path.join(__dirname)));
app.use(express.static('View/Routes/stylesheet'));

// Serve the HTML file for the signup page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'View', 'Routes', 'SignupPage.html'));
});

app.post('/signup', (req, res) => {
  const {
    Fullname,
    Email,
    Address,
    DoB,
    Password,
    Phone_no
  } = req.body;

  const INSERT_MEMBER_QUERY = `INSERT INTO Member (Fullname, Email, Address, DoB, Password, Phone_no) VALUES (?, ?, ?, ?, ?, ?)`;

  connection.execute(
    INSERT_MEMBER_QUERY,
    [Fullname, Email, Address, DoB, Password, Phone_no],
    (error, results, fields) => {
        console.log('Data inserted successfully:', results);
        res.redirect('/log');
    });
});


app.get('/log', (req, res) =>{
    res.sendFile(path.join(__dirname, 'View', 'Routes','LoginPage.html'));
})
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'View', 'Routes', 'HomePage.html'));
})
app.get('/forgot', (req, res) => {
    res.sendFile(path.join(__dirname, 'View', 'Routes', 'ForgotpassPage.html'));
})
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'View', 'Routes', 'AboutPage.html'));
})

app.post('/login', (req, res) => {
  const { Email, Password } = req.body;

  // Query to retrieve hashed password from the database based on the provided email
  const SELECT_USER_QUERY = 'SELECT Password FROM Member WHERE Email = ?';

  connection.query(SELECT_USER_QUERY, [Email], (error, results, fields) => {
    if (error) {
      res.status(500).json({ message: 'Error retrieving data from the database' });
    } else {
      if (results.length > 0) {
        const hashedPasswordFromDB = results[0].Password;

        // Compare the provided password with the hashed password
        if (hashedPasswordFromDB === Password) {
          res.redirect('/home');
        } else {
          res.send('Invalid password');
        }
      } else {
        res.send('User not found');
      }
    }
  });
});

app.post('/forgotpassword', (req, res) => {
  const { Email, Password } = req.body;

  const UPDATE_PASSWORD_QUERY = 'UPDATE Member SET Password = ? WHERE Email = ?';

  connection.execute(UPDATE_PASSWORD_QUERY, [Password, Email], (err) => {
    if (err) {
      console.error('Password update error:', err);
      res.send('Error updating password');
    } else {
      res.redirect('/home')
    }
  });
});

app.listen(3000, ()=> console.log('Server is running on port 3000'));
