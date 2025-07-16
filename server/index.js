const express = require('express');
const nodemailer = require('nodemailer');
const Airtable = require('airtable');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Airtable setup
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'patuq1dXJ75ZxNq22.51f9284483cbb602ff3a347c10dc41472a8c5874b94b692d4324d9a64bba2507';
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
