const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const groups = await prisma.group.findMany();
  for (const g of groups) {
    console.log(g.name, g.logoUrl ? g.logoUrl.length + ' chars' : 'no logo');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
