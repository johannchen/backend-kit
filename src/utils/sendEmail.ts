import * as SparkPost from 'sparkpost';
const client = new SparkPost(process.env.SPARKPOST_API_KEY);

export const sendEmail = async (
  recipient: string,
  url: string,
  subject: string
) => {
  const response = await client.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: 'testing@sparkpostbox.com',
      subject,
      html: `<html>
        <body>
        <a href="${url}">${subject}</a>
        </body>
        </html>`
    },
    recipients: [{ address: recipient }]
  });
  console.log(response);
};
