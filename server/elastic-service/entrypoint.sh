#!/bin/sh
echo "Starting container with mode: $1"

case "$1" in

  build)
    echo "Building container..."
    npm run build
    ;;
    
  dev)
    echo "Starting in development mode..."
    npm run dev
    ;;
    
  prod)
    echo "Building and starting in production mode..."
    npm run build
    npm run prod
    ;;
    
  pm2)
    echo "Building and starting with PM2..."
    npm run build
    npm run pm2
    ;;

  stop)
    echo "Stopping container..."
    npm run stop
    ;;
    
  test)
    echo "Testing container..."
    npm run test
    ;;
    
  restart)
    echo "Restarting container..."
    npm run restart
    ;;
    
  *)
    echo "Unknown mode: $1"
    echo "Available modes: build | dev | prod | pm2 | stop | test | restart"
    exit 1
    ;;
    
esac