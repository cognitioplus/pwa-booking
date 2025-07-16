const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Load Google Sheets API
const auth = new google.auth.GoogleAuth();
const sheets = google.sheets({
  version: "v4",
  auth
});

// POST /api/booking — Save to Google Sheets
app.post("/api/booking", async (req, res) => {
  const data = req.body;

  // Ensure spreadsheet ID is in env
  const spreadsheetId = process.env.SPREADSHEET_ID;
  if (!spreadsheetId) {
    return res.status(500).json({ error: "Spreadsheet ID not configured" });
  }

  const values = Object.values(data);

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Bookings!A1",
      valueInputOption: "RAW",
      requestBody: { values: [values] }
    });

    console.log("Booking saved successfully.");
    res.sendStatus(200);
  } catch (err) {
    console.error("Error saving to Google Sheets:", err.message);
    res.status(500).json({ error: "Failed to save booking request." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Cognitio+ Booking API running on port ${PORT}`);
});
