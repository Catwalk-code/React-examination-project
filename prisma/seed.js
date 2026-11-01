// Скрипт заполнения базы данных тестовыми данными (prisma db seed).
// Prisma 7 работает через driver-адаптер pg — клиент обязательно создаётся с adapter.
// Все тестовые данные — белорусские (компании, соискатели, города, телефоны +375).
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
    data: { email: 'admin@findjob.by', passhash: hash('admin123'), role: 'admin' },
  });

  const pandaUser = await prisma.user.create({
    data: { email: 'hr@panda.by', passhash: hash('company123'), role: 'company' },
  });
  const epamUser = await prisma.user.create({
    data: { email: 'hr.epam@by.example', passhash: hash('company123'), role: 'company' },
  });
  const belitaUser = await prisma.user.create({
    data: { email: 'kadry@belita.by', passhash: hash('company123'), role: 'company' },
  });

  const ivanovUser = await prisma.user.create({
    data: { email: 'ivan.kruhlaetski@email.by', passhash: hash('seeker123'), role: 'applicant' },
  });
  const girafovUser = await prisma.user.create({
    data: { email: 'gena.sakolowski@email.by', passhash: hash('seeker123'), role: 'applicant' },
  });
  const pustovUser = await prisma.user.create({
    data: { email: 'anna.pustavoi@email.by', passhash: hash('seeker123'), role: 'applicant' },
  });

  console.log('Создание компаний...');
  const techCorp = await prisma.company.create({
    data: {
      userId: pandaUser.id,
      name: 'Панда Девелопмент',
      description: 'Разработка корпоративного ПО и веб-сервисов, Минск.',
      website: 'https://pandadev.by',
      address: 'г. Минск, пр-т Независимости, 58',
    },
  });
  const dataflowCorp = await prisma.company.create({
    data: {
      userId: epamUser.id,
      name: 'ЭПАМ Систез',
      description: 'Аутсорс-разработка, аналитика больших данных и BI-системы.',
      website: 'https://devexp.by',
      address: 'г. Минск, ул. Козлова, 15',
    },
  });
  const greenCorp = await prisma.company.create({
    data: {
      userId: belitaUser.id,
      name: 'Белита',
      description: 'Производство косметики и бытовой химии, Бобруйск.',
      website: 'https://belita.by',
      address: 'г. Бобруйск, ул. Советская, 64',
    },
  });

  console.log('Создание соискателей...');
  const ivanov = await prisma.applicant.create({
    data: {
      userId: ivanovUser.id,
      firstName: 'Иван',
      lastName: 'Круглецкий',
      phone: '+375 29 123-45-67',
    },
  });
  const girafov = await prisma.applicant.create({
    data: {
      userId: girafovUser.id,
      firstName: 'Геннадий',
      lastName: 'Соколовский',
      phone: '+375 33 234-56-78',
    },
  });
  const pustov = await prisma.applicant.create({
    data: {
      userId: pustovUser.id,
      firstName: 'Анна',
      lastName: 'Пустовойтова',
      phone: '+375 44 345-67-89',
    },
  });

  console.log('Создание резюме...');
  const resumeIvanovBackend = await prisma.resume.create({
    data: {
      applicantId: ivanov.id,
      isPrimary: true,
      title: 'Backend-разработчик (Node.js)',
      skills: 'Node.js, Express, PostgreSQL, Docker',
      experience: '3 года в разработке микросервисов для финтеха, Минск.',
    },
  });
  const resumeGirafovAnalyst = await prisma.resume.create({
    data: {
      applicantId: girafov.id,
      isPrimary: true,
      title: 'Аналитик данных',
      skills: 'SQL, Python, Power BI, Excel',
      experience: '2 года подготовки отчётности и дашбордов в ритейле, Гомель.',
    },
  });
  const resumePustovJunior = await prisma.resume.create({
    data: {
      applicantId: pustov.id,
      isPrimary: true,
      title: 'Junior QA-инженер',
      skills: 'Тест-кейсы, Postman, основы автотестов',
      experience: 'Учебные проекты, прохождение курса по ручному тестированию в БГУИР.',
    },
  });

  console.log('Создание вакансий...');
  const vacDev = await prisma.vacancy.create({
    data: {
      companyId: techCorp.id,
      title: 'Backend-разработчик',
      description: 'Разработка REST API и микросервисов на Node.js.',
      salaryFrom: 4500,
      salaryTo: 6800,
      location: 'Минск',
      isRemote: true,
    },
  });
  const vacAnalyst = await prisma.vacancy.create({
    data: {
      companyId: dataflowCorp.id,
      title: 'Аналитик данных',
      description: 'Построение отчётов, витрин данных и дашбордов.',
      salaryFrom: 3500,
      salaryTo: 5200,
      location: 'Брест',
      isRemote: false,
    },
  });
  const vacEngineer = await prisma.vacancy.create({
    data: {
      companyId: greenCorp.id,
      title: 'Инженер по энергоэффективности',
      description: 'Аудит и оптимизация потребления энергии на производствах.',
      salaryFrom: 2800,
      salaryTo: 4000,
      location: 'Бобруйск',
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
      coverLetter: 'Досведчаны backend-распрацошчык, буду рад далучыцца да каманды.',
    },
  });
  await prisma.response.create({
    data: {
      vacancyId: vacAnalyst.id,
      applicantId: girafov.id,
      resumeId: resumeGirafovAnalyst.id,
      status: 'viewed',
      coverLetter: 'Маю вопыт працы з вялікімі данымі і BI-інструментамі.',
    },
  });
  await prisma.response.create({
    data: {
      vacancyId: vacEngineer.id,
      applicantId: pustov.id,
      resumeId: resumePustovJunior.id,
      status: 'new',
      coverLetter: 'Гатовая развівацца ў сферы энергетыкі, хутка вучуся.',
    },
  });

  console.log('Создание отзывов о компаниях...');
  await prisma.review.create({
    data: {
      companyId: techCorp.id,
      seekerId: ivanov.id,
      rating: 5,
      comment: 'Выдатная кампанія: сумленнае кіраўніцтва, белая зарплата.',
    },
  });
  await prisma.review.create({
    data: {
      companyId: dataflowCorp.id,
      seekerId: girafov.id,
      rating: 4,
      comment: 'Цікавыя задачы па аналітыцы, але часам затрымліваюць рэвію.',
    },
  });
  await prisma.review.create({
    data: {
      companyId: greenCorp.id,
      seekerId: pustov.id,
      rating: 3,
      comment: 'Нядрэнны калектыў, але працэсы онбордынгу сыраватыя.',
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
