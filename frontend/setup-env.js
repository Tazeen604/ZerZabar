#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const frontendDir = __dirname;

// Development environment
const devEnv = `# Development Environment Variables
VITE_API_BASE_URL=http://localhost:8000/api
VITE_STORAGE_URL=http://localhost:8000/storage`;

// Production environment  
const prodEnv = `# Production Environment Variables
VITE_API_BASE_URL=/api
VITE_STORAGE_URL=/storage`;

// Create .env.development
const devPath = path.join(frontendDir, '.env.development');
if (!fs.existsSync(devPath)) {
  fs.writeFileSync(devPath, devEnv);
  console.log('✅ Created .env.development');
} else {
  console.log('⚠️  .env.development already exists');
}

// Create .env.production
const prodPath = path.join(frontendDir, '.env.production');
if (!fs.existsSync(prodPath)) {
  fs.writeFileSync(prodPath, prodEnv);
  console.log('✅ Created .env.production');
} else {
  console.log('⚠️  .env.production already exists');
}

console.log('\n🎉 Environment setup complete!');
console.log('\nNext steps:');
console.log('1. For development: npm run dev');
console.log('2. For production: npm run build');
console.log('\nAll images (products, categories, homepage) will now work on both environments!');
















