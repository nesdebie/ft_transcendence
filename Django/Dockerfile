# Use Debian base image
FROM debian:bullseye

# Ensure Python output is unbuffered
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# Install OpenSSL and Node.js
RUN apt-get update && apt-get install -y curl openssl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install system dependencies and upgrade packages
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv bash procps postgresql-client \
    && apt-get upgrade -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the application code to the container
COPY . /app/.

# Install Python dependencies
RUN pip install --upgrade pip \
    && pip install -r config/requirements.txt \
    && pip install pyotp qrcode[pil] web3

# Change working directory to blockchain folder
WORKDIR /app/blockchain/ALL_FILE_NEEDED

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs 

# Install Ganache and Truffle globally
RUN npm install -g ganache@7.9.1 truffle@5.11.5 --unsafe-perm

# Change working directory back to app folder
WORKDIR /app

# Add execution permissions
RUN chmod +x /app/config/entrypoint.sh /app/blockchain/ALL_FILE_NEEDED/start.sh

COPY ./config/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port 443 for HTTPS
EXPOSE 443

# Use the new entrypoint script
ENTRYPOINT ["/app/config/entrypoint.sh"]