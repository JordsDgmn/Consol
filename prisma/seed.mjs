import pkg from '@prisma/client';
const { PrismaClient } = pkg;

async function main() {
  const user = await prisma.user.create({
    data: {
      username: 'testuser',
    },
  });

  const note = await prisma.note.create({
    data: {
      user_id: user.user_id,
      title: 'Seeded Note',
      content: 'This is a seeded note content.',
      word_count: 6,
      is_verbatim: true,
    },
  });

  await prisma.verbatimSegment.createMany({
    data: [
      {
        note_id: note.note_id,
        start_index: 0,
        end_index: 20,
        expected_text: 'This is a seeded',
        order_sensitive: true,
      },
      {
        note_id: note.note_id,
        start_index: 21,
        end_index: 40,
        expected_text: 'note content',
        order_sensitive: false,
      },
    ],
  });

  await prisma.session.create({
    data: {
      user_id: user.user_id,
      note_id: note.note_id,
      session_accuracy: 89.5,
      session_speed: 1.2,
      session_mastery: 2.5,
      score_breakdown: { content: 'Good job!' },
      start_time: new Date(),
      end_time: new Date(),
      duration: 600,
      recollected_word_count: 6,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
