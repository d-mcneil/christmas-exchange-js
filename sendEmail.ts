import { PUBLIC_KEY, PRIVATE_KEY, TEMPLATE_ID, SERVICE_ID } from "./credentials";

const SEND_EMAIL_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

interface EmailBody {
  email: string;
  to_name: string;
  gift_recipient: string;
  wish_list: string;
}

const sendEmail = (emailParams: EmailBody) =>
  fetch(SEND_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      template_params: emailParams,
      accessToken: PRIVATE_KEY,
    }),
  })
    .then(() => {
      console.log(`Email sent successfully to ${emailParams.to_name}.`);
    })
    .catch(() => {
      console.log(`Email failed to send to ${emailParams.to_name}!!!!!!!!!!!!!!!!!!!!`);
    });

export { sendEmail };
