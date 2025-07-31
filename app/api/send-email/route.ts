import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface MarathonDetails {
  otp?: string;
  raceCategory?: string;
  tShirtSize?: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
}

interface EmailUserData {
  personal_info: PersonalInfo;
  marathon_details: MarathonDetails;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const getEmailTemplate = (userData: EmailUserData) => {
  if (userData.marathon_details.otp) {
    const mobile = userData.personal_info.mobile || 'Not provided';
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
          <h1>OTP Verification</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p>Hello ${userData.personal_info.firstName || 'there'},</p>
          <p>Your OTP for ApizRace registration is:</p>
          <h2 style="color: #4CAF50; text-align: center; font-size: 32px; letter-spacing: 5px; margin: 20px 0;">
            ${userData.marathon_details.otp}
          </h2>
          <p><strong>Mobile Number:</strong> ${mobile}</p>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email or contact our support immediately.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            For security reasons, please do not share this OTP with anyone.
          </p>
        </div>
      </div>
    `;
  }

  return `
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">ApizRace 2025</h1>
            <p style="margin: 10px 0 0 0;">Registration Confirmation</p>
          </div>
          <div style="padding: 20px;">
            <p>Dear ${userData.personal_info.firstName} ${userData.personal_info.lastName},</p>
            <p>Thank you for registering for ApizRace 2025! Your registration has been successfully completed.</p>
            <p><strong>Registration Details:</strong></p>
            <ul style="list-style-type: none; padding: 0;">
              <li><strong>Race Category:</strong> ${userData.marathon_details.raceCategory}</li>
              <li><strong>T-Shirt Size:</strong> ${userData.marathon_details.tShirtSize}</li>
            </ul>
            <p>We will send you further details about the race day schedule and requirements closer to the event date.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #666;">
            <p>Best regards,<br>Team ApizRace 2025</p>
          </div>
        </div>
  `;
};

export async function POST(request: Request) {
  try {
    const { userData }: { userData: EmailUserData } = await request.json();

    const mailOptions = {
      from: `"ApizRace" <${process.env.SMTP_USER}>`,
      to: userData.personal_info.email,
      subject: "Registration Confirmation - ApizRace 2025",
      html: getEmailTemplate(userData),
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("SMTP send error", error);
    return NextResponse.json({ message: "Failed to send email", error }, { status: 500 });
  }
}
