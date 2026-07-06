#!/bin/bash
python manage.py migrate
gunicorn --bind 0.0.0.0:${PORT:-8000} core.wsgi:application
