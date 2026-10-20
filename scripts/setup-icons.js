const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const logoPath = path.join(rootDir, 'public', 'images', 'fyntrust-logo.png');

if (!fs.existsSync(logoPath)) {
  console.error('Source logo not found at:', logoPath);
  process.exit(1);
}

const logoBuffer = fs.readFileSync(logoPath);

// Web targets
const webTargets = [
  path.join(rootDir, 'public', 'favicon.ico'),
  path.join(rootDir, 'public', 'icon.png'),
  path.join(rootDir, 'public', 'apple-touch-icon.png'),
  path.join(rootDir, 'src', 'app', 'icon.png'),
  path.join(rootDir, 'src', 'app', 'apple-icon.png'),
  path.join(rootDir, 'src', 'app', 'favicon.ico'),
];

webTargets.forEach((target) => {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(target, logoBuffer);
  console.log('Updated web icon:', target);
});

// Android mipmap targets
const mipmapDirs = [
  'mipmap-mdpi',
  'mipmap-hdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi',
];

mipmapDirs.forEach((dirName) => {
  const dirPath = path.join(rootDir, 'android-app', 'app', 'src', 'main', 'res', dirName);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  fs.writeFileSync(path.join(dirPath, 'ic_launcher.png'), logoBuffer);
  fs.writeFileSync(path.join(dirPath, 'ic_launcher_round.png'), logoBuffer);
  console.log('Updated Android icons in:', dirName);
});

console.log('All logo icons configured successfully!');
