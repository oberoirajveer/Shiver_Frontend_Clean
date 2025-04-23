const sharp = require('sharp');
const fs = require('fs');

async function convertSvgToPng() {
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync('logo.svg');
    
    // Convert to PNG with different sizes
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile('logo192.png');
      
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile('logo512.png');
      
    // Create favicon.ico (32x32)
    await sharp(svgBuffer)
      .resize(32, 32)
      .toFile('favicon.ico');
      
    console.log('Conversion completed successfully!');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

convertSvgToPng(); 