const nodemailer = require('nodemailer');

// Create a transporter for sending email notifications
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

// Function to send notification
const sendNotification = (subject, text) => {
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'recipient-email@example.com',
    subject,
    text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Example usage: Notify about a delayed shipment
const notifyDelayedShipment = (shipment) => {
  const subject = `Delayed Shipment Alert: ${shipment.cargo_id}`;
  const text = `The shipment with ID ${shipment.cargo_id} has been delayed. Please check the status.`;
  sendNotification(subject, text);
};
