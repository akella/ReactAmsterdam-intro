const generateBMFont = require('msdf-bmfont');
const fs = require('fs');

const opt = {
  charset: '1234567890the quick brown fox jumps over the lazy dog,A B C D E F G H I K L M N O P Q R S T V X Y Z',
  fieldType: 'msdf'
};
generateBMFont('src/fonts/TTCommons-DemiBold.ttf',opt, (error, textures, font) => {
  if (error) throw error;
  textures.forEach((sheet, index) => {
    font.pages.push(`sheet${index}.png`);
    fs.writeFile(`sheet${index}.png`, sheet, (err) => {
      if (err) throw err;
    });
  });
  fs.writeFile('font.json', JSON.stringify(font), (err) => {
    if (err) throw err;
  });
});


//xcode-select --install