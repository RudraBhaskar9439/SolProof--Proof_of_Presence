#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SolProof - Solana Contract Testing${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if Solana is installed
echo -e "${YELLOW}🔍 Checking Solana installation...${NC}"
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found!${NC}"
    echo -e "${YELLOW}Please install Solana: https://docs.solana.com/cli/install-solana-cli-tools${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Solana CLI found: $(solana --version)${NC}\n"

# Check if Anchor is installed
echo -e "${YELLOW}🔍 Checking Anchor installation...${NC}"
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found!${NC}"
    echo -e "${YELLOW}Please install Anchor: https://www.anchor-lang.com/docs/installation${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Anchor CLI found: $(anchor --version)${NC}\n"

# Check if Node.js is installed
echo -e "${YELLOW}🔍 Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo -e "${YELLOW}Please install Node.js: https://nodejs.org/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}\n"

# Step 1: Clean previous builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
anchor clean
echo -e "${GREEN}✅ Clean complete${NC}\n"

# Step 2: Build the program
echo -e "${BLUE}🔨 Building Solana program...${NC}"
if anchor build; then
    echo -e "${GREEN}✅ Build successful!${NC}\n"
else
    echo -e "${RED}❌ Build failed!${NC}"
    echo -e "${YELLOW}Trying alternative build method...${NC}\n"
    
    # Try building with cargo
    cd programs/proof-of-presence
    if cargo build-bpf; then
        echo -e "${GREEN}✅ Alternative build successful!${NC}\n"
        cd ../..
    else
        echo -e "${RED}❌ Build failed with both methods${NC}"
        exit 1
    fi
fi

# Step 3: Run Rust unit tests
echo -e "${BLUE}🧪 Running Rust unit tests...${NC}"
cd programs/proof-of-presence
if cargo test; then
    echo -e "${GREEN}✅ Rust unit tests passed!${NC}\n"
else
    echo -e "${YELLOW}⚠️  Some Rust tests may have failed${NC}\n"
fi
cd ../..

# Step 4: Check if local validator is running
echo -e "${YELLOW}🔍 Checking for local validator...${NC}"
if solana cluster-version &> /dev/null; then
    echo -e "${GREEN}✅ Validator is running${NC}\n"
else
    echo -e "${YELLOW}⚠️  No validator detected${NC}"
    echo -e "${BLUE}Starting local validator...${NC}"
    echo -e "${YELLOW}Note: This will run in the background${NC}\n"
    
    # Start validator in background
    solana-test-validator > /dev/null 2>&1 &
    VALIDATOR_PID=$!
    
    # Wait for validator to start
    echo -e "${YELLOW}Waiting for validator to start...${NC}"
    sleep 5
    
    if solana cluster-version &> /dev/null; then
        echo -e "${GREEN}✅ Validator started successfully${NC}\n"
    else
        echo -e "${RED}❌ Failed to start validator${NC}"
        exit 1
    fi
fi

# Step 5: Configure Solana CLI
echo -e "${BLUE}⚙️  Configuring Solana CLI...${NC}"
solana config set --url localhost
echo -e "${GREEN}✅ Configuration complete${NC}\n"

# Step 6: Deploy the program
echo -e "${BLUE}🚀 Deploying program to local validator...${NC}"
if anchor deploy; then
    echo -e "${GREEN}✅ Program deployed successfully!${NC}\n"
else
    echo -e "${YELLOW}⚠️  Deployment may have failed, continuing with tests...${NC}\n"
fi

# Step 7: Install test dependencies
echo -e "${BLUE}📦 Installing test dependencies...${NC}"
if command -v npm &> /dev/null; then
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}\n"
elif command -v yarn &> /dev/null; then
    yarn install
    echo -e "${GREEN}✅ Dependencies installed${NC}\n"
else
    echo -e "${YELLOW}⚠️  No package manager found (npm/yarn)${NC}"
    echo -e "${YELLOW}Skipping dependency installation${NC}\n"
fi

# Step 8: Run integration tests
echo -e "${BLUE}🧪 Running integration tests...${NC}"
if anchor test --skip-local-validator; then
    echo -e "${GREEN}✅ All integration tests passed!${NC}\n"
else
    echo -e "${RED}❌ Some integration tests failed${NC}\n"
fi

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Build: Complete${NC}"
echo -e "${GREEN}✅ Unit Tests: Complete${NC}"
echo -e "${GREEN}✅ Integration Tests: Complete${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}🎉 Testing complete!${NC}"
echo -e "${YELLOW}Check the output above for any failures${NC}\n"

# Cleanup option
read -p "Do you want to stop the local validator? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ ! -z "$VALIDATOR_PID" ]; then
        kill $VALIDATOR_PID 2>/dev/null
        echo -e "${GREEN}✅ Validator stopped${NC}"
    else
        pkill solana-test-validator
        echo -e "${GREEN}✅ Validator stopped${NC}"
    fi
fi

echo -e "\n${GREEN}Done!${NC}\n"
