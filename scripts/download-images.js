const fs = require('fs');
const path = require('path');
const https = require('https');

const items = [
  { file: 'plain-salted-fries.jpg', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80' },
  { file: 'tangy-garlic-fries.jpg', url: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&auto=format&fit=crop&q=80' },
  { file: 'club-sandwich.jpg', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80' },
  { file: 'student-combo-wrap.jpg', url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80' },
  { file: '3-pcs-samosa.jpg', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80' },
  { file: '3-pcs-chicken-strips-broasted.jpg', url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80' },
  { file: 'spicy-street-maggie.jpg', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80' },
  { file: 'tea.jpg', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80' },
  { file: 'royal-masala-tea.jpg', url: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=600&auto=format&fit=crop&q=80' },
  { file: 'decoction.jpg', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80' },
  { file: 'shahi-sulemani.jpg', url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80' },
  { file: 'hot-coffee.jpg', url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80' },
  { file: 'lychee-frostbite.jpg', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80' },
  { file: 'blue-chill-lagoon.jpg', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80' },
  { file: 'berry-ice-blast.jpg', url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80' },
  { file: 'passion-power-crush.jpg', url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&auto=format&fit=crop&q=80' },
  { file: 'melon-glacier.jpg', url: 'https://images.unsplash.com/photo-1587888637140-849b25d80ef9?w=600&auto=format&fit=crop&q=80' },
  { file: 'sunrise-crush.jpg', url: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=600&auto=format&fit=crop&q=80' },
  { file: 'mango-melt.jpg', url: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&auto=format&fit=crop&q=80' },
  { file: 'raw-mango-rush.jpg', url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80' },
  { file: 'peach-breeze.jpg', url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&auto=format&fit=crop&q=80' },
  { file: 'blackcurrant-blast.jpg', url: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&auto=format&fit=crop&q=80' },
  { file: 'cold-coffee.jpg', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80' },
  { file: 'banana-shake.jpg', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80' },
  { file: 'mocha-frape.jpg', url: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600&auto=format&fit=crop&q=80' },
  { file: 'iced-coffee.jpg', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80' },
  { file: 'coffee-mousse.jpg', url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80' },
  { file: 'nutella-bread.jpg', url: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=600&auto=format&fit=crop&q=80' },
];

const destDir = path.join(__dirname, '..', 'public', 'images', 'items');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function downloadFile(url, targetPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, targetPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Status ${response.statusCode}`));
      }
      const fileStream = fs.createWriteStream(targetPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', (err) => {
        fs.unlink(targetPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log(`Starting download of ${items.length} food images...`);
  for (const item of items) {
    const target = path.join(destDir, item.file);
    try {
      await downloadFile(item.url, target);
      console.log(`✓ Downloaded ${item.file}`);
    } catch (err) {
      console.error(`✗ Failed ${item.file}:`, err.message);
    }
  }
  console.log('All image downloads completed!');
}

run();
