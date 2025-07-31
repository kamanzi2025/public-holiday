FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    openssh-server sudo iputils-ping ca-certificates nginx && \
    mkdir /run/sshd && \
    if ! id -u ubuntu >/dev/null 2>&1; then \
    useradd --create-home --uid 1000 --shell /bin/bash ubuntu; \
    fi && \
    echo 'ubuntu:pass123' | chpasswd && \
    usermod -aG sudo ubuntu && \
    sed -ri 's/#?PermitRootLogin.*/PermitRootLogin no/'  /etc/ssh/sshd_config && \
    sed -ri 's/#?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy web application files
COPY index.html /var/www/html/
COPY script.js /var/www/html/
COPY styles.css /var/www/html/

# Configure Nginx to serve the web app
RUN echo 'server { listen 80; root /var/www/html; index index.html; location / { try_files $uri $uri/ =404; } }' > /etc/nginx/sites-available/default

RUN ssh-keygen -A

# Start both SSH and Nginx
COPY servers/web/start-services.sh /start-services.sh
RUN chmod +x /start-services.sh

CMD ["/start-services.sh"]
