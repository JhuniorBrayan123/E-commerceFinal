@echo off
echo === Verificando JWT_SECRET en todos los servicios ===
echo.
echo Auth Service (.env):
findstr /C:"JWT_SECRET" auth-service\.env 2>nul || echo No encontrado
echo.
echo Catalog Service (settings.py):
findstr /C:"JWT_SECRET_KEY" catalog-service\settings.py 2>nul || echo No encontrado
echo.
echo Payment Service (application.yml):
findstr /C:"secret:" payment-service\src\main\resources\application.yml 2>nul || echo No encontrado
echo.
echo === Verificacion completa ===
pause
