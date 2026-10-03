const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs');

const prisma = new PrismaClient();

async function regeneratePasswords(batchName) {
  const batch = await prisma.batch.findUnique({ where: { name: batchName } });
  if (!batch) {
    console.error(`Batch '${batchName}' not found.`);
    return;
  }

  const students = await prisma.student.findMany({ where: { batchId: batch.id } });
  if (students.length === 0) {
    console.log(`No students found in batch '${batchName}'.`);
    return;
  }

  console.log(`Found ${students.length} students. Regenerating passwords...`);

  let csvContent = "Registration Number,Password\n";
  const operations = [];

  for (const student of students) {
    const plainPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    operations.push(
      prisma.student.update({
        where: { regNo: student.regNo },
        data: { password: hashedPassword, isFirstLogin: true }
      })
    );

    csvContent += `${student.regNo},${plainPassword}\n`;
  }

  // Execute updates
  const chunkSize = 100;
  for (let i = 0; i < operations.length; i += chunkSize) {
    await prisma.$transaction(operations.slice(i, i + chunkSize));
  }

  const filePath = `../${batchName.replace(/\s+/g, '_')}_Passwords.csv`;
  fs.writeFileSync(filePath, csvContent);
  console.log(`\nSuccessfully regenerated passwords.`);
  console.log(`The CSV file has been saved to: ${filePath}`);
}

regeneratePasswords('24th Batch')
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
