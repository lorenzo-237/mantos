const { PrismaClient } = require('../prisma/generated/mantis-cli');

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Connexion réussie à la base de données mantis !');
  } catch (e) {
    console.error('Erreur de connexion :', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
