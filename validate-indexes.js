#!/usr/bin/env node

/**
 * Firestore Index Validation Script
 * 
 * This script validates the firestore.indexes.json configuration
 * and checks for common issues and optimizations.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateIndexes() {
  log('🔍 Validating Firestore Indexes Configuration...', 'cyan');
  log('', 'white');

  // Check if firestore.indexes.json exists
  const indexesPath = path.join(__dirname, 'firestore.indexes.json');
  if (!fs.existsSync(indexesPath)) {
    log('❌ firestore.indexes.json not found!', 'red');
    process.exit(1);
  }

  let indexesConfig;
  try {
    const indexesContent = fs.readFileSync(indexesPath, 'utf8');
    indexesConfig = JSON.parse(indexesContent);
  } catch (error) {
    log('❌ Invalid JSON in firestore.indexes.json:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }

  log('✅ JSON syntax is valid', 'green');

  // Validate structure
  if (!indexesConfig.indexes || !Array.isArray(indexesConfig.indexes)) {
    log('❌ Invalid structure: missing or invalid "indexes" array', 'red');
    process.exit(1);
  }

  const indexes = indexesConfig.indexes;
  log(`📊 Total indexes found: ${indexes.length}`, 'blue');

  // Analyze indexes
  const collections = new Map();
  const duplicates = [];
  const issues = [];

  indexes.forEach((index, i) => {
    // Validate required fields
    if (!index.collectionGroup) {
      issues.push(`Index ${i}: Missing collectionGroup`);
      return;
    }

    if (!index.fields || !Array.isArray(index.fields)) {
      issues.push(`Index ${i}: Missing or invalid fields array`);
      return;
    }

    if (index.fields.length === 0) {
      issues.push(`Index ${i}: Empty fields array`);
      return;
    }

    // Track collections
    const collectionName = index.collectionGroup;
    if (!collections.has(collectionName)) {
      collections.set(collectionName, []);
    }
    collections.get(collectionName).push(index);

    // Check for potential duplicates
    const indexSignature = `${collectionName}:${index.fields.map(f => `${f.fieldPath}:${f.order}`).join(',')}`;
    const existingIndex = duplicates.find(d => d.signature === indexSignature);
    if (existingIndex) {
      issues.push(`Potential duplicate index: ${indexSignature}`);
    } else {
      duplicates.push({ signature: indexSignature, index });
    }

    // Validate field structure
    index.fields.forEach((field, j) => {
      if (!field.fieldPath) {
        issues.push(`Index ${i}, Field ${j}: Missing fieldPath`);
      }
      if (!field.order || !['ASCENDING', 'DESCENDING'].includes(field.order)) {
        issues.push(`Index ${i}, Field ${j}: Invalid or missing order (must be ASCENDING or DESCENDING)`);
      }
    });
  });

  // Report issues
  if (issues.length > 0) {
    log('⚠️  Issues found:', 'yellow');
    issues.forEach(issue => log(`   • ${issue}`, 'yellow'));
    log('', 'white');
  } else {
    log('✅ No structural issues found', 'green');
  }

  // Collection analysis
  log('📚 Collections with indexes:', 'blue');
  const sortedCollections = Array.from(collections.entries()).sort((a, b) => b[1].length - a[1].length);
  
  sortedCollections.forEach(([collection, collectionIndexes]) => {
    log(`   • ${collection}: ${collectionIndexes.length} indexes`, 'white');
  });

  log('', 'white');

  // Index pattern analysis
  log('🔍 Index Pattern Analysis:', 'magenta');
  
  const patterns = {
    singleField: 0,
    composite: 0,
    withUserId: 0,
    withTimestamp: 0,
    withStatus: 0,
    withIsActive: 0
  };

  indexes.forEach(index => {
    if (index.fields.length === 1) {
      patterns.singleField++;
    } else {
      patterns.composite++;
    }

    const fieldPaths = index.fields.map(f => f.fieldPath);
    if (fieldPaths.includes('userId')) patterns.withUserId++;
    if (fieldPaths.some(f => f.includes('createdAt') || f.includes('updatedAt') || f.includes('date') || f.includes('timestamp'))) {
      patterns.withTimestamp++;
    }
    if (fieldPaths.includes('status')) patterns.withStatus++;
    if (fieldPaths.includes('isActive')) patterns.withIsActive++;
  });

  log(`   • Single field indexes: ${patterns.singleField}`, 'white');
  log(`   • Composite indexes: ${patterns.composite}`, 'white');
  log(`   • Indexes with userId: ${patterns.withUserId}`, 'white');
  log(`   • Indexes with timestamps: ${patterns.withTimestamp}`, 'white');
  log(`   • Indexes with status: ${patterns.withStatus}`, 'white');
  log(`   • Indexes with isActive: ${patterns.withIsActive}`, 'white');

  log('', 'white');

  // Recommendations
  log('💡 Recommendations:', 'cyan');
  
  if (patterns.singleField > patterns.composite * 0.3) {
    log('   • Consider if all single-field indexes are necessary', 'yellow');
  }
  
  if (patterns.withUserId < indexes.length * 0.3) {
    log('   • Consider adding userId to more indexes for multi-tenant queries', 'yellow');
  }

  if (collections.size < 10) {
    log('   • Consider if you need indexes for all collections in your app', 'yellow');
  }

  // Performance tips
  log('', 'white');
  log('🚀 Performance Tips:', 'green');
  log('   • Monitor index usage in Firebase Console', 'white');
  log('   • Remove unused indexes to reduce costs', 'white');
  log('   • Test queries in development before deploying', 'white');
  log('   • Use composite indexes for complex queries', 'white');
  log('   • Consider query patterns when designing indexes', 'white');

  log('', 'white');
  log('✅ Index validation completed!', 'green');
  
  if (issues.length === 0) {
    log('🎉 Your index configuration looks good!', 'green');
  } else {
    log(`⚠️  Please fix ${issues.length} issue(s) before deploying`, 'yellow');
  }
}

// Run validation
validateIndexes();