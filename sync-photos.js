const fs = require('fs');
const path = require('path');

const photoDir = path.join(__dirname, 'my_photos');
const indexPath = path.join(__dirname, 'index.html');
const manifestPath = path.join(__dirname, 'photos-manifest.js');

if (!fs.existsSync(photoDir)) {
    console.error('Directory my_photos not found!');
    process.exit(1);
}

// Lấy tất cả các file ảnh trong my_photos (loại trừ icon hệ thống)
const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.heic', '.jfif'];
const files = fs.readdirSync(photoDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    const base = path.basename(f, ext).toLowerCase();
    if (base === 'music' || base === 'mute') return false;
    return allowedExts.includes(ext);
});

console.log(`Tìm thấy tổng cộng ${files.length} ảnh trong thư mục my_photos.`);

if (files.length === 0) {
    console.log('Chưa có ảnh nào trong thư mục my_photos!');
    process.exit(0);
}

// Tạo file manifest chứa toàn bộ danh sách ảnh để web tự động swap/shuffle ngẫu nhiên
const manifestContent = `// Danh sách tự động tạo toàn bộ ảnh trong thư mục my_photos (${files.length} ảnh)
window.PHOTO_LIST = ${JSON.stringify(files.map(f => 'my_photos/' + f), null, 4)};
`;
fs.writeFileSync(manifestPath, manifestContent, 'utf8');
console.log(`Đã tạo photos-manifest.js với ${files.length} ảnh!`);

// Xáo trộn ngẫu nhiên 27 ảnh ban đầu cho index.html
function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const shuffled = shuffle(files);

if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    const regex = /<div class="heart-card" data-idx="(\d+)" title="([^"]*)">\s*<img src="[^"]*"/g;
    let idx = 0;
    html = html.replace(regex, (match, cardIdx, title) => {
        const file = shuffled[idx % shuffled.length];
        idx++;
        return `<div class="heart-card" data-idx="${cardIdx}" title="${title}">\n                    <img src="my_photos/${file}"`;
    });
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log(`Đã cập nhật 27 ảnh ngẫu nhiên vào index.html.`);
}
