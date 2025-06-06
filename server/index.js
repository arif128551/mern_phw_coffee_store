require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

var express = require("express");
var cors = require("cors");
var app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mljuhsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log("Pinged your deployment. You successfully connected to MongoDB!");

		const database = client.db("mern_phw_coffee_store");
		const coffeesCollections = database.collection("coffees");
		const orderCollections = database.collection("orders");

		app.get("/api/coffees", async (req, res) => {
			const result = await coffeesCollections.find().toArray();
			res.send(result);
		});
		app.get("/api/coffees/:id", async (req, res) => {
			const id = req.params.id;
			const query = {
				_id: new ObjectId(id),
			};
			const result = await coffeesCollections.findOne(query);
			res.send(result);
		});

		app.get("/api/my-coffees", async (req, res) => {
			const email = req.query.email;
			const filter = {
				email,
			};
			const result = await coffeesCollections.find(filter).toArray();
			res.send(result);
		});

		app.post("/api/add-coffee", async (req, res) => {
			const data = req.body;
			const result = await coffeesCollections.insertOne(data);
			res.send(result);
		});

		app.patch("/api/coffee/:id/like", async (req, res) => {
			const coffeeId = req.params.id;
			const { email } = req.body;

			const coffee = await coffeesCollections.findOne({ _id: new ObjectId(coffeeId) });

			if (coffee.email === email) {
				return res.status(403).send({ message: "You can't like your own coffee!" });
			}

			if (coffee.likedBy.includes(email)) {
				return res.status(400).send({ message: "Already liked" });
			}

			const result = await coffeesCollections.updateOne({ _id: new ObjectId(coffeeId) }, { $push: { likedBy: email } });

			res.send({ success: true, result });
		});

		app.post("/api/order/:id", async (req, res) => {
			const coffeeId = req.params.id;
			const { buyerEmail } = req.body;

			const coffee = await coffeesCollections.findOne({ _id: new ObjectId(coffeeId) });
			if (!coffee) return res.status(404).send({ message: "Coffee not found" });

			if (coffee.email === buyerEmail) {
				return res.status(403).send({ message: "You can't order your own coffee." });
			}

			if (coffee.quantity <= 0) {
				return res.status(400).send({ message: "Out of stock" });
			}

			await coffeesCollections.updateOne({ _id: new ObjectId(coffeeId) }, { $inc: { quantity: -1 } });

			const order = {
				coffeeId,
				buyerEmail,
				orderTime: new Date(),
			};
			const result = await orderCollections.insertOne(order);

			res.send({ success: true, orderId: result.insertedId });
		});

		app.get("/api/my-orders", async (req, res) => {
			const email = req.query.email;
			if (!email) {
				return res.status(400).send({ message: "Email required" });
			}

			const orders = await orderCollections.find({ buyerEmail: email }).toArray();

			// ✅ প্রতিটা order এর জন্য coffee info আনো
			const ordersWithCoffee = await Promise.all(
				orders.map(async (order) => {
					const coffee = await coffeesCollections.findOne({
						_id: new ObjectId(order.coffeeId),
					});

					return {
						...order,
						coffeeName: coffee?.name,
						coffeePhoto: coffee?.photo,
						price: coffee?.price,
						quantity: coffee?.quantity,
					};
				})
			);

			res.send(ordersWithCoffee);
		});

		app.delete("/api/order/:id", async (req, res) => {
			const orderId = req.params.id;

			const order = await orderCollections.findOne({ _id: new ObjectId(orderId) });
			if (!order) return res.status(404).send({ message: "Order not found" });

			// ✅ quantity বাড়াও coffee database এ
			await coffeesCollections.updateOne({ _id: new ObjectId(order.coffeeId) }, { $inc: { quantity: 1 } });

			// ✅ order ডিলিট করো
			const result = await orderCollections.deleteOne({ _id: new ObjectId(orderId) });

			res.send({ success: true, deletedCount: result.deletedCount });
		});
	} finally {
	}
}
run().catch(console.dir);

module.exports = app;

app.get("/", async (req, res) => {
	res.send("Hello from home page of server");
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
