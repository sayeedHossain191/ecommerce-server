const express = require('express');
const app = express();
const cors = require('cors');
//const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@atlascluster.bbzq5pl.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        //await client.connect();

        const productCollection = client.db("ecommerce").collection("products");


        app.get('/products', async (req, res) => {
            // const cursor = productCollection.find();
            // const result = await cursor.toArray();

            try {
                const { search, sort, email } = req.query;
                let pipeline = [];

                // Match stage for search
                if (search) {
                    pipeline.push({
                        $match: {
                            name: { $regex: search, $options: 'i' }
                        }
                    });
                }

                // // Match stage for email
                // if (email) {
                //     pipeline.push({
                //         $match: {
                //             "postMaker.postMaker_email": email
                //         }
                //     });
                // }

                const result = await productCollection.aggregate(pipeline).toArray();
                res.send(result);
            } catch (error) {
                console.error("Error in fetching products:", error);
                res.status(500).send({ error });
            }
        })

        //Pagination starts
        app.get('/all-products', async (req, res) => {
            const page = parseInt(req.query.page) - 1
            const size = parseInt(req.query.size)

            const cursor = productCollection.find();
            const result = await cursor
                .skip(page * size)
                .limit(size)
                .toArray();
            res.send(result)
        })
        //Product count
        app.get('/product-count', async (req, res) => {
            const count = await productCollection.estimatedDocumentCount();
            res.send({ count })
        })
        //Pagination Ends



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Ecommerce is running')
})

app.listen(port, () => {
    console.log(`Ecommerce is running on port ${port}`)
})