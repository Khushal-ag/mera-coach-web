import { siteConfig } from "@/config/site";

const SUPPORT_EMAIL = siteConfig.email;

export interface LegalSection {
  title: string;
  body: string;
}

/** Core text is shared with mera-coach-app `data/legalContent.ts`. Keep both in step. */
export const LEGAL_UPDATED = "Last updated: October 2026";

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    title: "Introduction",
    body: 'Mera Coach ("we", "our", "us") is a platform for wellness coaches to manage their coaching business and client relationships. This policy explains what information we collect through the app, how we use it, and the choices you have.',
  },
  {
    title: "Information We Collect",
    body: "When you register as a coach, we collect your name, mobile number, email address, and coaching category. When you use the app to manage clients, you may enter client information such as name, contact details, age, gender, height, weight, lifestyle habits, dietary preferences, medical conditions, and fitness goals. This client information is entered by you as the coach, on behalf of the people you work with.",
  },
  {
    title: "How We Use Your Information",
    body: "We use your account information to authenticate you, operate your coach profile, and connect you with prospective clients who submit enquiries through the platform. Client information you enter is used to power the features you use to manage that client’s coaching plan, such as lifestyle tracking, diet planning, and check-ups.",
  },
  {
    title: "Data Storage & Security",
    body: "Your session is stored securely on your device using the operating system’s secure storage, and all data is transmitted to our servers over encrypted connections. Passwords are never transmitted in plain text.",
  },
  {
    title: "Data Sharing",
    body: "We do not sell your information or your clients’ information to third parties. Data you enter is used solely to provide the coaching-management features of this app.",
  },
  {
    title: "Client Data Responsibility",
    body: "As a coach, you are responsible for obtaining appropriate consent from your clients before entering their personal and health information into the platform, and for handling that information in accordance with applicable data protection laws.",
  },
  {
    title: "Your Rights",
    body: `You can review and update your coach profile information from within the app. To request deletion of your account or associated data, email ${SUPPORT_EMAIL} from your registered email or mobile, or use Delete Account in Profile settings.`,
  },
  {
    title: "Website Visitors and Enquiries",
    body: "If you use the enquiry, BMI, contact or feedback forms on mera-coach.com, we collect the details you type in, such as your name, mobile number, email address and message. We pass enquiries to the coach you contacted, and BMI callback requests to a coach who can help. Public coach profiles, including name, photo, category, city, services, packages and posts, are visible to anyone and may be indexed by search engines.",
  },
  {
    title: "Payments",
    body: "Premium subscriptions are paid on this website through our payment partner. We receive confirmation of the payment and the plan, but we do not see or store your card or bank details.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this policy from time to time. Continued use of the app after changes are posted constitutes acceptance of the updated policy.",
  },
  {
    title: "Account & Data Deletion",
    body: `You may request deletion of your coach account and data we store for you by emailing ${SUPPORT_EMAIL} from your registered contact details. We will verify your request and complete deletion within a reasonable period, subject to any legal retention requirements.`,
  },
  {
    title: "Contact Us",
    body: `For privacy questions, support, or account deletion, email ${SUPPORT_EMAIL}.`,
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "Acceptance of Terms",
    body: "By creating a coach account on Mera Coach, you agree to these Terms & Conditions. If you do not agree, please do not use the app.",
  },
  {
    title: "Eligibility",
    body: "You must be a genuine wellness, fitness, nutrition, or health coach to register an account. You are responsible for the accuracy of the professional details you provide during registration.",
  },
  {
    title: "Your Account",
    body: "You are responsible for keeping your login credentials confidential and for all activity that happens under your account. Notify us immediately if you suspect unauthorized access.",
  },
  {
    title: "Acceptable Use",
    body: "You agree to use the app only to manage your own genuine coaching business and clients, and not to misuse the platform to submit false enquiries, impersonate other coaches, or attempt to access data that isn’t yours.",
  },
  {
    title: "Client Data You Enter",
    body: "Any client information you enter into the app is provided by you and remains your responsibility. You confirm that you have the right to enter this information and to use it for the coaching purposes the app provides.",
  },
  {
    title: "Service Availability",
    body: "We aim to keep the app available and reliable, but we do not guarantee uninterrupted access. Features may change, be added, or be removed as the platform evolves.",
  },
  {
    title: "Limitation of Liability",
    body: "Mera Coach is a management tool for coaches. It does not provide medical advice. You are solely responsible for the coaching, dietary, and health guidance you give your clients through the app.",
  },
  {
    title: "Termination",
    body: `We may suspend or terminate accounts that violate these terms. You may stop using the app at any time. To delete your account and data, email ${SUPPORT_EMAIL} or use Delete Account in Profile settings.`,
  },
  {
    title: "Premium Subscriptions",
    body: `Premium plans for coaches are sold on this website. Prices and plan length are confirmed at checkout, and payments are processed by our payment partner. Raise chargebacks or disputes with the payment partner or at ${SUPPORT_EMAIL}.`,
  },
  {
    title: "Public Profiles and Content",
    body: "You keep the rights to content you upload. You allow Mera Coach to host and display it to run the service. Public coach profiles may be indexed by search engines for discovery.",
  },
  {
    title: "Changes to These Terms",
    body: "We may update these terms from time to time. Continued use of the app after changes are posted constitutes acceptance of the updated terms.",
  },
];
