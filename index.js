const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = 3000;

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function connectDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db('busDB');
    const locationCollection = db.collection('location');

    // Get location
    app.get('/location', async (req, res) => {
      try {
        const result = await locationCollection.findOne({ _id: new ObjectId("660049f9ae79ae13edad47fc") });
        res.json(result);
      } catch (error) {
        console.error("Error fetching location:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Update location
    app.put('/updateLocation', async (req, res) => {
      const locationId = "660049f9ae79ae13edad47fc";
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      try {
        const result = await locationCollection.updateOne(
          { _id: ObjectId(locationId) },
          { $set: { latitude, longitude } }
        );
        if (result.matchedCount === 1) {
          res.json({ message: "Location updated successfully" });
        } else {
          res.status(404).json({ error: "Location not found" });
        }
      } catch (error) {
        console.error("Error updating location:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Ping MongoDB deployment
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged MongoDB deployment successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

connectDatabase();

// Default route
app.get('/', (req, res) => {
  res.send('Bus server working fine!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
