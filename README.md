
-----

# Global Public Holiday Finder

## Assignment Overview

This assignment focuses on developing a practical application that leverages external APIs and deploying it to a web infrastructure. Part One involved implementing the "Global Public Holiday Finder" locally. Part Two (specifically Part 2A) focuses on containerizing this application, publishing it to Docker Hub, and deploying it to a three-lab-container setup (Web01, Web02, Lb01) with HAProxy acting as a load balancer to distribute traffic. The goal is to create a useful application that provides genuine value.

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
      * **Filter:** (If implemented, describe here - e.g., filter by type of holiday, or only show future holidays).
  * **Responsive UI:** Built with HTML, CSS, and JavaScript for a user-friendly experience across different devices.

### Error Handling

The application includes basic error handling to gracefully manage situations where API calls might fail (e.g., network issues, invalid responses from the API). In such cases, a user-friendly message is displayed, indicating that holidays could not be fetched.

## Part Two A: Deployment (Docker Containers + Docker Hub)

This section details the containerization, Docker Hub publication, and deployment of the "Global Public Holiday Finder" application to the provided lab infrastructure (`web-01`, `web-02`, `lb-01`).

### Project Structure

```
my-holiday-app/
├── index.html
├── styles.css
├── script.js
├── Dockerfile
├── nginx.conf
└── README.md
```

### nginx.conf

The `nginx.conf` file configures the Nginx server inside the Docker container to serve the static application files and listen on port `8080`.

```nginx
server {
    listen 8080;
    listen [::]:8080;

    root /usr/share/nginx/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### Docker Image Details

  * **Docker Hub Repository URL:** `https://hub.docker.com/r/kamanzi22/holiday-finder`
  * **Image Name:** `kamanzi22/holiday-finder`
  * **Tags:** `v1`, `latest`

### Build Instructions

To build the Docker image locally, navigate to your project directory (e.g., `my-holiday-app/`) in your terminal and execute the following command:

```bash
docker build -t kamanzi22/holiday-finder:v1 .
```

### Run Instructions (Local Testing)

After building, you can test the application locally by running the container and mapping port `8080` from the container to your host machine:

```bash
docker run -p 8080:8080 --name local-holiday-app kamanzi22/holiday-finder:v1
```

Verify that the application works by opening your web browser and navigating to `http://localhost:8080`.

### Push to Docker Hub

Ensure you are logged into Docker Hub from your terminal.

1.  **Log in:**

    ```bash
    docker login
    ```

    (Enter your Docker Hub username and password when prompted.)

2.  **Push the image:**

    ```bash
    docker push kamanzi22/holiday-finder:v1
    ```

3.  **Tag and push `latest` (recommended):**

    ```bash
    docker tag kamanzi22/holiday-finder:v1 kamanzi22/holiday-finder:latest
    docker push kamanzi22/holiday-finder:latest
    ```

### Deployment on Lab Machines (Web01, Web02)

**SSH Access:**

  * **`web-01`**: `ssh ubuntu@localhost -p 2211`
  * **`web-02`**: `ssh ubuntu@localhost -p 2212`
  * **`lb-01`**: `ssh ubuntu@localhost -p 2210`
  * **Password for all containers**: `pass123`

**Actual Deployment Completed:**

The application has been successfully deployed using the following approach:

1. **Docker Image Created**: Built and pushed to Docker Hub as `kamanzi22/holiday-finder:v1` and `kamanzi22/holiday-finder:latest`
2. **Application Files Copied**: Static files (index.html, styles.css, script.js) were copied to both web-01 and web-02 containers
3. **Nginx Configuration**: Nginx was configured to serve the application on port 80
4. **HAProxy Configuration**: Load balancer configured to distribute traffic between web-01 (172.20.0.11:80) and web-02 (172.20.0.12:80)
5. **Load Balancing**: Round-robin distribution with custom `X-Served-By` header

**Access Points:**
- **Load Balanced Application**: http://localhost:8082
- **Direct Access**: 
  - http://localhost:8080 (web-01)
  - http://localhost:8081 (web-02)

**Deployment Steps for `web-01`:**

1.  **SSH into `web-01`:**
    ```bash
    ssh [your_username_for_lab_machines]@[web01_ip_address]
    ```
2.  **Pull the Docker Image:**
    ```bash
    docker pull [yourdockerhubuser]/holiday-finder:v1
    ```
3.  **Run the application container:**
    ```bash
    docker run -d --name holiday-app --restart unless-stopped -p 8080:8080 [yourdockerhubuser]/holiday-finder:v1
    ```
4.  **Verify internal reachability (optional but recommended):**
    ```bash
    curl http://localhost:8080
    ```

**Deployment Steps for `web-02`:**

1.  **SSH into `web-02`:**
    ```bash
    ssh [your_username_for_lab_machines]@[web02_ip_address]
    ```
2.  **Pull the Docker Image:**
    ```bash
    docker pull [yourdockerhubuser]/holiday-finder:v1
    ```
3.  **Run the application container:**
    ```bash
    docker run -d --name holiday-app --restart unless-stopped -p 8080:8080 [yourdockerhubuser]/holiday-finder:v1
    ```
4.  **Verify internal reachability (optional but recommended):**
    ```bash
    curl http://localhost:8080
    ```

### Load Balancer Configuration (Lb01)

The load balancer (`lb-01`) is configured using HAProxy to distribute incoming HTTP traffic between the two application instances running on `web-01` and `web-02`.

1.  **SSH into `lb-01`:**

    ```bash
    ssh [your_username_for_lab_machines]@[lb01_ip_address]
    ```

2.  **Edit the HAProxy configuration file** (`/etc/haproxy/haproxy.cfg`). You will likely need `sudo` permissions.

    ```bash
    sudo nano /etc/haproxy/haproxy.cfg # or your preferred editor
    ```

    **Add or modify the following sections:**

    ```ini
    global
        log /dev/log    daemon
        maxconn 256
        chroot /var/lib/haproxy
        stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
        stats timeout 30s
        user haproxy
        group haproxy
        daemon

    defaults
        mode http
        log global
        option httplog
        option dontlognull
        timeout connect 5000
        timeout client 50000
        timeout server 50000

    frontend http_front
        bind *:80   # HAProxy listens on port 80 for incoming traffic
        default_backend webapps

    backend webapps
        balance roundrobin
        server web01 172.20.0.11:8080 check  # Internal IP of web-01
        server web02 172.20.0.12:8080 check  # Internal IP of web-02
    ```

    **Important:** The IP addresses `172.20.0.11` and `172.20.0.12` are common internal IPs for the `web_infra_lab.git` setup. **Verify these are the correct internal network IPs for your `web-01` and `web-02` machines in your specific lab environment.**

3.  **Reload HAProxy configuration:**
    After saving the changes to `haproxy.cfg`, reload HAProxy to apply them. If HAProxy is running as a Docker container (likely named `lb-01` based on the lab setup), use:

    ```bash
    docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
    ```

### Testing Steps & Evidence

To verify the end-to-end deployment and confirm round-robin load balancing:

**Actual Testing Completed:**

1. **Load Balancer Testing**: The application was tested via http://localhost:8082
2. **Round-Robin Verification**: Multiple curl requests confirmed alternating responses between web-01 and web-02
3. **Custom Header Evidence**: Each response includes `X-Served-By` header showing which server handled the request

**Test Results:**
```bash
# Testing load balancing with custom headers
for i in {1..5}; do echo "Request $i:"; curl -I http://localhost:8082 | grep "x-served-by"; echo; done

Request 1: x-served-by: web02
Request 2: x-served-by: web01  
Request 3: x-served-by: web02
Request 4: x-served-by: web01
Request 5: x-served-by: web02
```

**Application Functionality Test:**
```bash
# Verify the application content is served correctly
curl -s http://localhost:8082 | grep -i "holiday"
# Output: <title>Global Public Holiday Finder</title>
```

**Access Points:**
- **Load Balanced Application**: http://localhost:8082
- **Direct Access**: 
  - http://localhost:8080 (web-01)
  - http://localhost:8081 (web-02)

2.  **Verify Round-Robin Distribution via HAProxy Logs:**
    Since your static application will return identical content from both `web-01` and `web-02`, the primary method to prove load balancing is by inspecting HAProxy's access logs.

      * **SSH into `lb-01`:**
        ```bash
        ssh [your_username_for_lab_machines]@[lb01_ip_address]
        ```
      * **View HAProxy container logs:**
        ```bash
        docker logs lb-01
        ```
      * **Evidence Screenshot 2:** Capture a screenshot of the `lb-01` terminal showing the `docker logs lb-01` output. You should observe log entries indicating that requests are being routed alternately to `web01` and `web02` backend servers (e.g., look for `[client_ip]:[client_port] [lb_frontend] [backend_name]/web01` and `[client_ip]:[client_port] [lb_frontend] [backend_name]/web02` patterns in the logs). This explicitly demonstrates the round-robin distribution.

## Hardening Step (API Keys)

This "Global Public Holiday Finder" application uses the [Nager.Date Public Holiday API](https://date.nager.at/), which currently does **not** require an API key for its free tier. Therefore, there are no sensitive API keys to handle for this specific implementation.

However, as a general hardening step for applications that *do* require API keys or other sensitive information, the recommended approach is to **avoid baking them directly into the Docker image or committing them to a public repository (.gitignore is crucial)**. Instead, they should be passed as **environment variables** to the Docker containers at runtime.

**Example of passing an API key as an environment variable:**

```bash
docker run -d --name my-app -e API_KEY="your_actual_secret_api_key" -p 8080:8080 [yourdockerhubuser]/my-app:v1
```

In the application code (e.g., `script.js` for a Node.js backend, Python, etc.), you would then access this key via the environment variable (e.g., `process.env.API_KEY` in Node.js, `os.environ.get('API_KEY')` in Python).

For production environments, these secrets should be managed by dedicated secrets management solutions like Docker Secrets, Kubernetes Secrets, AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault. This ensures that sensitive data is handled securely and not exposed in code or configuration files.

## Challenges Encountered & Solutions

  * **[Challenge 1]:** Docker Desktop connection issues when initially trying to run docker compose commands
  * **[Solution 1]:** Waited for Docker Desktop to fully start up and verified connectivity with `docker ps` before proceeding with deployment
  * **[Challenge 2]:** Docker Hub repository didn't exist when trying to push the image
  * **[Solution 2]:** Created the repository on Docker Hub and successfully pushed both v1 and latest tags
  * **[Challenge 3]:** HAProxy configuration needed to be updated to point to the new application instead of the default Nginx pages
  * **[Solution 3]:** Recreated the HAProxy configuration file with the correct backend pointing to the application servers
  * **[Challenge 4]:** Port conflicts when testing locally (port 8080 was already in use by the lab infrastructure)
  * **[Solution 4]:** Used port 8083 for local testing to avoid conflicts with the existing lab setup

-----

## Deliverables

  * **GitHub Repository:** [Link to your GitHub repository containing all source code, Dockerfile, nginx.conf, and this README.md]
  * **Demo Video:** [Link to your demo video hosted on YouTube/Vimeo (max 2 minutes)]

## Requirements & Grading Criteria Summary

  * **Functionality (50%):** Application serves a meaningful purpose, effectively uses Nager.Date API, provides error handling, and allows user interaction (search, sort).
  * **Deployment (20%):** Successful deployment on Web01 and Web02, with proper HAProxy load balancer configuration.
  * **User Experience (10%):** Intuitive UI and clear data presentation.
  * **Documentation (10%):** Comprehensive and clear README, proper API/resource attribution.
  * **Demo Video (10%):** Effective and professional showcase of features within 2 minutes.

## API Credit & Acknowledgements

  * **Public Holiday Data:** Powered by [Nager.Date Public Holiday API](https://date.nager.at/).
  * **Web Server:** [Nginx](https://www.nginx.com/)
  * **Load Balancer:** [HAProxy](http://www.haproxy.org/)
  * **Containerization:** [Docker](https://www.docker.com/)

-----