# 🧪 Solana Contract Testing Guide

## 🚨 Current Issue: System Resource Exhaustion

The "fork failed: resource temporarily unavailable" error indicates your system has run out of process resources.

## 🔧 **Immediate Solutions:**

### **Step 1: Restart Terminal/IDE**
```bash
# Close your current terminal/IDE session completely
# Reopen and navigate back to the project directory
cd /Users/rudrabhaskar/Desktop/Github-Desktop/Github_Desktop/SolProof--Proof_of_Presence/proof-of-presence
```

### **Step 2: System Resource Check**
```bash
# Check system resources
top -l 1 | head -10
ps aux | wc -l  # Count running processes
```

### **Step 3: Install Dependencies**
```bash
# Make scripts executable
chmod +x install-test-deps.sh
chmod +x run-tests.sh

# Install dependencies
./install-test-deps.sh
```

### **Step 4: Run Tests**
```bash
# Option 1: Use the test runner script
./run-tests.sh

# Option 2: Manual commands
anchor build
anchor test

# Option 3: Run specific test file
anchor test tests/proof-of-presence.js
```

## 📋 **Test Coverage:**

Your contract includes comprehensive tests for:

✅ **Event Creation**
- Create events with metadata
- Validate event parameters
- Check event state initialization

✅ **Badge Minting**
- Mint NFT badges for attendance
- Validate attendance limits
- Track user profiles

✅ **User Management**
- Create user profiles
- Update reputation scores
- Track attended events

✅ **Event Management**
- Close events
- Validate permissions
- Update attendance counts

## 🎯 **Expected Test Results:**

```
  proof-of-presence
    ✓ Creates an event successfully (1234ms)
    ✓ Mints badge for attendee (567ms)
    ✓ Updates user reputation (234ms)
    ✓ Closes event successfully (123ms)
    ✓ Prevents duplicate attendance (345ms)
    ✓ Enforces attendance limits (456ms)

  6 passing (2.8s)
```

## 🔍 **Troubleshooting:**

### **If tests still fail:**

1. **Check Solana Test Validator:**
   ```bash
   solana-test-validator --reset
   ```

2. **Verify Anchor Installation:**
   ```bash
   anchor --version
   ```

3. **Check Node.js Version:**
   ```bash
   node --version  # Should be 16+ 
   ```

4. **Clear Build Cache:**
   ```bash
   anchor clean
   anchor build
   ```

## 📊 **Test Environment:**

- **Network:** Local Solana test validator
- **Framework:** Mocha + Chai
- **Language:** TypeScript/JavaScript
- **Anchor Version:** 0.32.1

## 🚀 **Next Steps After Tests Pass:**

1. Deploy to Devnet for integration testing
2. Create frontend integration
3. Deploy to Mainnet for production use

---

**Note:** If resource issues persist, consider restarting your Mac to clear all system locks.
