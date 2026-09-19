@echo off
chcp 65001 >nul
title 博客文章自动导入工具

cd /d "%~dp0"

:: 场景 1：如果用户直接将文件拖到了 .bat 图标上
if not "%~1"=="" (
    echo ======================================================
    echo          正在自动处理并导入拖拽的文件...
    echo ======================================================
    echo.
    node scripts/import-post.mjs "%~1"
    echo.
    echo 按任意键退出窗口...
    pause >nul
    exit /b 0
)

:: 场景 2：如果用户双击打开了批处理
echo ======================================================
echo          博客文章本地一键导入工具 (Windows)
echo ======================================================
echo.
echo 正在弹出文件选择窗口，请选择你的 Markdown 文章...
echo (如果不想选择文件，可在弹窗中点“取消”)
echo.

:: 调用 PowerShell 弹出原生文件选择对话框
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; $f = New-Object System.Windows.Forms.OpenFileDialog; $f.Filter = 'Markdown 文件 (*.md;*.mdx)|*.md;*.mdx|所有文件 (*.*)|*.*'; $f.Title = '请选择要导入博客的 Markdown 文章'; if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { Write-Output $f.FileName }"`) do (
    set "SELECTED_FILE=%%I"
)

if defined SELECTED_FILE (
    echo 已选择文件: %SELECTED_FILE%
    echo.
    node scripts/import-post.mjs "%SELECTED_FILE%"
    echo.
    echo 按任意键退出窗口...
    pause >nul
    exit /b 0
)

:: 如果弹窗被取消或未选择，进入控制台拖拽/输入模式
echo.
node scripts/import-post.mjs

echo.
echo 按任意键退出窗口...
pause >nul
