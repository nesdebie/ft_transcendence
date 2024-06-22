FROM debian:bullseye

#Ensures that the python output (i.e. the stdout and stderr) streams are sent straight to terminal
ENV PYTHONUNBUFFERED 1


#dont make the __pycache__ folders
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

# Install system dependencies
RUN apt-get update
RUN apt-get install -y python3 python3-pip bash procps
RUN apt-get upgrade
RUN apt-get clean



COPY . /app/.

RUN pip install --upgrade pip
RUN pip install -r config/requirements.txt

RUN chmod +x /app/config/entrypoint.sh

# Expose port 8000 for Django
EXPOSE 8000

# Use the entrypoint script to run the container
ENTRYPOINT ["/app/config/entrypoint.sh"]