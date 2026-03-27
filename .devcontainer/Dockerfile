FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

RUN apt-get update \
 && apt-get install -y \
        iputils-ping \
        redis-server \
 && rm -rf /var/lib/apt/lists/*

RUN curl https://qlty.sh | /bin/bash \
 && mv ~/.qlty/bin/qlty /usr/local/bin/qlty \
 && rm -rf ~/.qlty \
 && qlty --version

# Install k6 load testing tool
RUN curl -L https://github.com/grafana/k6/releases/download/v0.50.0/k6-v0.50.0-linux-amd64.tar.gz | tar -xz -C /tmp \
 && mv /tmp/k6-v0.50.0-linux-amd64/k6 /usr/local/bin/ \
 && rm -rf /tmp/k6-v0.50.0-linux-amd64
