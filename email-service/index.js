require('dotenv/config');
const amqp = require('amqplib');
const nodemailer = require('nodemailer');

const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const queue = process.env.RABBITMQ_EMAIL_QUEUE || 'email.registration';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: Number(process.env.SMTP_PORT || 1025),
  secure: process.env.SMTP_SECURE === 'true',
  ...(process.env.SMTP_USER
    ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' } }
    : {}),
});

async function start() {
  const connection = await amqp.connect(rabbitUrl);
  const channel = await connection.createChannel();
  await channel.assertQueue(queue, { durable: true });
  await channel.prefetch(1);

  console.log(`Email service слушает очередь "${queue}"`);

  await channel.consume(queue, async (message) => {
    if (!message) return;

    try {
      const payload = JSON.parse(message.content.toString('utf8'));
      if (!payload.to || typeof payload.to !== 'string') {
        throw new Error('В сообщении отсутствует адрес получателя');
      }

      const name = payload.name?.trim() || payload.to;
      const roleText = payload.role === 'company' ? 'работодателя' : 'соискателя';

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'FindJob <noreply@findjob.local>',
        to: payload.to,
        subject: 'Добро пожаловать в FindJob',
        text: `Здравствуйте, ${name}!\n\nВы успешно зарегистрировались в FindJob как ${roleText}.`,
        html: `<p>Здравствуйте, <b>${escapeHtml(name)}</b>!</p><p>Вы успешно зарегистрировались в FindJob как ${roleText}.</p>`,
      });

      channel.ack(message);
      console.log(`Письмо отправлено: ${payload.to}`);
    } catch (error) {
      console.error(`Не удалось отправить письмо: ${error.message}`);
      channel.nack(message, false, false);
    }
  });

  connection.on('close', () => {
    console.error('Соединение RabbitMQ закрыто');
    process.exit(1);
  });
  connection.on('error', (error) => {
    console.error(`Ошибка RabbitMQ: ${error.message}`);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character]);
}

start().catch((error) => {
  console.error(`Email service не запущен: ${error.message}`);
  process.exit(1);
});
