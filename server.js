import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import axios from "axios"; // For making HTTP requests

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(
    "mongodb+srv://divya-3223:RwPUvXS5w0vwYDQa@cluster0.d4gdk.mongodb.net/toggleDB",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const toggleSchema = new mongoose.Schema(
  {
    value: Number,
  },
  { versionKey: false }
);

const Toggle = mongoose.model("Toggle", toggleSchema);

// ThingSpeak API Key and Base URL
const THINGSPEAK_API_KEY = "T5J32SCNJ8DS8NST"; // Your ThingSpeak Write API Key
const THINGSPEAK_URL = "https://api.thingspeak.com/update";

// Fetch toggle state
app.get("/toggle", async (req, res) => {
  try {
    const toggle = await Toggle.findOne(); // Fetch the most recent toggle value
    res.json(toggle || { value: 0 }); // Default to 0 if no toggle is found
  } catch (error) {
    console.error("Error fetching toggle:", error);
    res.status(500).json({ error: "Failed to fetch toggle value" });
  }
});

// Update toggle state
app.post("/toggle", async (req, res) => {
  const { value } = req.body;

  try {
    // Save toggle value to MongoDB
    const newToggle = new Toggle({ value });
    await newToggle.save();

    // Send toggle value to ThingSpeak
    const thingSpeakURL = `${THINGSPEAK_URL}?api_key=${THINGSPEAK_API_KEY}&field1=${value}`;
    const response = await axios.get(thingSpeakURL);

    // Check if ThingSpeak updated successfully
    if (response.data === 0) {
      console.error("Error updating ThingSpeak: Rate limit or invalid API key");
      res
        .status(429)
        .send(
          "Failed to send data to ThingSpeak: Rate limit or invalid API key"
        );
    } else {
      res
        .status(201)
        .send("Toggle value saved and sent to ThingSpeak successfully!");
    }
  } catch (error) {
    console.error("Error saving or sending toggle value:", error);
    res.status(500).send("Error saving toggle value!");
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
