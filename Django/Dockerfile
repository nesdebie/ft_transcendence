
FROM debian:bullseye

#Ensures that the python output (i.e. the stdout and stderr) streams are sent straight to terminal
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies
RUN apt-get update
RUN apt-get install python -y
RUN apt-get install pip -y
RUN apt-get upgrade

COPY . /app/

RUN pip install --upgrade pip
RUN pip install -r config/requirements.txt

RUN python manage.py migrate

# Expose port 8000 for Django
EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "SinglePageApp.wsgi:application"]