# Use Debian base image
FROM debian:bullseye

# Ensure Python output is unbuffered
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

# Install system dependencies and upgrade packages
RUN apt-get update \
    && apt-get install -y python3 python3-pip bash procps postgresql-client \
    && apt-get upgrade -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy the application code to the container
COPY . /app/.

# Install Python dependencies
RUN pip install --upgrade pip \
    && pip install -r config/requirements.txt

# Add execution permissions to the entrypoint script
RUN chmod +x /app/config/entrypoint.sh

# Expose port 8000 for Gunicorn
EXPOSE 8000

# Use the entrypoint script to run the container
ENTRYPOINT ["/app/config/entrypoint.sh"]
