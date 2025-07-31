# Use official nginx image
FROM nginx:alpine

# Remove default nginx website
#RUN rm -rf /usr/share/nginx/html/*

# Copy only the necessary static files
COPY . /usr/share/nginx/html/

# Create custom nginx config to listen on port 8080
#RUN echo 'server { listen 8080; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ =404; } }' > /etc/nginx/conf.d/default.conf

#EXPOSE 8080

#CMD ["nginx", "-g", "daemon off;"] 