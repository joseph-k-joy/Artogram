@echo off
echo ========================================================
echo Starting ARTOGRAM Django Backend Server (Port 8000)
echo ========================================================
cd backend
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
