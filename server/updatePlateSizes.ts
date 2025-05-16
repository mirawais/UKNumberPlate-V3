import { db } from './db';
import { plateSizes } from '@shared/schema';

async function updatePlateSizes() {
  try {
    console.log('Updating plate sizes...');
    
    // Delete existing plate sizes
    await db.delete(plateSizes);
    
    // Insert new plate sizes with correct dimensions
    await db.insert(plateSizes).values([
      {
        name: 'Standard',
        dimensions: '520mm x 111mm',
        additionalPrice: '0',
        isActive: true
      },
      {
        name: 'Range Rover',
        dimensions: '533mm x 152mm',
        additionalPrice: '5.00',
        isActive: true
      },
      {
        name: 'Motorbike',
        dimensions: '229mm x 178mm',
        additionalPrice: '4.50',
        isActive: true
      },
      {
        name: '4x4',
        dimensions: '279mm x 203mm',
        additionalPrice: '5.00',
        isActive: true
      }
    ]);
    
    console.log('Plate sizes updated successfully');
  } catch (error) {
    console.error('Error updating plate sizes:', error);
  }
}

updatePlateSizes();