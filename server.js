const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname);
const dataDir = path.join(__dirname, 'data');
const bookingsFile = path.join(dataDir, 'bookings.json');

app.use(express.json({ limit: '50kb' }));
app.use(express.static(publicDir));

async function readBookings() {
  try {
    return JSON.parse(await fs.readFile(bookingsFile, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function saveBooking(booking) {
  await fs.mkdir(dataDir, { recursive: true });
  const bookings = await readBookings();
  bookings.push(booking);
  await fs.writeFile(bookingsFile, JSON.stringify(bookings, null, 2));
}

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

app.post('/api/bookings', async (req, res) => {
  const { name, email, eventType, date, message = '' } = req.body || {};
  if (!name || !email || !eventType || !date) {
    return res.status(400).json({ message: 'Please fill in your name, email, event type, and event date.' });
  }

  const booking = {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    email: String(email).trim(),
    eventType: String(eventType).trim(),
    date: String(date).trim(),
    message: String(message).trim(),
    createdAt: new Date().toISOString()
  };

  try {
    await saveBooking(booking);
    const transporter = createTransporter();
    let emailSent = false;

    if (transporter && process.env.BOOKINGS_TO_EMAIL) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.BOOKINGS_TO_EMAIL,
        replyTo: booking.email,
        subject: `New ${booking.eventType} booking request from ${booking.name}`,
        text: `Name: ${booking.name}\nEmail: ${booking.email}\nEvent: ${booking.eventType}\nDate: ${booking.date}\n\n${booking.message}`
      });
      emailSent = true;
    }

    res.status(201).json({
      message: emailSent
        ? 'Booking saved and sent to our team. We will contact you within 1 business day.'
        : 'Booking saved successfully. We will contact you within 1 business day.',
      emailSent
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'We could not save your request. Please try again.' });
  }
});

app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));

app.listen(PORT, () => console.log(`Bloom & Bash is running at http://localhost:${PORT}`));
