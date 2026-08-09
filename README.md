# Bloom & Bash Events Co.

Complete event decoration website with a responsive gallery, supplied party media, and a booking system.

## Run the website

Install Node.js, then open a terminal in this folder and run:

```text
npm install
npm start
```

Open `http://localhost:3000` in your browser.

## Booking data

Every submitted booking is validated and saved automatically in `data/bookings.json`. The `data` folder and JSON file are created on the first successful submission.

## Email notifications (optional)

Bookings are always saved locally. To also send each booking to your email, set these environment variables before starting the server:

- `SMTP_HOST`
- `SMTP_PORT` (usually `587`)
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` (optional)
- `BOOKINGS_TO_EMAIL`
- `SMTP_SECURE=true` only when your provider requires a secure connection

Never commit SMTP passwords to the project. Use environment variables or a local `.env` setup.

The website media is stored in `media/` and includes the supplied event photos and short video.
