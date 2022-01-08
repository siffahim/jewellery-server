const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

//middleware
app.use(cors())
app.use(express.json())

//mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lyhqa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('jewellery');

        const productCollection = database.collection('products');
        const userCollection = database.collection('users');
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');

        //get
        app.get('/products', async (req, res) => {
            const size = parseInt(req.query.size);
            const cursor = productCollection.find({});
            let products;
            if (size) {
                products = await cursor.limit(size).toArray()
            }
            else {
                products = await cursor.toArray()
            }
            res.json(products);
        })

        //app.get
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await productCollection.findOne(filter);
            res.json(result)
        })
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.json(result);
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(filter)
            res.json(result)
        })

        /*--------------------user save-----------------------------*/

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email };
            const result = await userCollection.findOne(query);
            let admin = false;
            if (result?.role === 'admin') {
                admin = true;
            }
            res.json({ admin })
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user)
            res.json(result)
        })

        app.put('/users/admin', async (req, res) => {
            const email = req.body.email;
            const query = { email: email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(query, updateDoc);
            res.json(result)
        })

        /*---------------------------order save----------------------*/
        app.post('/orders', async (req, res) => {
            const order = req.body;
            order.status = false;
            const result = await orderCollection.insertOne(order);
            res.json(result)
        })

        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            let result;
            if (email) {
                const filter = { email: email }
                result = await orderCollection.find(filter).toArray();
            }
            else {
                result = await orderCollection.find({}).toArray();
            }
            res.json(result)
        })

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(filter);
            res.json(result)
        })

        app.put('/orders', async (req, res) => {
            const id = req.body._id;
            const options = { upsert: true };
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: req.body.task
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        /*-----------------review---------------------*/
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({})
            const result = await cursor.toArray()
            res.json(result)
        })

        app.post('/reviews', async (req, res) => {
            const rivew = req.body;
            const result = await reviewCollection.insertOne(rivew);
            res.json(result);
        })

    }
    finally {
        // await client.close()
    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('I m jewellery server')
});

app.listen(port, () => {
    console.log(`Jewellery server ${port}`)
})

/*--------------------------------
            mongodb
--------------------------------*/