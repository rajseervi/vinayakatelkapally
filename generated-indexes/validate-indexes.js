#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Firestore Indexes...');

try {
  const indexData = JSON.parse(fs.readFileSync('firestore.indexes.json', 'utf8'));
  
  console.log('📊 Index Summary:');
  console.log('================');
  console.log(`Total indexes: ${indexData.indexes.length}`);
  
  const collectionCounts = {};
  indexData.indexes.forEach(index => {
    collectionCounts[index.collectionGroup] = (collectionCounts[index.collectionGroup] || 0) + 1;
  });
  
  console.log('\nIndexes by collection:');
  Object.entries(collectionCounts).forEach(([collection, count]) => {
    console.log(`   ${collection}: ${count}`);
  });
  
  // Validate structure
  let hasErrors = false;
  indexData.indexes.forEach((index, i) => {
    if (!index.collectionGroup) {
      console.error(`❌ Index ${i}: Missing collectionGroup`);
      hasErrors = true;
    }
    if (!index.fields || index.fields.length === 0) {
      console.error(`❌ Index ${i}: Missing or empty fields`);
      hasErrors = true;
    }
  });
  
  if (hasErrors) {
    console.error('❌ Validation failed! Fix errors before deployment.');
    process.exit(1);
  } else {
    console.log('\n✅ All indexes are valid!');
    console.log('🚀 Ready for deployment with: ./deploy-indexes.sh');
  }
  
} catch (error) {
  console.error('❌ Error reading indexes file:', error.message);
  process.exit(1);
}
