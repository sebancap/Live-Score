import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  console.log('Cleaning database...');
  // Delete all records in order of constraints (children first)
  await prisma.result.deleteMany({});
  console.log('Deleted all Results');
  
  await prisma.participant.deleteMany({});
  console.log('Deleted all Participants');
  
  // NOTE: If you want to keep Groups, Categories, and Programs, comment out the lines below!
  // await prisma.program.deleteMany({});
  // console.log('Deleted all Programs');
  
  // await prisma.group.deleteMany({});
  // console.log('Deleted all Groups');
  
  // await prisma.category.deleteMany({});
  // console.log('Deleted all Categories');

  console.log('Database cleaned successfully!');
}

clean().catch(console.error).finally(() => prisma.());
