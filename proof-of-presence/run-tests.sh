#!/bin/bash
# Run Solana Anchor tests

echo "Starting Solana Anchor tests..."

# Check if we're in the right directory
if [ ! -f "Anchor.toml" ]; then
    echo "Error: Anchor.toml not found. Please run this script from the project root."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the project first
echo "Building the project..."
anchor build

# Run tests
echo "Running tests..."
anchor test

echo "Tests completed!"
