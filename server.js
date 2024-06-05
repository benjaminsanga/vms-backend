const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getCurrentTime, getCurrentDateTime, getOneYearAgoDate, getCurrentDate } = require('./helper');

const app = express();
const port = 8000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

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
    (nameOfVisitor, nameOfHost, purposeOfVisit, itemsDeposited, safeNumber, phoneNumber, tagNumber, dateOfVisit, checkInTime, checkOutTime, comment, enteredBy, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    visitor.enteredBy,
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

app.patch('/update-visitor/:id', (req, res) => {
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
  const page = parseInt(req.query.page) || 1;  // Get the page number from query, default to 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // Get the limit from query, default to 10 if not provided
  const from = req.query.from || getOneYearAgoDate();
  const to = req.query.to || getCurrentDate();
  const offset = (page - 1) * limit;

  const query = 'SELECT * FROM visitors WHERE dateOfVisit >= ? AND dateOfvisit <= ? LIMIT ? OFFSET ?';
  const countQuery = 'SELECT COUNT(*) AS count FROM visitors';

  db.query(query, [from, to, limit, offset], (err, results) => {
    if (err) {
      console.error('Error retrieving visitors:', err);
      res.status(500).send('Error retrieving visitors');
      return;
    }

    db.query(countQuery, (countErr, countResults) => {
      if (countErr) {
        console.error('Error retrieving visitor count:', countErr);
        res.status(500).send('Error retrieving visitor count');
        return;
      }

      const totalVisitors = countResults[0].count;
      const totalPages = Math.ceil(totalVisitors / limit);

      res.status(200).json({
        visitors: results,
        totalVisitors,
        totalPages,
        currentPage: page
      });
    });
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
