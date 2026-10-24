// RETIRED (2026-10-14): the contact form is switched off. The folder name
// starts with "_", which Next.js treats as a private folder: the code stays
// here but isn't routed. To bring it back, rename the folder back (drop the
// "_"), remove the /contact redirect in next.config.mjs, and re-add /contact
// to app/sitemap.ts, lib/agent.ts, lib/system-prompt.ts, app/llms.txt and the
// chat's PAGE_META.
// 📖 Learn: Next.js private folders
import { type NextRequest, NextResponse } from "next/server"
// nodemailer is a Node.js library for sending email via SMTP.
// It only runs server-side (in an API route), never in the browser.
// 📖 Learn: nodemailer — https://nodemailer.com/about/
import nodemailer from "nodemailer"
import { getPostHogClient } from "@/lib/posthog-server"

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, phone, message } = await request.json()

    // Validate required fields — return 400 Bad Request early rather than
    // attempting to send an incomplete email.
    if (!fullName || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // The "transporter" is nodemailer's abstraction over an SMTP connection.
    // Credentials come from env vars (never hardcode them in source code).
    const transporter = nodemailer.createTransport( // was createTransporter, which doesn't exist (every send failed)
      {
      service: "outlook",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "r575li@uwaterloo.ca",
      subject: `New Contact Form Message from ${fullName}`,
      // Replace newlines with <br> so multi-line messages render correctly in HTML email.
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    }

    await transporter.sendMail(mailOptions)

    getPostHogClient().capture({
      distinctId: email,
      event: "contact_message_delivered",
      properties: { has_phone: !!phone },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
