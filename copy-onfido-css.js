import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to node_modules and your styles folder
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const stylesPath = path.resolve(__dirname, 'src/styles');

// Ensure the styles directory exists
if (!fs.existsSync(stylesPath)) {
  fs.mkdirSync(stylesPath, { recursive: true });
}

// Path to Onfido CSS
const onfidoCssPath = path.join(nodeModulesPath, 'onfido-sdk-ui/dist/style.css');
const destPath = path.join(stylesPath, 'onfido-vendor.css');

// Check if Onfido CSS exists
if (fs.existsSync(onfidoCssPath)) {
  // Copy the file
  fs.copyFileSync(onfidoCssPath, destPath);
  console.log('✅ Onfido CSS copied successfully to src/styles/onfido-vendor.css');
} else {
  console.error('❌ Onfido CSS file not found at', onfidoCssPath);
  console.error('Make sure you have installed onfido-sdk-ui package.');
}