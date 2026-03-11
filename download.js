import fs from 'fs';
import https from 'https';

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function main() {
  await download('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Black_icon_-_wallet.svg/192px-Black_icon_-_wallet.svg.png', 'public/icon-192.png');
  await download('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Black_icon_-_wallet.svg/512px-Black_icon_-_wallet.svg.png', 'public/icon-512.png');
  await download('https://placehold.co/1280x720.png', 'public/screenshot-wide.png');
  await download('https://placehold.co/720x1280.png', 'public/screenshot-narrow.png');
  console.log('Done');
}

main();
