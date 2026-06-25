@echo off
rem Home Assistant Dashboard Studio - lokaler HA-Sync (Windows).
rem Doppelklick = "watch" (pusht bei jedem Speichern). Oder: sync.bat pull / push.
setlocal
set "CMD=%~1"
if "%CMD%"=="" set "CMD=watch"
node "%~dp0scripts\sync.mjs" %CMD%
if errorlevel 1 pause
endlocal
