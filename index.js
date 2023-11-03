
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.send("server is running...")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l6kpz6n.mongodb.net/taskManagement`;

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
        client.connect();
        // Send a ping to confirm a successful connection

        const todoUserCollection = client.db('taskManagement').collection('todoUser');
        const todoCollection = client.db('taskManagement').collection('todos');

        // add user in database
        app.post("/users", async (req, res) => {
            const user = req.body;
            //console.log(user);
            const query = { email: user.email };
            const existingUser = await todoUserCollection.findOne(query);
            //console.log(existingUser);
            if (existingUser) {
                return res.send({ message: 'user already exists' });
            }
            const result = await todoUserCollection.insertOne(user);
            res.send(result);
        })

        // create task route
        app.post("/create-task", async (req, res) => {
            const taskData = req.body;
            console.log(taskData)

            try {
                const result = await todoCollection.insertOne(taskData);
                res.status(201).json({
                    ok: true,
                    message: "Task is created"
                })
            }
            catch (error) {
                res.status(201).json({
                    ok: true,
                    message: "Task is created"
                })
            }
        })

        // fetch all todo form db based on email
        app.get('/todo', async (req, res) => {

            const { email } = req.query;
            console.log(email);

            if (!email) {
                res.send([]);
            }
            try {
                const query = { email: email };
                const result = await todoCollection.find(query).toArray();
                res.status(200).send(result);
            }
            catch (error) {
                res.status(500).send([])
            }

        })


        // delete task according to id
        app.delete("/delete-task/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) };
            try {
                const result = await todoCollection.deleteOne(query);
                res.status(200).send(result);
            }
            catch (error) {
                res.status(500).send([]);
            }
        })


        // update task 
        app.patch("/update-task", async (req, res) => {
           
            const { id, taskTitle, dueDate, priority, description } = req.body;
            //console.log(req.body);
            console.log(id)

            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    taskTitle,
                    dueDate,
                    priority,
                    description,
                }
            }
            try {
                const result = await todoCollection.updateOne(filter, updateDoc);
                res.status(201).json({
                    ok: true,
                    message: "Task is updated"
                })
            }
            catch (error) {
                res.status(500).json({
                    ok: false,
                    message: "Failed to update Task!!"
                })
            }
            
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);





app.listen(PORT, () => {
    console.log(`todo server is running on PORT : ${PORT}`)
})
