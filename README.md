# Global Public Holiday Finder

A web application that helps users find public holidays for any country and year, making it easy to plan travel, work schedules, or personal events. Built with modern web technologies and deployed using Docker containers with load balancing for high availability.

## 🌟 Features

- **Global Holiday Data**: Access public holidays for over 200 countries
- **Real-time API Integration**: Fetches data from the Nager.Date Public Holiday API
- **User-Friendly Interface**: Clean, responsive design that works on all devices
- **Advanced Search & Filter**: Find specific holidays by name or type
- **Sorting Capabilities**: Sort holidays by date or name
- **Error Handling**: Graceful handling of network issues and invalid inputs
- **High Availability**: Load-balanced deployment for reliability

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### Local Development
1. **Clone the repository:**
   ```bash
   git clone https://github.com/kamanzi2025/public-holiday.git
   cd public-holiday
   ```

2. **Run locally:**
   ```bash
   docker build -t holiday-finder .
   docker run -p 8080:8080 holiday-finder
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:8080`

### Production Deployment

1. **Navigate to the servers directory:**
   ```bash
   cd servers
   ```

2. **Build and start all containers:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. **Access the application:**
   - **Load Balanced**: http://localhost:8082
   - **Direct Access**: 
     - http://localhost:8080 (web-01)
     - http://localhost:8081 (web-02)

## 🏗️ Architecture

### Project Structure
```
public-holiday-finder/
├── index.html          # Main application interface
├── styles.css          # Application styling
├── script.js           # Application logic and API integration
├── servers/
│   ├── compose.yml     # Docker Compose configuration
│   ├── lb/             # Load balancer configuration
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── start-services.sh
│   └── web/            # Web server configuration
│       ├── Dockerfile
│       └── start-services.sh
└── README.md
```

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: Nager.Date Public Holiday API
- **Containerization**: Docker
- **Load Balancer**: Nginx
- **Orchestration**: Docker Compose

## 🔧 Configuration

### Load Balancer Setup
The application uses Nginx as a load balancer to distribute traffic between two web servers:

```nginx
upstream backend {
    server 172.20.0.11:80;  # web-01
    server 172.20.0.12:80;  # web-02
}
```

### Docker Images
- **Repository**: `kamanzi22/public`
- **Tags**: `v1`, `latest`
- **Port**: 80 (internal), 8080-8082 (external)

## 🧪 Testing

### Load Balancer Testing
```bash
# Test the load balancer
curl -I http://localhost:8082

# Test individual web servers
curl -I http://localhost:8080
curl -I http://localhost:8081
```

### Load Balancing Verification
```bash
# Test traffic distribution
for i in {1..10}; do 
    echo "Request $i:"; 
    curl -s http://localhost:8082 | grep -o '<title>.*</title>'; 
done
```

### Container Status
```bash
# Check running containers
docker ps

# View container logs
docker logs lb-01
docker logs web-01
docker logs web-02
```

## 🔒 Security Considerations

### API Key Management
This application uses the Nager.Date Public Holiday API, which doesn't require authentication for basic usage. However, for applications requiring API keys, follow these best practices:

```bash
# Pass API keys as environment variables
docker run -d --name app -e API_KEY="your_secret_key" -p 8080:8080 kamanzi22/public:v1
```

### Production Security
- Use environment variables for sensitive data
- Implement proper secrets management (Docker Secrets, Kubernetes Secrets)
- Regular security updates for base images
- Network isolation between containers

## 🐛 Troubleshooting

### Common Issues

**Docker Desktop not running:**
```bash
# Start Docker Desktop and wait for it to fully initialize
docker ps  # Verify connectivity
```

**Port conflicts:**
```bash
# Check for port usage
netstat -an | grep 8080
# Use different ports if needed
```

**Network conflicts:**
```bash
# Clean up existing containers and networks
docker-compose down
docker network prune -f
docker-compose up -d
```

**Load balancer not working:**
```bash
# Check container status
docker ps

# Verify network connectivity
docker exec lb-01 ping -c 2 172.20.0.11
docker exec lb-01 ping -c 2 172.20.0.12

# Check Nginx configuration
docker exec lb-01 nginx -t
```

## 📊 Performance

### Load Balancing Features
- **Algorithm**: Round-robin distribution
- **Health Checks**: Automatic backend monitoring
- **Failover**: Automatic failover if a server is down
- **Scalability**: Easy to add more web servers

### Optimization Tips
- Enable Nginx caching for static content
- Use CDN for global content delivery
- Implement API response caching
- Monitor container resource usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Public Holiday Data**: Powered by [Nager.Date Public Holiday API](https://date.nager.at/)
- **Web Server**: [Nginx](https://www.nginx.com/)
- **Containerization**: [Docker](https://www.docker.com/)
- **Container Orchestration**: [Docker Compose](https://docs.docker.com/compose/)

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Global Public Holiday Finder** - Making holiday planning easier worldwide! 🌍
