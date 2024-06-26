require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://gadget-genie-3f9f7.web.app',
        'https://gadget-genie-3f9f7.firebaseapp.com'
    ]
}));
app.use(express.json());


//start of mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mfte2wh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();

        //create a database for services in mongoDB
        const serviceCollection = client.db('servicesDB').collection('services');

        //create a database for bookings in mongodb
        const bookingCollection = client.db('servicesDB').collection('bookings');


        // ============== services related api ========= //
        //create/send services data from client to DB
        app.post('/services', async (req, res) => {
            const newService = req.body;
            // console.log('New added service', newService);

            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })


        //get all the services data in api
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        //get the first six data for home page
        app.get('/firstsixservices', async (req, res) => {
            const cursor = serviceCollection.find().limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        //get a single service 
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const result = await serviceCollection.findOne(query);
            res.send(result);
        })

        //get services data that a specific user added in the DB
        app.get('/myservices', async (req, res) => {
            // console.log(req.query.providerEmail);
            let query = {};

            if (req.query?.providerEmail) {
                query = { providerEmail: req.query.providerEmail }
            }
            const result = await serviceCollection.find(query).toArray();
            res.send(result);
        })


        //delete a service from DB
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);

            res.send(result);
        })

        //update an existing service
        app.patch('/services/:id', async (req, res) => {
            const id = req.params.id;
            // const user = req.body;
            const query = { _id: new ObjectId(id) };
            const updatedService = req.body;
            // console.log(id, updatedService);

            const updateDoc = {
                $set: {
                    serviceName: updatedService.serviceName,
                    imgURL: updatedService.imgURL,
                    serviceArea: updatedService.serviceArea,
                    price: updatedService.price,
                    description: updatedService.description,
                    status: updatedService.status
                },
            };

            const options = { upsert: true };

            const result = await serviceCollection.updateOne(query, updateDoc, options);

            // console.log(result);
            res.send(result);
        })


        //================ booking related api ========//
        //create/send booking data from client to DB
        app.post('/bookings', async (req, res) => {
            const newBooking = req.body;
            // console.log('New booking added', newBooking);

            const result = await bookingCollection.insertOne(newBooking);
            res.send(result);
        })

        app.get('/bookings', async (req, res) => {
            // console.log(req.query.loggedUserEmail);
            const query = {
                bookedUserEmail: req.query.loggedUserEmail
            }

            const result = await bookingCollection.find(query).toArray();
            // console.log(result);
            res.send(result);
        })


        //================= services to do related api ========
        app.get('/todo-services/:email', async (req, res) => {
            const currentUserEmail = req.params.email;

            const query = {
                providerEmail: currentUserEmail
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




//start server
app.get('/', (req, res) => {
    res.send('Gadget Genie server is running')
})

app.listen(port, () => {
    // console.log(`server is running at port ${port}`);
})