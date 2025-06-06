
import { createNeonStorage } from './server/neonStorage';

async function main() {
  try {
    console.log('Creating storage and seeding data...');
    const storage = createNeonStorage();
    await storage.seedInitialData();
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
