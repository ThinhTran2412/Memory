(function () {
    var canvas = $('#canvas');

    if (!canvas[0].getContext) {
        $("#error").show();
        return false;
    }

    var width = canvas.width();
    var height = canvas.height();

    canvas.attr("width", width);
    canvas.attr("height", height);

    // ========================================================
    // QUẢN LÝ PHÁT NHẠC (CHỐNG CHẶN AUTOPLAY)
    // ========================================================
    var audio = document.getElementById("media");

    function playMusic() {
        if (!audio) return;
        audio.volume = 1.0;
        var promise = audio.play();
        if (promise !== undefined) {
            promise.then(function () {
                $('#music-btn').addClass('playing');
            }).catch(function (err) {
                console.log("Audio waiting for user gesture:", err);
            });
        }
    }

    // Tự động phát khi người dùng chạm vào bất cứ đâu trên màn hình lần đầu tiên
    $(document).one('click touchstart', function () {
        playMusic();
    });

    // Nút Bật / Tắt Nhạc nổi
    $('#music-btn').on('click touchstart', function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (!audio) return;
        if (audio.paused) {
            playMusic();
        } else {
            audio.pause();
            $('#music-btn').removeClass('playing');
        }
    });

    // ========================================================
    // CẤU HÌNH CÂY HOA TRÁI TIM
    // ========================================================
    var opts = {
        seed: {
            x: width / 2 - 20,
            color: "rgb(190, 26, 37)",
            scale: 2
        },
        branch: [
            [535, 680, 570, 250, 500, 200, 30, 100, [
                [540, 500, 455, 417, 340, 400, 13, 100, [
                    [450, 435, 434, 430, 394, 395, 2, 40]
                ]],
                [550, 445, 600, 356, 680, 345, 12, 100, [
                    [578, 400, 648, 409, 661, 426, 3, 80]
                ]],
                [539, 281, 537, 248, 534, 217, 3, 40],
                [546, 397, 413, 247, 328, 244, 9, 80, [
                    [427, 286, 383, 253, 371, 205, 2, 40],
                    [498, 345, 435, 315, 395, 330, 4, 60]
                ]],
                [546, 357, 608, 252, 678, 221, 6, 100, [
                    [590, 293, 646, 277, 648, 271, 2, 80]
                ]]
            ]]
        ],
        bloom: {
            num: 700,
            width: 1080,
            height: 650,
        },
        footer: {
            width: 1200,
            height: 4,
            speed: 10,
        }
    };

    var tree = new Tree(canvas[0], width, height, opts);
    var seed = tree.seed;
    var foot = tree.footer;
    var hold = 1;

    function getEventCoords(e) {
        var rect = canvas[0].getBoundingClientRect();
        var clientX, clientY;
        var evt = e.originalEvent || e;
        if (evt.touches && evt.touches.length > 0) {
            clientX = evt.touches[0].clientX;
            clientY = evt.touches[0].clientY;
        } else if (evt.changedTouches && evt.changedTouches.length > 0) {
            clientX = evt.changedTouches[0].clientX;
            clientY = evt.changedTouches[0].clientY;
        } else {
            clientX = e.clientX || e.pageX;
            clientY = e.clientY || e.pageY;
        }
        var scaleX = canvas[0].width / rect.width;
        var scaleY = canvas[0].height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function handleStart(e) {
        var coords = getEventCoords(e);
        var isNearSeed = false;
        if (window.innerWidth <= 768) {
            var seedPos = { x: width / 2 - 20, y: 340 };
            var dist = Math.hypot(coords.x - seedPos.x, coords.y - seedPos.y);
            if (dist < 160) isNearSeed = true;
        }
        if (seed.hover(coords.x, coords.y) || isNearSeed) {
            hold = 0;
            playMusic();
            canvas.unbind("click touchstart");
            canvas.unbind("mousemove touchmove");
            canvas.removeClass('hand');
        }
    }

    canvas.on("click touchstart", handleStart);
    canvas.on("mousemove", function (e) {
        var coords = getEventCoords(e);
        canvas.toggleClass('hand', seed.hover(coords.x, coords.y));
    });

    var seedAnimate = eval(Jscex.compile("async", function () {
        seed.draw();
        while (hold) {
            $await(Jscex.Async.sleep(10));
        }
        while (seed.canScale()) {
            seed.scale(0.95);
            $await(Jscex.Async.sleep(10));
        }
        while (seed.canMove()) {
            seed.move(0, 2);
            foot.draw();
            $await(Jscex.Async.sleep(10));
        }
    }));

    var growAnimate = eval(Jscex.compile("async", function () {
        do {
            tree.grow();
            $await(Jscex.Async.sleep(10));
        } while (tree.canGrow());
    }));

    var flowAnimate = eval(Jscex.compile("async", function () {
        do {
            tree.flower(2);
            $await(Jscex.Async.sleep(10));
        } while (tree.canFlower());
    }));

    var moveAnimate = eval(Jscex.compile("async", function () {
        var isMobile = (window.innerWidth <= 768);
        if (isMobile) {
            // Trên Mobile: Giữ cây ở chính giữa màn hình
            foot.draw();
            canvas.parent().css("background", "url(" + tree.toDataURL('image/png') + ")");
            canvas.css("background", "#ffc0cb");
            $await(Jscex.Async.sleep(300));
            canvas.css("background", "none");
        } else {
            // Trên Desktop: Dịch cây sang x=500
            tree.snapshot("p1", 240, 0, 610, 680);
            while (tree.move("p1", 500, 0)) {
                foot.draw();
                $await(Jscex.Async.sleep(10));
            }
            foot.draw();
            tree.snapshot("p2", 500, 0, 610, 680);

            canvas.parent().css("background", "url(" + tree.toDataURL('image/png') + ")");
            canvas.css("background", "#ffc0cb");
            $await(Jscex.Async.sleep(300));
            canvas.css("background", "none");
        }
    }));

    var jumpAnimate = eval(Jscex.compile("async", function () {
        var ctx = tree.ctx;
        while (true) {
            tree.ctx.clearRect(0, 0, width, height);
            tree.jump();
            foot.draw();
            $await(Jscex.Async.sleep(25));
        }
    }));

    var textAnimate = eval(Jscex.compile("async", function () {
        var together = new Date();
        // Thời gian kỷ niệm bắt đầu yêu nhau: 369 ngày
        together.setFullYear(2025, 9, 30);
        together.setHours(0);
        together.setMinutes(0);
        together.setSeconds(0);
        together.setMilliseconds(0);
        // Dự phòng an toàn nếu thiết bị có mốc thời gian khác
        if (Date.now() - together.getTime() < 0) {
            together = new Date(Date.now() - (369 * 24 * 3600 * 1000 + 21 * 3600 * 1000 + 15 * 60 * 1000));
        }

        $("#code").show().typewriter();
        $("#clock-box").fadeIn(500);
        $("#scroll-hint").fadeIn(1200);
        while (true) {
            timeElapse(together);
            $await(Jscex.Async.sleep(1000));
        }
    }));

    var runAsync = eval(Jscex.compile("async", function () {
        $await(seedAnimate());
        $await(growAnimate());
        $await(flowAnimate());
        $await(moveAnimate());

        textAnimate().start();

        $await(jumpAnimate());
    }));

    runAsync().start();

    function adjustLayout() {
        var winW = window.innerWidth || document.documentElement.clientWidth || $(window).width();
        var winH = window.innerHeight || document.documentElement.clientHeight || $(window).height();
        var scaler = document.getElementById('wrap-scaler');
        if (!scaler) return;

        var scale = 1;
        if (winW <= 768) {
            // Tối ưu cân đối tuyệt đối cho iPhone 16 Plus (430px x 932px)
            // scale = 0.31 để cây nhỏ gọn xinh xắn (~340px x 210px), chừa đủ chỗ cho thư và đồng hồ
            var scaleW = (winW - 24) / 1100;
            var scaleH = (winH * 0.32) / 680;
            scale = Math.min(scaleW, scaleH);
            if (scale > 0.32) scale = 0.32;
            if (scale < 0.25) scale = 0.25;
        } else if (winW < 1120) {
            var scaleW = winW / 1120;
            var scaleH = (winH * 0.85) / 680;
            scale = Math.min(scaleW, scaleH);
        }
        document.documentElement.style.setProperty('--tree-scale', scale);
        scaler.style.width = Math.round(1100 * scale) + 'px';
        scaler.style.height = Math.round(680 * scale) + 'px';
    }
    window.adjustLayout = adjustLayout;
    window.addEventListener('resize', adjustLayout);
    window.addEventListener('orientationchange', function () {
        setTimeout(adjustLayout, 200);
    });
    $(document).ready(adjustLayout);
    setTimeout(adjustLayout, 100);

})();
