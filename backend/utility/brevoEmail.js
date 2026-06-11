const axios = require('axios');

class BrevoEmail {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.senderEmail = process.env.BREVO_SENDER_EMAIL;
    this.senderName = process.env.BREVO_SENDER_NAME;
    this.baseURL = 'https://api.brevo.com/v3';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Send a single email
   * @param {Object} params - Email parameters
   * @param {string} params.to - Recipient email
   * @param {string} params.toName - Recipient name
   * @param {string} params.subject - Email subject
   * @param {string} params.htmlContent - HTML content
   * @param {string} params.textContent - Plain text content (optional)
   * @returns {Promise<Object>}
   */
  async sendEmail({ to, toName, subject, htmlContent, textContent = '' }) {
    try {
      const payload = {
        sender: {
          email: this.senderEmail,
          name: this.senderName,
        },
        to: [
          {
            email: to,
            name: toName || to.split('@')[0] || 'User',
          },
        ],
        subject: subject,
        htmlContent: htmlContent,
        textContent: textContent || this.stripHtml(htmlContent),
      };

      const response = await this.client.post('/smtp/email', payload);
      console.log(`Email sent successfully to ${to}`);
      return response.data;
    } catch (error) {
      console.error('Brevo email error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send email with CC/BCC
   * @param {Object} params
   */
  async sendEmailWithOptions({ to, toName, cc, bcc, subject, htmlContent, textContent = '', replyTo }) {
    try {
      const payload = {
        sender: {
          email: this.senderEmail,
          name: this.senderName,
        },
        to: [
          {
            email: to,
            name: toName || to.split('@')[0] || 'User',
          },
        ],
        subject: subject,
        htmlContent: htmlContent,
        textContent: textContent || this.stripHtml(htmlContent),
      };

      if (cc && cc.length) {
        payload.cc = cc.map(email => ({ email }));
      }

      if (bcc && bcc.length) {
        payload.bcc = bcc.map(email => ({ email }));
      }

      if (replyTo) {
        payload.replyTo = { email: replyTo };
      }

      const response = await this.client.post('/smtp/email', payload);
      console.log(`Email sent successfully to ${to}`);
      return response.data;
    } catch (error) {
      console.error('Brevo email error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send email to multiple recipients
   * @param {Object} params
   */
  async sendEmailToMultiple({ recipients, subject, htmlContent, textContent = '' }) {
    try {
      const payload = {
        sender: {
          email: this.senderEmail,
          name: this.senderName,
        },
        to: recipients.map(recipient => ({
          email: recipient.email,
          name: recipient.name || recipient.email.split('@')[0] || 'User',
        })),
        subject: subject,
        htmlContent: htmlContent,
        textContent: textContent || this.stripHtml(htmlContent),
      };

      const response = await this.client.post('/smtp/email', payload);
      console.log(`Email sent to ${recipients.length} recipients`);
      return response.data;
    } catch (error) {
      console.error('Brevo email error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Helper to strip HTML tags for plain text version
   */
  stripHtml(html) {
    return html
      .replace(/<style[^>]*>.*<\/style>/gi, '')
      .replace(/<script[^>]*>.*<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Singleton instance
const brevoEmail = new BrevoEmail();

module.exports = brevoEmail;