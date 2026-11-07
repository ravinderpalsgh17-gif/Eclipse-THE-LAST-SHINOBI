@echo off
title Push Eclipse: The Last Shinobi to GitHub
cls
echo ========================================================
echo       ECLIPSE: THE LAST SHINOBI - GITHUB PUSHER
echo ========================================================
echo.
echo Your GitHub username: ravinderpalsgh17-gif
echo Target repo: https://github.com/ravinderpalsgh17-gif/Eclipse-THE-LAST-SHINOBI
echo.
echo GitHub requires a Personal Access Token (PAT) to push.
echo (If you do not have one yet, create it here with 'repo' checked:
echo  https://github.com/settings/tokens/new)
echo.
set /p TOKEN="Paste your GitHub Token (starts with ghp_): "

if "%TOKEN%"=="" (
    echo.
    echo No token entered. Cancelled.
    pause
    exit /b
)

echo.
echo Connecting to GitHub and pushing...
"C:\Users\W11\tools\git\cmd\git.exe" remote remove origin 2>nul
"C:\Users\W11\tools\git\cmd\git.exe" remote add origin https://ravinderpalsgh17-gif:%TOKEN%@github.com/ravinderpalsgh17-gif/Eclipse-THE-LAST-SHINOBI.git
"C:\Users\W11\tools\git\cmd\git.exe" branch -M main
"C:\Users\W11\tools\git\cmd\git.exe" push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! The game has been pushed to your GitHub!
    echo   https://github.com/ravinderpalsgh17-gif/Eclipse-THE-LAST-SHINOBI
    echo ========================================================
) else (
    echo.
    echo [ERROR] Push failed.
    echo Please make sure:
    echo  1. You created the repository 'Eclipse-THE-LAST-SHINOBI' on github.com
    echo  2. Your token has the 'repo' scope checkbox selected.
)
echo.
pause
