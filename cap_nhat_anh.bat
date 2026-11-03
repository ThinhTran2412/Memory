@echo off
chcp 65001 >nul
echo ========================================================
echo   ĐANG TỰ ĐỘNG CẬP NHẬT 27 ẢNH TỪ THƯ MỤC my_photos...
echo ========================================================
node "%~dp0sync-photos.js"
echo.
echo Hoàn tất! Hãy mở lại file index.html hoặc bấm F5 trên trình duyệt nhé!
echo.
pause

