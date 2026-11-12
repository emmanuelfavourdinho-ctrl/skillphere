import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Electrical', slug: 'electrical', description: 'Wiring and electrical repairs' },
    { name: 'Plumbing', slug: 'plumbing', description: 'Pipes, water systems and drainage' },
    { name: 'Carpentry', slug: 'carpentry', description: 'Woodwork and joinery' },
    { name: 'General Services', slug: 'general-services', description: 'General artisan and repair work' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const generalCategory = await prisma.category.findUnique({ where: { slug: 'general-services' } });

  if (generalCategory) {
    await prisma.skill.upsert({
      where: { slug: 'plumbing' },
      update: {},
      create: {
        categoryId: generalCategory.id,
        name: 'Plumbing',
        slug: 'plumbing',
        description: 'Pipe fitting and repairs',
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
