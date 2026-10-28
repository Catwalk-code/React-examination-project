// Скрипт заполнения базы данных тестовыми данными (prisma db seed).
// Prisma 7 работает через driver-адаптер pg — клиент обязательно создаётся с adapter.
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log('Очистка таблиц...');
  // Порядок удаления важен из-за внешних ключей (каскадное удаление не отключено,
  // но удаляем явно «сверху вниз» для наглядности и сброса счётчиков).
  await prisma.review.deleteMany();
  await prisma.response.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.vacancy.deleteMany();
  await prisma.applicant.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('users', 'id'), 1, false)`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('companies', 'id'), 1, false)`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('applicants', 'id'), 1, false)`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('resumes', 'id'), 1, false)`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('vacancies', 'id'), 1, false)`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('responses', 'id'), 1, false)`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('reviews', 'id'), 1, false)`;

  console.log('Создание пользователей...');
  const hash = (pwd) => bcrypt.hashSync(pwd, 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@findjob.ru', passhash: hash('admin123'), role: 'admin' },
  });

  const techUser = await prisma.user.create({
    data: { email: 'techsolutionsinc@email.com', passhash: hash('company123'), role: 'company' },
  });
  const dataflowUser = await prisma.user.create({
    data: { email: 'dataflowsystems@email.com', passhash: hash('company123'), role: 'company' },
  });
  const greenUser = await prisma.user.create({
    data: { email: 'greenglobal@email.com', passhash: hash('company123'), role: 'company' },
  });

  const ivanovUser = await prisma.user.create({
    data: { email: 'ivanov@email.com', passhash: hash('seeker123'), role: 'applicant' },
  });
  const girafovUser = await prisma.user.create({
    data: { email: 'gena@email.com', passhash: hash('seeker123'), role: 'applicant' },
  });
  const pustovUser = await prisma.user.create({
    data: { email: 'empty@email.com', passhash: hash('seeker123'), role: 'applicant' },
  });

  console.log('Создание компаний...');
  const techCorp = await prisma.company.create({
    data: {
      userId: techUser.id,
      name: 'Techsolutions Inc.',
      description: 'Разработка корпоративного ПО и интеграционных решений.',
      website: 'https://techsolutions.example.com',
      address: 'г. Москва, ул. Тверская, 12',
    },
  });
  const dataflowCorp = await prisma.company.create({
    data: {
      userId: dataflowUser.id,
      name: 'Dataflow Systems',
      description: 'Аналитика больших данных, построение DWH и BI-систем.',
      website: 'https://dataflow.example.com',
      address: 'г. Санкт-Петербург, Невский пр., 20',
    },
  });
  const greenCorp = await prisma.company.create({
    data: {
      userId: greenUser.id,
      name: 'Greenglobal',
      description: 'Энергоэффективные технологии и «зелёная» энергетика.',
      website: 'https://greenglobal.example.com',
      address: 'г. Казань, ул. Баумана, 5',
    },
  });

  console.log('Создание соискателей...');
  const ivanov = await prisma.applicant.create({
    data: {
      userId: ivanovUser.id,
      firstName: 'Иван',
      lastName: 'Иванов',
      phone: '+7 900 123-45-67',
    },
  });
  const girafov = await prisma.applicant.create({
    data: {
      userId: girafovUser.id,
      firstName: 'Геннадий',
      lastName: 'Жирафов',
      phone: '+7 901 234-56-78',
    },
  });
  const pustov = await prisma.applicant.create({
    data: {
      userId: pustovUser.id,
      firstName: 'Пуст',
      lastName: 'Пустов',
      phone: '+7 902 345-67-89',
    },
  });

  console.log('Создание резюме...');
  const resumeIvanovBackend = await prisma.resume.create({
    data: {
      applicantId: ivanov.id,
      isPrimary: true,
      title: 'Backend-разработчик (Node.js)',
      skills: 'Node.js, Express, PostgreSQL, Docker',
      experience: '3 года в разработке микросервисов для финтеха.',
    },
  });
  const resumeGirafovAnalyst = await prisma.resume.create({
    data: {
      applicantId: girafov.id,
      isPrimary: true,
      title: 'Аналитик данных',
      skills: 'SQL, Python, Power BI, Excel',
      experience: '2 года подготовки отчётности и дашбордов в ритейле.',
    },
  });
  const resumePustovJunior = await prisma.resume.create({
    data: {
      applicantId: pustov.id,
      isPrimary: true,
      title: 'Junior QA-инженер',
      skills: 'Тест-кейсы, Postman, основы автотестов',
      experience: 'Учебные проекты, прохождение курса по ручному тестированию.',
    },
  });

  console.log('Создание вакансий...');
  const vacDev = await prisma.vacancy.create({
    data: {
      companyId: techCorp.id,
      title: 'Backend-разработчик',
      description: 'Разработка REST API и микросервисов на Node.js.',
      salaryFrom: 150000,
      salaryTo: 220000,
      location: 'Москва',
      isRemote: true,
    },
  });
  const vacAnalyst = await prisma.vacancy.create({
    data: {
      companyId: dataflowCorp.id,
      title: 'Аналитик данных',
      description: 'Построение отчётов, витрин данных и дашбордов.',
      salaryFrom: 120000,
      salaryTo: 170000,
      location: 'Санкт-Петербург',
      isRemote: false,
    },
  });
  const vacEngineer = await prisma.vacancy.create({
    data: {
      companyId: greenCorp.id,
      title: 'Инженер по энергоэффективности',
      description: 'Аудит и оптимизация потребления энергии на производствах.',
      salaryFrom: 100000,
      salaryTo: 150000,
      location: 'Казань',
      isRemote: false,
    },
  });

  console.log('Создание откликов...');
  await prisma.response.create({
    data: {
      vacancyId: vacDev.id,
      applicantId: ivanov.id,
      resumeId: resumeIvanovBackend.id,
      status: 'interview',
      coverLetter: 'Опытный backend-разработчик, буду рад присоединиться к команде.',
    },
  });
  await prisma.response.create({
    data: {
      vacancyId: vacAnalyst.id,
      applicantId: girafov.id,
      resumeId: resumeGirafovAnalyst.id,
      status: 'viewed',
      coverLetter: 'Имею опыт работы с большими данными и BI-инструментами.',
    },
  });
  await prisma.response.create({
    data: {
      vacancyId: vacEngineer.id,
      applicantId: pustov.id,
      resumeId: resumePustovJunior.id,
      status: 'new',
      coverLetter: 'Готов развиваться в сфере энергетики, быстро учусь.',
    },
  });

  console.log('Создание отзывов о компаниях...');
  await prisma.review.create({
    data: {
      companyId: techCorp.id,
      seekerId: ivanov.id,
      rating: 5,
      comment: 'Отличная компания: адекватное руководство, белая зарплата.',
    },
  });
  await prisma.review.create({
    data: {
      companyId: dataflowCorp.id,
      seekerId: girafov.id,
      rating: 4,
      comment: 'Интересные задачи по аналитике, но иногда задерживают ревью.',
    },
  });
  await prisma.review.create({
    data: {
      companyId: greenCorp.id,
      seekerId: pustov.id,
      rating: 3,
      comment: 'Неплохой коллектив, но процессы онбординга сыроваты.',
    },
  });

  console.log('Seed завершён успешно!');
  console.table({
    users: await prisma.user.count(),
    companies: await prisma.company.count(),
    applicants: await prisma.applicant.count(),
    resumes: await prisma.resume.count(),
    vacancies: await prisma.vacancy.count(),
    responses: await prisma.response.count(),
    reviews: await prisma.review.count(),
  });
}

main()
  .catch((e) => {
    console.error('Ошибка при выполнении seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
