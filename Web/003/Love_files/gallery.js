(function () {
    var cards = document.querySelectorAll('.heart-card');
    var cardImgs = document.querySelectorAll('.heart-card img');
    var fileInput = document.getElementById('photo-upload-input');
    var lightbox = document.getElementById('photo-lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCap = document.getElementById('lightbox-caption');
    var closeBtn = document.getElementById('lightbox-close');

    // ========================================================
    // QUẢN LÝ LƯU TRỮ ẢNH BẰNG INDEXEDDB (LƯU VĨNH VIỄN)
    // ========================================================
    var dbName = "LoveHeartGalleryDB";
    var dbVersion = 1;
    var db;

    function openDB(callback) {
        if (!window.indexedDB) return;
        var request = indexedDB.open(dbName, dbVersion);
        request.onupgradeneeded = function (e) {
            var db = e.target.result;
            if (!db.objectStoreNames.contains("photos")) {
                db.createObjectStore("photos", { keyPath: "idx" });
            }
        };
        request.onsuccess = function (e) {
            db = e.target.result;
            if (callback) callback();
        };
        request.onerror = function (e) {
            console.log("IndexedDB error:", e);
        };
    }

    function savePhotosToDB(fileList) {
        if (!db) return;
        var tx = db.transaction("photos", "readwrite");
        var store = tx.objectStore("photos");

        for (var i = 0; i < fileList.length && i < cardImgs.length; i++) {
            (function (index, file) {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    var dataUrl = evt.target.result;
                    cardImgs[index].src = dataUrl;
                    store.put({ idx: index, src: dataUrl });
                };
                reader.readAsDataURL(file);
            })(i, fileList[i]);
        }
    }

    function loadSavedPhotos() {
        if (!db) return;
        var tx = db.transaction("photos", "readonly");
        var store = tx.objectStore("photos");
        var request = store.getAll();
        request.onsuccess = function () {
            var saved = request.result;
            if (saved && saved.length > 0) {
                saved.forEach(function (item) {
                    if (cardImgs[item.idx]) {
                        cardImgs[item.idx].src = item.src;
                    }
                });
            }
        };
    }

    openDB(function () {
        loadSavedPhotos();
    });

    // ========================================================
    // CHỌN CÙNG LÚC 27 ẢNH (KHÔNG CẦN ĐỔI TÊN)
    // ========================================================
    function handleFiles(files) {
        if (!files || !files.length) return;
        var count = Math.min(files.length, cardImgs.length);
        for (var i = 0; i < count; i++) {
            var url = URL.createObjectURL(files[i]);
            cardImgs[i].src = url;
        }
        savePhotosToDB(files);
        alert('Đã cập nhật ' + count + ' ảnh vào trái tim thành công! ❤️\n(Ảnh đã được lưu lại tự động trên trình duyệt)');
    }

    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            handleFiles(e.target.files);
        });
    }

    // ========================================================
    // HỖ TRỢ KÉO THẢ ẢNH VÀO TRÁI TIM (DRAG & DROP)
    // ========================================================
    var dropZone = document.getElementById('heart-gallery-section');
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (eventName) {
            dropZone.addEventListener(eventName, function (e) {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        dropZone.addEventListener('drop', function (e) {
            var dt = e.dataTransfer;
            var files = dt.files;
            handleFiles(files);
        }, false);
    }

    // ========================================================
    // PHÓNG TO ẢNH TRONG LIGHTBOX
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
