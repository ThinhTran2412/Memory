const fs = require('fs');
const path = require('path');

const photoDir = path.join(__dirname, 'my_photos');
const indexPath = path.join(__dirname, 'index.html');

if (!fs.existsSync(photoDir)) {
    console.error('Directory my_photos not found!');
    process.exit(1);
}

// Lấy tất cả các file ảnh trong my_photos
const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.heic', '.jfif'];
const files = fs.readdirSync(photoDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return allowedExts.includes(ext);
});

console.log(`Tìm thấy ${files.length} ảnh trong thư mục my_photos:`, files);

if (files.length === 0) {
    console.log('Chưa có ảnh nào trong thư mục my_photos!');
    process.exit(0);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Cập nhật từng thẻ heart-card
const regex = /<div class="heart-card" data-idx="(\d+)" title="([^"]*)">\s*<img src="[^"]*"/g;
let idx = 0;
html = html.replace(regex, (match, cardIdx, title) => {
    const file = files[idx % files.length];
    idx++;
    return `<div class="heart-card" data-idx="${cardIdx}" title="${title}">\n                    <img src="my_photos/${file}"`;
});

fs.writeFileSync(indexPath, html, 'utf8');
console.log(`Đã tự động cập nhật ${idx} ảnh vào trái tim thành công! Bạn không cần phải đổi tên file.`);

