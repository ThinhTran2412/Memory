/*
 * Love code functions
 */

var $win = $(window);
var clientWidth = $win.width();
var clientHeight = $win.height();

$(window).resize(function() {
    if (typeof adjustLayout === 'function') {
        adjustLayout();
    }
});

(function($) {
    $.fn.typewriter = function() {
        this.each(function() {
            var $ele = $(this);
            var str = $ele.html();
            var progress = 0;
            $ele.html('').css('visibility', 'visible');
            
            var timer = setInterval(function() {
                var current = str.substr(progress, 1);
                if (current === '<') {
                    progress = str.indexOf('>', progress) + 1;
                } else {
                    progress++;
                }
                
                if (progress >= str.length) {
                    $ele.html(str);
                    clearInterval(timer);
                } else {
                    $ele.html(str.substring(0, progress) + '<span class="typewriter-cursor">|</span>');
                }
            }, 60);
        });
        return this;
    };
})(jQuery);

function timeElapse(date) {
    var current = new Date();
    var seconds = Math.floor((current.getTime() - date.getTime()) / 1000);
    if (seconds < 0) seconds = 0;
    
    var days = Math.floor(seconds / (3600 * 24));
    seconds = seconds % (3600 * 24);
    var hours = Math.floor(seconds / 3600);
    if (hours < 10) hours = "0" + hours;
    
    seconds = seconds % 3600;
    var minutes = Math.floor(seconds / 60);
    if (minutes < 10) minutes = "0" + minutes;
    
    seconds = seconds % 60;
    if (seconds < 10) seconds = "0" + seconds;
    
    var result = "<span class=\"digit\">" + days + "</span> ngày <span class=\"digit\">" + hours + "</span> giờ <span class=\"digit\">" + minutes + "</span> phút <span class=\"digit\">" + seconds + "</span> giây"; 
    $("#clock").html(result);
}
