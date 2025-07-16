
const express = require('express');
const nodemailer = require('nodemailer');
const Airtable = require('airtable');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Airtable setup
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'YOUR_AIRTABLE_API_KEY';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'YOUR_AIRTABLE_BASE_ID';
const base = new Airtable({apiKey: AIRTABLE_API_KEY}).base(AIRTABLE_BASE_ID);

// Email setup (suggest using environment variables for production)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'hello@cognitioplus.com',
    pass: process.env.EMAIL_PASS || 'YOUR_EMAIL_PASSWORD'
  }
});

const ADMIN_EMAIL = 'hello@cognitioplus.com';
const ADMIN_PHONE = '+639541986522';

app.post('/api/book-custom-plan', async (req, res) => {
  try {
    const {
      userType, serviceCategory, subService, concerns, date, time, participants,
      customPlanName, customPlanCost, customPlanResources, customPlanDuration, userEmail
    } = req.body;

    // Generate booking summary
    const summary = `
Booking Summary for Cognitio+:

Stakeholder Category: ${userType}
Service Category: ${serviceCategory}
Service Type: ${subService}
Concerns/Needs: ${concerns}
Preferred Date: ${date}
Preferred Time: ${time}
Participants: ${participants}

Custom Plan/Package:
- Name: ${customPlanName || '-'}
- Cost: ${customPlanCost ? '₱'+customPlanCost : '-'}
- Resources: ${customPlanResources || '-'}
- Duration: ${customPlanDuration || '-'}

We will contact you soon. For queries, email hello@cognitioplus.com or call +63 954 198 6522.
    `.trim();

    // Log to Airtable
    await base('Bookings').create([
      {
        fields: {
          Stakeholder: userType,
          "Service Category": serviceCategory,
          "Service Type": subService,
          Concerns: concerns,
          "Preferred Date": date,
          "Preferred Time": time,
          "Participants": participants,
          "Custom Plan Name": customPlanName,
          "Custom Plan Cost": customPlanCost,
          "Custom Plan Resources": customPlanResources,
          "Custom Plan Duration": customPlanDuration,
          "User Email": userEmail
        }
      }
    ]);

    // Send emails
    // To admin, client, (and partner if you have their email logic)
    const recipients = [userEmail, ADMIN_EMAIL];
    const mailOptions = {
      from: ADMIN_EMAIL,
      to: recipients,
      subject: 'Cognitio+ Booking Summary',
      text: summary
    };

    await transporter.sendMail(mailOptions);

    res.json({ status: 'success', message: 'Booking processed and emails sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to process booking.' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
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
