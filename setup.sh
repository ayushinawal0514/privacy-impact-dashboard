#!/bin/bash

# Healthcare Privacy Compliance System - Setup Script
# This script automates the initial setup of the application

set -e

echo "════════════════════════════════════════════════════════════════"
echo "  Healthcare Privacy Compliance System - Setup Script"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi
print_status "Docker found: $(docker --version)"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi
print_status "Docker Compose found: $(docker-compose --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
print_status "Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_status "npm found: $(npm --version)"

echo ""

# Setup environment
echo "Setting up environment..."
echo ""

if [ ! -f .env.local ]; then
    if [ ! -f .env.example ]; then
        print_error ".env.example not found"
        exit 1
    fi
    
    cp .env.example .env.local
    print_status "Created .env.local from .env.example"
    print_warning "Please update .env.local with appropriate values"
else
    print_status ".env.local already exists"
fi

echo ""

# Install dependencies
echo "Installing dependencies..."
echo ""

if npm ci --prefer-offline --no-audit; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""

# Create data directories
echo "Creating data directories..."
echo ""

mkdir -p data/mongodb
mkdir -p data/elasticsearch
mkdir -p data/redis
mkdir -p logs
mkdir -p backups

print_status "Data directories created"

echo ""

# Build Docker images
echo "Building Docker images..."
echo ""

if docker-compose build; then
    print_status "Docker images built successfully"
else
    print_error "Failed to build Docker images"
    exit 1
fi

echo ""

# Start services
echo "Starting services..."
echo ""

if docker-compose up -d; then
    print_status "Services started successfully"
else
    print_error "Failed to start services"
    exit 1
fi

# Wait for services to be ready
echo ""
echo "Waiting for services to be ready..."
echo ""

# Check MongoDB
for i in {1..30}; do
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
        print_status "MongoDB is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "MongoDB took longer to start, continuing anyway"
    fi
    echo "  Waiting for MongoDB... ($i/30)"
    sleep 2
done

# Check Frontend
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_status "Frontend is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Frontend took longer to start, continuing anyway"
    fi
    echo "  Waiting for Frontend... ($i/30)"
    sleep 2
done

echo ""

# Display information
echo "════════════════════════════════════════════════════════════════"
echo "  Setup Complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Service URLs:"
echo "  Frontend:     ${GREEN}http://localhost:3000${NC}"
echo "  API:          ${GREEN}http://localhost:3000/api${NC}"
echo "  ML Service:   ${GREEN}http://localhost:5000${NC}"
echo "  MongoDB:      ${GREEN}mongodb://admin:securepassword@localhost:27017${NC}"
echo "  Kibana:       ${GREEN}http://localhost:5601${NC}"
echo "  Grafana:      ${GREEN}http://localhost:3001${NC}"
echo "  Prometheus:   ${GREEN}http://localhost:9090${NC}"
echo ""
echo "Next Steps:"
echo "  1. Update .env.local with your configuration"
echo "  2. Visit http://localhost:3000 in your browser"
echo "  3. Log in with your credentials"
echo "  4. Review documentation: README.md, DEPLOYMENT.md, SECURITY.md"
echo ""
echo "Development Commands:"
echo "  npm run dev       - Start development server"
echo "  npm run build     - Build for production"
echo "  docker-compose down - Stop services"
echo ""
echo "For more information, see:"
echo "  ${YELLOW}README.md${NC}         - Feature overview and quick start"
echo "  ${YELLOW}DEPLOYMENT.md${NC}     - Deployment and operations guide"
echo "  ${YELLOW}SECURITY.md${NC}       - Security policies and procedures"
echo ""
echo "════════════════════════════════════════════════════════════════"
