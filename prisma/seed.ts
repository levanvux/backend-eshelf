/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '../src/generated/prisma/client';
import { Role, Language } from '../src/generated/prisma/enums';
import * as bcrypt from 'bcrypt';

import { PrismaPg } from '@prisma/adapter-pg';
import { books } from './books.detail';

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Creating admin user...');
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@eshelf.com' },
  });
  if (existing) {
    console.log('Admin already exists');
    throw new Error();
  } else {
    const hashedPassword = await bcrypt.hash('admindz123', 10);
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@eshelf.com',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    console.log('Admin user created: admin@eshelf.com / admindz123\n');
  }

  console.log('Seeding books...');
  const insertedPublishers = {};
  for (const book of books) {
    let publisher;
    if (!insertedPublishers[book.publisher]) {
      publisher = await prisma.publisher.create({
        data: { name: book.publisher },
      });
      insertedPublishers[book.publisher] = publisher;
    } else {
      publisher = insertedPublishers[book.publisher];
    }

    const bookSizeInfo = book.size.split(' ');

    const createdBook = await prisma.book.create({
      data: {
        isbn: book.isbn,
        title: book.title,
        description: book.description,
        year: book.year,
        language:
          book.language === 'Tiếng Việt'
            ? Language.VIETNAMESE
            : Language.ENGLISH,
        pages: book.pages,
        size:
          bookSizeInfo[1] == 'MB'
            ? Number(bookSizeInfo[0]) * 1024
            : Number(bookSizeInfo[0]),

        coverImage: book.coverUrl.slice(20),
        pdfPath: book.pdfUrl.slice(6),
        publisherId: publisher.id,
      },
    });

    const insertedAuthors = {};
    for (const authorName of book.author) {
      let author;
      if (insertedAuthors[authorName]) {
        author = insertedAuthors[authorName];
      } else {
        author = await prisma.author.create({
          data: { name: authorName },
        });
        insertedAuthors[authorName] = author;
      }

      await prisma.bookAuthor.upsert({
        where: {
          bookId_authorId: { bookId: createdBook.id, authorId: author.id },
        },
        update: {},
        create: { bookId: createdBook.id, authorId: author.id },
      });
    }

    const insertedTranslators = {};
    for (const translatorName of book.translator) {
      let translator;
      if (insertedTranslators[translatorName]) {
        translator = insertedTranslators[translatorName];
      } else {
        translator = await prisma.translator.create({
          data: { name: translatorName },
        });
        insertedTranslators[translatorName] = translator;
      }

      await prisma.bookTranslator.upsert({
        where: {
          bookId_translatorId: {
            bookId: createdBook.id,
            translatorId: translator.id,
          },
        },
        update: {},
        create: { bookId: createdBook.id, translatorId: translator.id },
      });
    }

    for (const genreName of book.genres) {
      const genre = await prisma.genre.upsert({
        where: { name: genreName },
        update: {},
        create: { name: genreName },
      });
      await prisma.bookGenre.upsert({
        where: {
          bookId_genreId: { bookId: createdBook.id, genreId: genre.id },
        },
        update: {},
        create: { bookId: createdBook.id, genreId: genre.id },
      });
    }

    console.log(`Seeded book: ${book.title}`);
  }
  console.log('Completed seeding books');
}

main()
  .catch((err) => {
    console.log(
      '\nYou already seeded the database, if you want to seed again, please reset the database first\n',
    );
    console.error(err);
  })
  .finally(() => prisma.$disconnect());
