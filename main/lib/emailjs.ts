import emailjs from "@emailjs/browser";

export type EnquiryEmail = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

/**
 * Sends an enquiry notification through EmailJS.
 * Template variables: {{name}}, {{email}}, {{phone}}, {{service}}, {{message}}, {{time}}.
 * Never throws — the enquiry is already saved to the database, so an email
 * failure is logged rather than shown to the visitor.
 */
export async function sendEnquiryEmail(data: EnquiryEmail) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn("EmailJS env vars are missing — enquiry email not sent.");
    return;
  }

  try {
    const time = new Date().toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/London",
    });

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, { ...data, time }, {
      publicKey: PUBLIC_KEY,
    });
  } catch (error) {
    console.error("EmailJS send failed:", error);
  }
}
