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

  const INSERT_MEMBER_QUERY = `
  INSERT INTO Member (Fullname, Email, Address, DoB, Password, Phone_no) VALUES (?, ?, ?, ?, AES_ENCRYPT(?, SHA1('74a11977hJAHDfea')), ?)`;

  connection.query(INSERT_MEMBER_QUERY, [Fullname, Email, Address, DoB, Password, Phone_no],
  (error, results, fields) => {
    if (error) {
      console.error('Error inserting data into the database:', error);
      res.status(500).json({ message: `Error inserting data into the database: ${error.message}` });
    } else {
      res.redirect('/log');
    }
  }
  );
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

  // Query to retrieve encrypted password from the database based on the provided email
  const SELECT_ENCRYPTED_PASSWORD_QUERY = `SELECT AES_ENCRYPT(?, SHA1('74a11977hJAHDfea')) AS encrypted_password FROM Member WHERE Email = ?`;

  connection.query(SELECT_ENCRYPTED_PASSWORD_QUERY, [Password, Email], (error, results, fields) => {
    if (error) {
      res.status(500).json({ message: 'Error retrieving data from the database' });
    } else {
      if (results.length > 0) {
        const encryptedPasswordFromDB = results[0].encrypted_password;

        // Query to check if decrypted password matches the provided password
        const SELECT_USER_QUERY = `SELECT * FROM Member WHERE Email = ? AND AES_DECRYPT(Password, SHA1('74a11977hJAHDfea')) = ?`;

        connection.query(SELECT_USER_QUERY, [Email, Password], (error, results, fields) => {
          if (error) {
            res.status(500).json({ message: 'Error retrieving data from the database' });
          } else {
            if (results.length > 0) {
              res.redirect('/home');
            } else {
              res.send('Invalid password');
            }
          }
        });
      } else {
        res.send('User not found');
      }
    }
  });
});





app.post('/forgotpassword', (req, res) => {
  const { Email, Password } = req.body;

  const UPDATE_PASSWORD_QUERY = 'UPDATE Member SET Password = ? WHERE Email = ?';

  connection.execute(UPDATE_PASSWORD_QUERY, [Password, Email], (err, results) => {
    if (err) {
      console.error('Password update error:', err);
      res.send('Error updating password');
    } else {
      if(results.length>0){
        res.redirect('/home')
      }
      else {
        res.status(500).send('error')
      }
    }
  });
});

app.listen(3000, ()=> console.log('Server is running on port 3000'));
