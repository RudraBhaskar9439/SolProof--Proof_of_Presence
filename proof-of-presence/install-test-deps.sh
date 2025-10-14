#!/bin/bash
# Install test dependencies for Solana Anchor project

echo "Installing test dependencies..."

# Install npm dependencies
npm install --save-dev @types/chai @types/mocha chai mocha

# Install Anchor CLI if not already installed
if ! command -v anchor &> /dev/null; then
    echo "Installing Anchor CLI..."
    npm install -g @coral-xyz/anchor-cli
fi

echo "Dependencies installed successfully!"
echo "You can now run: anchor test"
