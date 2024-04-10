@echo off
cd frontend\frontend
npm run build && xcopy build ..\..\build /E /Q && cd ..\..
cd ..\..