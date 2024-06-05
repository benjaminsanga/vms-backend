const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const { getCurrentTime, getCurrentDateTime } = require('./helper');

const app = express();
const port = 8000;

// Middleware
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vms_db'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// Endpoints
app.post('/save-visitor', (req, res) => {
  const visitor = req.body;
  const query = `
    INSERT INTO visitors 
    (nameOfVisitor, nameOfHost, purposeOfVisit, itemsDeposited, safeNumber, phoneNumber, tagNumber, dateOfVisit, checkInTime, checkOutTime, comment, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const currentTime = getCurrentTime()
  const currentDateTime = getCurrentDateTime()

  db.query(query, [
    visitor.nameOfVisitor,
    visitor.nameOfHost,
    visitor.purposeOfVisit,
    visitor.itemsDeposited,
    visitor.safeNumber,
    visitor.phoneNumber,
    visitor.tagNumber,
    visitor.dateOfVisit,
    currentTime,
    null,
    visitor.comment,
    currentDateTime
  ], (err, result) => {
    if (err) {
      console.error('Error inserting visitor:', err);
      res.status(500).send('Error inserting visitor');
      return;
    }
    res.status(200).send('Visitor saved successfully');
  });
});

app.put('/update-visitor/:id', (req, res) => {
  const id = req.params.id;
  const visitor = req.body;
  const query = `
    UPDATE visitors
    SET checkOutTime = ?
    WHERE id = ?
  `;
  const currentTime = getCurrentTime()

  db.query(query, [
    currentTime,
    id
  ], (err, result) => {
    if (err) {
      console.error('Error updating visitor:', err);
      res.status(500).send('Error updating visitor');
      return;
    }
    res.status(200).send('Visitor updated successfully');
  });
});

app.get('/get-all-visitors', (req, res) => {
  const query = 'SELECT * FROM visitors';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving visitors:', err);
      res.status(500).send('Error retrieving visitors');
      return;
    }
    res.status(200).json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
