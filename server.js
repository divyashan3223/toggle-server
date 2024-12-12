import express from "express";
import cors from "cors";
import mongoose from "mongoose";

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

app.get("/toggle", async (req, res) => {
  try {
    const toggles = await Toggle.find();
    res.json(toggles);
  } catch (error) {
    console.error("Error fetching toggles:", error);
    res.status(500).json({ error: "Failed to fetch toggle values" });
  }
});

app.post("/toggle", async (req, res) => {
  const { value } = req.body;

  try {
    const newToggle = new Toggle({ value });
    await newToggle.save();
    res.status(201).send("Toggle value saved successfully!");
  } catch (error) {
    res.status(500).send("Error saving toggle value!");
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
