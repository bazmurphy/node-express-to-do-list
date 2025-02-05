const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const PORT = 3000;
require('dotenv').config();

let db;
let dbConnectionStr = process.env.DB_STRING;
let dbName = 'to-do-list-database';

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    });
    
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (request, response) => {

    // [1] async way of doing it:
    // const todoItems = await db.collection('to-do-list-collection').find().toArray()
    // const itemsLeft = await db.collection('to-do-list-collection').countDocuments({completed: false})
    // response.render('index.ejs', { items: todoItems, left: itemsLeft })

    // [2] promise chain way of doing it:
    db.collection('to-do-list-collection').find().toArray()
    .then(data => {
        db.collection('to-do-list-collection').countDocuments({completed: false})
        .then(itemsLeft => {
            response.render('index.ejs', { items: data, left: itemsLeft })
        })
    })
    .catch(error => console.error(error))
});

app.post('/addTodo', (request, response) => {
    db.collection('to-do-list-collection').insertOne({thing: request.body.todoItem, completed: false})
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
});

app.put('/markComplete', (request, response) => {
    db.collection('to-do-list-collection').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))
});

app.put('/markUnComplete', (request, response) => {
    db.collection('to-do-list-collection').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))
});

app.delete('/deleteItem', (request, response) => {
    db.collection('to-do-list-collection').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))
});

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`)
});