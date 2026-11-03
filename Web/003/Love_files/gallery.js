(function () {
    var cards = document.querySelectorAll('.heart-card');
    var cardImgs = document.querySelectorAll('.heart-card img');
    var fileInput = document.getElementById('photo-upload-input');
    var btnShuffle = document.getElementById('btn-shuffle-photos');
    var lightbox = document.getElementById('photo-lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCap = document.getElementById('lightbox-caption');
    var closeBtn = document.getElementById('lightbox-close');

    // ========================================================
    // KHO ẢNH TỔNG HỢP (HỖ TRỢ NHIỀU HƠN 27 ẢNH)
    // ========================================================
    var allPhotosPool = [];

    // 1. Nạp ảnh từ file photos-manifest.js (nếu có)
    if (window.PHOTO_LIST && Array.isArray(window.PHOTO_LIST) && window.PHOTO_LIST.length > 0) {
        allPhotosPool = window.PHOTO_LIST.slice();
    } else {
        // Fallback: Lấy ảnh mặc định từ các thẻ ban đầu
        cardImgs.forEach(function (img) {
            if (img.src && !allPhotosPool.includes(img.src)) {
                allPhotosPool.push(img.getAttribute('src'));
            }
        });
    }

    // ========================================================
    // QUẢN LÝ LƯU TRỮ ẢNH TÙY CHỌN BẰNG INDEXEDDB
    // ========================================================
    var dbName = "LoveHeartGalleryDB";
    var dbVersion = 2;
    var db;

    function openDB(callback) {
        if (!window.indexedDB) {
            if (callback) callback();
            return;
        }
        var request = indexedDB.open(dbName, dbVersion);
        request.onupgradeneeded = function (e) {
            var db = e.target.result;
            if (!db.objectStoreNames.contains("uploaded_photos")) {
                db.createObjectStore("uploaded_photos", { autoIncrement: true });
            }
        };
        request.onsuccess = function (e) {
            db = e.target.result;
            if (callback) callback();
        };
        request.onerror = function () {
            if (callback) callback();
        };
    }

    function loadUploadedPhotos(callback) {
        if (!db) {
            if (callback) callback();
            return;
        }
        try {
            var tx = db.transaction("uploaded_photos", "readonly");
            var store = tx.objectStore("uploaded_photos");
            var request = store.getAll();
            request.onsuccess = function () {
                var userPhotos = request.result;
                if (userPhotos && userPhotos.length > 0) {
                    // Nếu người dùng có upload ảnh riêng, ưu tiên dùng kho ảnh người dùng
                    allPhotosPool = userPhotos.slice();
                }
                if (callback) callback();
            };
            request.onerror = function () {
                if (callback) callback();
            };
        } catch (err) {
            if (callback) callback();
        }
    }

    // ========================================================
    // THUẬT TOÁN SHUFFLE (XÁO TRỘN NGẪU NHIÊN)
    // ========================================================
    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = a[i];
            a[i] = a[j];
            a[j] = temp;
        }
        return a;
    }

    // Danh sách 27 ảnh đang hiển thị hiện tại trên trái tim
    var currentDisplayed = [];

    // Áp dụng xáo trộn ngẫu nhiên 27 ảnh
    function applyRandomPhotos(animate) {
        if (!allPhotosPool || allPhotosPool.length === 0) return;

        var shuffled = shuffle(allPhotosPool);
        var chosen = shuffled.slice(0, Math.min(27, shuffled.length));

        // Nếu tổng số ảnh ít hơn 27, lặp lại cho đủ 27 ô
        while (chosen.length < 27) {
            chosen = chosen.concat(shuffled).slice(0, 27);
        }

        currentDisplayed = chosen.slice();

        cardImgs.forEach(function (img, idx) {
            if (chosen[idx]) {
                if (animate) {
                    var card = img.parentElement;
                    card.classList.add('card-swap-anim');
                    setTimeout(function () {
                        img.src = chosen[idx];
                        setTimeout(function () {
                            card.classList.remove('card-swap-anim');
                        }, 250);
                    }, 200 + idx * 25);
                } else {
                    img.src = chosen[idx];
                }
            }
        });
    }

    // ========================================================
    // CƠ CHẾ LIVE AUTO-SWAP: TỰ ĐỘNG ĐỔI NHẸ 1 ẢNH KHI ĐANG NGẮM
    // ========================================================
    var autoSwapTimer = null;

    function startLiveAutoSwap() {
        if (autoSwapTimer) clearInterval(autoSwapTimer);
        // Chỉ swap nếu kho ảnh có nhiều hơn 27 ảnh
        if (allPhotosPool.length <= 27) return;

        autoSwapTimer = setInterval(function () {
            // Tìm các ảnh trong kho chưa hiển thị trên 27 ô hiện tại
            var sparePhotos = allPhotosPool.filter(function (p) {
                return !currentDisplayed.includes(p);
            });
            if (sparePhotos.length === 0) {
                sparePhotos = allPhotosPool;
            }

            // Chọn ngẫu nhiên 1 ô trên trái tim để swap
            var randomCardIdx = Math.floor(Math.random() * cardImgs.length);
            var newPhoto = sparePhotos[Math.floor(Math.random() * sparePhotos.length)];
            var card = cards[randomCardIdx];
            var img = cardImgs[randomCardIdx];

            if (card && img && newPhoto) {
                card.classList.add('card-swap-anim');
                setTimeout(function () {
                    img.src = newPhoto;
                    currentDisplayed[randomCardIdx] = newPhoto;
                    setTimeout(function () {
                        card.classList.remove('card-swap-anim');
                    }, 300);
                }, 300);
            }
        }, 4500); // Cứ mỗi 4.5 giây đổi nhẹ 1 ảnh
    }

    // Khởi tạo: Mở DB -> Xáo trộn ngẫu nhiên lần đầu (Refresh F5) -> Bật Auto-Swap
    openDB(function () {
        loadUploadedPhotos(function () {
            applyRandomPhotos(false);
            startLiveAutoSwap();
        });
    });

    // ========================================================
    // NÚT ĐỔI ẢNH NGẪU NHIÊN BẰNG TAY (SHUFFLE BUTTON)
    // ========================================================
    if (btnShuffle) {
        btnShuffle.addEventListener('click', function (e) {
            e.preventDefault();
            applyRandomPhotos(true);
        });
    }

    // ========================================================
    // CHỌN THÊM NHIỀU ẢNH TỪ MÁY / ĐIỆN THOẠI (KHÔNG GIỚI HẠN)
    // ========================================================
    function handleUserUpload(files) {
        if (!files || !files.length) return;

        var uploadedList = [];
        var loadedCount = 0;

        for (var i = 0; i < files.length; i++) {
            (function (file) {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    uploadedList.push(evt.target.result);
                    loadedCount++;
                    if (loadedCount === files.length) {
                        // Lưu toàn bộ vào IndexedDB
                        if (db) {
                            try {
                                var tx = db.transaction("uploaded_photos", "readwrite");
                                var store = tx.objectStore("uploaded_photos");
                                store.clear();
                                uploadedList.forEach(function (dataUrl) {
                                    store.add(dataUrl);
                                });
                            } catch (e) {
                                console.log("DB save error:", e);
                            }
                        }

                        allPhotosPool = uploadedList.slice();
                        applyRandomPhotos(true);
                        startLiveAutoSwap();
                        alert('Đã thêm thành công ' + uploadedList.length + ' bức ảnh vào kho kỷ niệm! ❤️\n(Mỗi lần mở web hoặc bấm F5 sẽ ngẫu nhiên chọn ra 27 ảnh khác nhau)');
                    }
                };
                reader.readAsDataURL(file);
            })(files[i]);
        }
    }

    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            handleUserUpload(e.target.files);
        });
    }

    // Hỗ trợ kéo thả ảnh (Drag & Drop)
    var dropZone = document.getElementById('heart-gallery-section');
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (evtName) {
            dropZone.addEventListener(evtName, function (e) {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        dropZone.addEventListener('drop', function (e) {
            var dt = e.dataTransfer;
            if (dt && dt.files && dt.files.length) {
                handleUserUpload(dt.files);
            }
        }, false);
    }

    // ========================================================
    // LIGHTBOX PHÓNG TO ẢNH KỶ NIỆM
    // ========================================================
    cards.forEach(function (card) {
        card.addEventListener('click', function () {
            var img = this.querySelector('img');
            if (img && lightbox && lightboxImg) {
                lightboxImg.src = img.src;
                lightboxCap.innerText = this.getAttribute('title') || 'Kỷ niệm yêu thương ❤️';
                lightbox.classList.add('active');
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            lightbox.classList.remove('active');
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
})();
