import { Router } from "express";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import { contactSchema } from "../validation";

const r = Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
});

const hasSmtp =
  !!process.env.SMTP_HOST &&
  !!process.env.SMTP_USER &&
  !!process.env.SMTP_PASS &&
  !!process.env.CONTACT_INBOX;

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT || 587),
      auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    })
  : null;

/**
 * POST /api/contact
 * body: { name, email, topic, message }
 */
r.post("/", limiter, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { name, email, topic, message } = parsed.data;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"RateMySchedule" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_INBOX!,
        subject: `[contact] ${topic}`,
        text: `from: ${name} <${email}>\n\n${message}`,
      });
      return res.json({ ok: true, sent: true });
    } catch (err) {
      console.error("contact mail error", err);
      return res.status(500).json({ ok: false, error: "failed to send" });
    }
  } else {
    // dev fallback
    console.log("[contact] (no smtp configured)", { name, email, topic, message });
    return res.json({ ok: true, sent: false, note: "smtp not configured; logged to server" });
  }
});

export default r;
