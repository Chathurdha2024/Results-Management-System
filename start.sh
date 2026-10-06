#!/bin/bash

echo "Starting Docker containers..."
sudo docker compose up -d

echo ""
echo "=========================================================="
echo "✅ Docker is up and running!"
echo "Your current WSL IP Address is: $(hostname -I | awk '{print $1}')"
echo ""
echo "Click the links below to access your apps in your browser:"
echo "👉 Main Frontend:    http://$(hostname -I | awk '{print $1}'):5173"
echo "👉 Student Frontend: http://$(hostname -I | awk '{print $1}'):5174"
echo "👉 Backend API:      http://$(hostname -I | awk '{print $1}'):3000"
echo "=========================================================="
