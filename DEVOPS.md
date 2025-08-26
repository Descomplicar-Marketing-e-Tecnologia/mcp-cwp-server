# DevOps Guide - MCP CWP Server

## 🚀 Quick Start

### Docker Development
```bash
# Development with hot reload
docker-compose --profile dev up

# Run tests in Docker
docker-compose --profile test up

# Production deployment
docker-compose --profile prod up -d
```

### Local Development
```bash
# Install dependencies
npm ci

# Development mode
npm run dev

# Build and test
npm run build
npm test

# Docker operations
npm run docker:build
npm run docker:run
```

## 🏗️ Docker Architecture

### Multi-Stage Dockerfile

```dockerfile
# 3-Stage Build Process:
# 1. Builder: TypeScript compilation + dependencies
# 2. Tester: Run complete test suite  
# 3. Production: Minimal runtime image
```

**Key Features:**
- **Security**: Non-root user, minimal attack surface
- **Performance**: Layer caching, optimized build order
- **Reliability**: Health checks, proper signal handling
- **Size**: ~50MB production image

### Docker Compose Profiles

| Profile | Command | Purpose |
|---------|---------|---------|
| `dev` | `--profile dev up` | Development with volume mounts |
| `prod` | `--profile prod up` | Production deployment |
| `test` | `--profile test up` | Automated testing |

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# 5 Parallel Jobs:
test:      # Node.js 18.x, 20.x, 22.x matrix
security:  # npm audit + Snyk scanning
docker:    # Build + test + push to GHCR
quality:   # SonarCloud analysis
release:   # Semantic versioning + NPM publish
```

**Triggers:**
- `push`: main, master, develop, feature/*
- `pull_request`: main, master
- `workflow_dispatch`: Manual trigger

**Artifacts:**
- Docker images: `ghcr.io/descomplicar/mcp-cwp-server`
- NPM package: `@descomplicar/mcp-cwp-server`
- Test reports: Coverage + results

## 📦 NPM Package

### Installation
```bash
# Global installation
npm install -g @descomplicar/mcp-cwp-server

# Project dependency
npm install @descomplicar/mcp-cwp-server

# Run directly
npx @descomplicar/mcp-cwp-server
```

### Package Features
- **Scoped**: `@descomplicar/mcp-cwp-server`
- **CLI Binary**: `mcp-cwp-server` command
- **TypeScript Types**: Full type definitions included
- **Examples**: Usage examples bundled

## 🛡️ Security

### Container Security
```bash
# Non-root user (UID 1001)
USER mcpuser

# Read-only filesystem (recommended)
docker run --read-only --tmpfs /tmp mcp-cwp-server

# Secrets management
docker run -e CWP_API_KEY_FILE=/run/secrets/api_key mcp-cwp-server
```

### CI/CD Security
- **Dependency Scanning**: npm audit + Snyk
- **Container Scanning**: Docker image vulnerability checks
- **Secret Management**: GitHub Secrets for tokens
- **SBOM Generation**: Software Bill of Materials

## 📊 Monitoring

### Health Checks
```bash
# Docker health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "console.log('Health check: MCP CWP Server')"

# Kubernetes readiness probe
readinessProbe:
  exec:
    command: ["node", "-e", "console.log('Ready')"]
```

### Metrics Collection
```javascript
// Performance monitoring enabled by default
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_HEALTH_CHECKS=true
```

## 🚢 Deployment Options

### 1. Docker Compose (Recommended)
```bash
# Create .env file
cp .env.example .env
# Edit your CWP credentials

# Deploy production
docker-compose --profile prod up -d

# View logs
docker-compose logs -f mcp-cwp-server
```

### 2. Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-cwp-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mcp-cwp-server
  template:
    metadata:
      labels:
        app: mcp-cwp-server
    spec:
      containers:
      - name: mcp-cwp-server
        image: ghcr.io/descomplicar/mcp-cwp-server:latest
        envFrom:
        - configMapRef:
            name: mcp-cwp-config
        resources:
          limits:
            memory: "256Mi"
            cpu: "200m"
          requests:
            memory: "128Mi"
            cpu: "100m"
```

### 3. NPM Global Install
```bash
# Install globally
npm install -g @descomplicar/mcp-cwp-server

# Configure environment
export CWP_API_URL="https://your-server.com"
export CWP_API_KEY="your-api-key"

# Run
mcp-cwp-server
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
CWP_API_URL=https://your-cwp-server.com
CWP_API_KEY=your-api-key

# Optional
NODE_ENV=production          # production|development|test
LOG_LEVEL=info              # error|warn|info|debug
CWP_SSL_VERIFY=false        # SSL verification
MCP_MOCK_MODE=false         # Mock mode for testing
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_HEALTH_CHECKS=true
```

### Docker Environment
```yaml
environment:
  - CWP_API_URL=${CWP_API_URL}
  - CWP_API_KEY=${CWP_API_KEY}
  - NODE_ENV=production
  - LOG_LEVEL=info
```

## 🐛 Troubleshooting

### Common Issues

**1. Permission Denied**
```bash
# Fix file permissions
chmod +x dist/index.js

# Docker volume permissions
docker run --user $(id -u):$(id -g) mcp-cwp-server
```

**2. Port Already in Use**
```bash
# MCP servers don't use ports (stdio communication)
# Check if other processes are interfering
```

**3. SSL/TLS Issues**
```bash
# Disable SSL verification for self-signed certificates
CWP_SSL_VERIFY=false
```

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug CWP_DEBUG=true npm start

# Docker debug
docker run -e LOG_LEVEL=debug -e CWP_DEBUG=true mcp-cwp-server
```

## 📈 Performance Tuning

### Production Optimizations
```bash
# Node.js optimizations
NODE_OPTIONS="--max-old-space-size=256"

# Docker optimizations
docker run --memory=256m --cpus=0.5 mcp-cwp-server
```

### Monitoring Commands
```bash
# Container stats
docker stats mcp-cwp-server

# Health check
docker exec mcp-cwp-server node -e "console.log('Health check')"

# Log monitoring
docker logs -f --tail=100 mcp-cwp-server
```

## 🔄 Updates

### Automatic Updates
```bash
# Using Watchtower (Docker)
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 300 \
  mcp-cwp-server
```

### Manual Updates
```bash
# NPM update
npm update -g @descomplicar/mcp-cwp-server

# Docker update
docker-compose pull
docker-compose --profile prod up -d
```

---

**For support**: [GitHub Issues](https://github.com/descomplicar/mcp-cwp-server/issues)  
**Documentation**: [GitHub Wiki](https://github.com/descomplicar/mcp-cwp-server/wiki)