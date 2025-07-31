# Global Public Holiday Finder

## Assignment Overview

This assignment focuses on developing a practical application that leverages external APIs and deploying it to a web infrastructure. Part One involved implementing the "Global Public Holiday Finder" locally. Part Two (specifically Part 2A) focuses on containerizing this application, publishing it to Docker Hub, and deploying it to a three-lab-container setup (Web01, Web02, Lb01) with Nginx acting as a load balancer to distribute traffic. The goal is to create a useful application that provides genuine value.

## Part One: Local Implementation

### Application Purpose & Features

The "Global Public Holiday Finder" is a web application designed to help users easily find public holidays for various countries and years. It provides a simple, intuitive interface to fetch and display holiday data, serving a meaningful purpose for individuals planning travel, work, or personal events.

**Key Features:**

  * **API Integration:** Fetches public holiday data from the [Nager.Date Public Holiday API](https://date.nager.at/) (no API key required).
  * **Country and Year Selection:** Users can select a country from a dropdown list and input a specific year to find holidays.
  * **Dynamic Data Display:** Presents retrieved holiday data in a clear, tabular format.
  * **User Interaction:**
      * **Search:** Allows users to search for specific holidays by name.
      * **Sort:** Enables sorting of holidays by date or name.
      * **Filter:** Filter holidays by type and date range.
  * **Responsive UI:** Built with HTML, CSS, and JavaScript for a user-friendly experience across different devices.

### Error Handling

The application includes comprehensive error handling to gracefully manage situations where API calls might fail (e.g., network issues, invalid responses from the API). In such cases, user-friendly messages are displayed, indicating that holidays could not be fetched and providing guidance on how to resolve the issue.

## Part Two A: Deployment (Docker Containers + Load Balancer)

This section details the containerization and deployment of the "Global Public Holiday Finder" application to the provided lab infrastructure (`web-01`, `web-02`, `lb-01`).

### Project Structure

```
public-holiday-finder/
├── index.html
├── styles.css
├── script.js
├── servers/
│   ├── compose.yml
│   ├── lb/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── start-services.sh
│   └── web/
│       ├── Dockerfile
│       └── start-services.sh
├── Dockerfile
└── README.md
```

### Docker Image Details

  * **Docker Hub Repository URL:** `https://hub.docker.com/r/kamanzi22/public`
  * **Image Name:** `kamanzi22/public`
  * **Tags:** `v1`, `latest`

### Build Instructions

To build the Docker image locally, navigate to your project directory and execute the following command:

```bash
docker build -t kamanzi22/public:v1 .
```

### Run Instructions (Local Testing)

After building, you can test the application locally by running the container and mapping port `8080` from the container to your host machine:

```bash
docker run -p 8080:8080 --name local-holiday-app kamanzi22/public:v1
```

Verify that the application works by opening your web browser and navigating to `http://localhost:8080`.

### Push to Docker Hub

Ensure you are logged into Docker Hub from your terminal.

1.  **Log in:**
    ```bash
    docker login
    ```

2.  **Push the image:**
    ```bash
    docker push kamanzi22/public:v1
    ```

3.  **Tag and push `latest`:**
    ```bash
    docker tag kamanzi22/public:v1 kamanzi22/public:latest
    docker push kamanzi22/public:latest
    ```

### Deployment on Lab Machines

**SSH Access:**
  * **`web-01`**: `ssh ubuntu@localhost -p 2211`
  * **`web-02`**: `ssh ubuntu@localhost -p 2212`
  * **`lb-01`**: `ssh ubuntu@localhost -p 2210`
  * **Password for all containers**: `pass123`

**Deployment Steps:**

1. **Navigate to the servers directory:**
   ```bash
   cd servers
   ```

2. **Build and start all containers:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. **Verify all containers are running:**
   ```bash
   docker ps
   ```

**Access Points:**
- **Load Balanced Application**: http://localhost:8082
- **Direct Access**: 
  - http://localhost:8080 (web-01)
  - http://localhost:8081 (web-02)

### Load Balancer Configuration

The load balancer (`lb-01`) is configured using Nginx to distribute incoming HTTP traffic between the two application instances running on `web-01` and `web-02`.

**Nginx Configuration (`servers/lb/nginx.conf`):**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server 172.20.0.11:80;
        server 172.20.0.12:80;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

**Load Balancer Features:**
- **Algorithm**: Round-robin (default Nginx upstream)
- **Backend Servers**: 
  - `172.20.0.11:80` (web-01)
  - `172.20.0.12:80` (web-02)
- **Health Checks**: Automatic (Nginx handles this)

### Testing Steps & Evidence

**Load Balancer Testing:**
```bash
# Test the load balancer
curl -I http://localhost:8082

# Test individual web servers
curl -I http://localhost:8080
curl -I http://localhost:8081
```

**Round-Robin Verification:**
```bash
# Test load balancing distribution
for i in {1..10}; do echo "Request $i:"; curl -s http://localhost:8082 | grep -o '<title>.*</title>'; done
```

**Expected Results:**
- All requests should return the same content (the holiday finder application)
- The load balancer distributes traffic between both web servers
- Each web server responds with the application content

**Container Status Verification:**
```bash
# Check container status
docker ps

# Check container logs
docker logs lb-01
docker logs web-01
docker logs web-02
```

## Hardening Step (API Keys)

This "Global Public Holiday Finder" application uses the [Nager.Date Public Holiday API](https://date.nager.at/), which currently does **not** require an API key for its free tier. Therefore, there are no sensitive API keys to handle for this specific implementation.

However, as a general hardening step for applications that *do* require API keys or other sensitive information, the recommended approach is to **avoid baking them directly into the Docker image or committing them to a public repository**. Instead, they should be passed as **environment variables** to the Docker containers at runtime.

**Example of passing an API key as an environment variable:**
```bash
docker run -d --name my-app -e API_KEY="your_actual_secret_api_key" -p 8080:8080 kamanzi22/public:v1
```

For production environments, these secrets should be managed by dedicated secrets management solutions like Docker Secrets, Kubernetes Secrets, AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault.

## Challenges Encountered & Solutions

  * **[Challenge 1]:** Load balancer container was only running SSH, not actual load balancing software
  * **[Solution 1]:** Added Nginx to the load balancer container and configured it to distribute traffic between web servers
  * **[Challenge 2]:** Web servers were not serving the application content
  * **[Solution 2]:** Updated web server Dockerfiles to install Nginx and serve the application files
  * **[Challenge 3]:** Docker build context issues when trying to access application files
  * **[Solution 3]:** Updated Docker Compose configuration to use the correct build context
  * **[Challenge 4]:** Network conflicts with existing Docker networks
  * **[Solution 4]:** Cleaned up existing containers and networks before rebuilding
  * **[Challenge 5]:** Docker Desktop connection issues
  * **[Solution 5]:** Ensured Docker Desktop was fully started before running commands

## Deliverables

  * **GitHub Repository:** [https://github.com/kamanzi2025/public-holiday.git](https://github.com/kamanzi2025/public-holiday.git)
  * **Demo Video:** [Link to your demo video hosted on YouTube/Vimeo (max 2 minutes)]

## Requirements & Grading Criteria Summary

  * **Functionality (50%):** Application serves a meaningful purpose, effectively uses Nager.Date API, provides error handling, and allows user interaction (search, sort, filter).
  * **Deployment (20%):** Successful deployment on Web01 and Web02, with proper Nginx load balancer configuration.
  * **User Experience (10%):** Intuitive UI and clear data presentation.
  * **Documentation (10%):** Comprehensive and clear README, proper API/resource attribution.
  * **Demo Video (10%):** Effective and professional showcase of features within 2 minutes.

## API Credit & Acknowledgements

  * **Public Holiday Data:** Powered by [Nager.Date Public Holiday API](https://date.nager.at/).
  * **Web Server:** [Nginx](https://www.nginx.com/)
  * **Load Balancer:** [Nginx](https://www.nginx.com/)
  * **Containerization:** [Docker](https://www.docker.com/)
  * **Container Orchestration:** [Docker Compose](https://docs.docker.com/compose/)

## Final Status

✅ **Application Functionality**: Fully implemented with API integration, search, sort, and filter features  
✅ **Error Handling**: Comprehensive error handling for API failures and network issues  
✅ **User Interface**: Responsive, intuitive design with clear data presentation  
✅ **Containerization**: Docker images built and tested locally  
✅ **Load Balancer**: Nginx load balancer configured and distributing traffic  
✅ **Deployment**: Application successfully deployed on both web servers  
✅ **Testing**: Load balancing verified with round-robin distribution  
✅ **Documentation**: Comprehensive README with clear instructions and troubleshooting  

The Global Public Holiday Finder is now fully operational and accessible via the load balancer at http://localhost:8082, providing high availability and load distribution for users seeking public holiday information worldwide.
