#!/bin/bash
# MCP Validation Script - Based on Official MCP Development Guide
# Validates MCP server implementation for 100% compliance
# Author: Descomplicar - Agência de Aceleração Digital

# Don't exit on error, we want to see all validation results
set +e

echo "🔍 MCP Server Validation v1.0"
echo "============================================"
echo "Validating project against MCP Official Guide..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
SUCCESS=0

# Helper functions
check_success() {
  echo -e "${GREEN}✅ $1${NC}"
  ((SUCCESS++))
}

check_error() {
  echo -e "${RED}❌ $1${NC}"
  ((ERRORS++))
}

check_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  ((WARNINGS++))
}

# 1. Check required files
echo "📁 Checking required files..."
required_files=("src/index.ts" "package.json" "tsconfig.json")
for file in "${required_files[@]}"; do
  if [[ -f "$file" ]]; then
    check_success "Found required file: $file"
  else
    check_error "Missing required file: $file"
  fi
done
echo ""

# 2. Check MCP protocol handlers
echo "🔌 Checking MCP protocol handlers..."
handlers=("ListToolsRequestSchema" "ListResourcesRequestSchema" "ListPromptsRequestSchema" "CallToolRequestSchema")
for handler in "${handlers[@]}"; do
  if grep -q "$handler" src/index.ts; then
    check_success "Handler implemented: $handler"
  else
    check_error "Handler missing: $handler"
  fi
done
echo ""

# 3. Check TypeScript strict mode
echo "⚡ Checking TypeScript configuration..."
if grep -q '"strict": true' tsconfig.json; then
  check_success "TypeScript strict mode enabled"
else
  check_error "TypeScript strict mode not enabled"
fi

if grep -q '"noImplicitAny": true' tsconfig.json; then
  check_success "noImplicitAny enabled"
else
  check_warning "noImplicitAny not explicitly enabled"
fi

if grep -q '"strictNullChecks": true' tsconfig.json; then
  check_success "strictNullChecks enabled"
else
  check_warning "strictNullChecks not explicitly enabled"
fi
echo ""

# 4. Check tool naming conventions
echo "📝 Checking tool naming conventions..."
# Look for tool names with invalid characters (exclude test files)
# Extract just the tool names and check for invalid characters within the name itself
invalid_names=$(grep -r "name: ['\"]" src/tools/ --exclude-dir="__tests__" | grep -o "['\"][^'\"]*['\"]" | tr -d "'" | tr -d '"' | grep -E "[: @]" || true)
if [[ -z "$invalid_names" ]]; then
  check_success "All tool names follow MCP conventions"
else
  check_error "Found tools with invalid names (contains :, @, or spaces)"
  echo "$invalid_names"
fi

# Check if using snake_case or kebab-case (exclude test files)
tool_names=$(grep -r "name: ['\"]" src/tools/ --exclude-dir="__tests__" | grep -o "['\"][^'\"]*['\"]" | tr -d "'" | tr -d '"' || true)
if [[ -n "$tool_names" ]]; then
  check_success "Found $(echo "$tool_names" | wc -l) tool definitions"
fi
echo ""

# 5. Check logging configuration
echo "📋 Checking logging configuration..."
if grep -q "winston" package.json; then
  check_success "Winston logger installed"
else
  check_error "Winston logger not found in dependencies"
fi

if grep -q "NODE_ENV.*production" src/utils/logger.ts 2>/dev/null; then
  check_success "Environment-based logging configured"
else
  check_warning "Environment-based logging not detected"
fi

# Check for color logging issues
if grep -q "colorize" src/utils/logger.ts 2>/dev/null; then
  if grep -q "isProduction" src/utils/logger.ts 2>/dev/null; then
    check_success "Color logging properly configured for MCP"
  else
    check_warning "Color logging may interfere with MCP protocol"
  fi
fi
echo ""

# 6. Check Zod validation
echo "🛡️  Checking input validation..."
if grep -q "zod" package.json; then
  check_success "Zod validation library installed"
else
  check_error "Zod validation library not found"
fi

zod_schemas=$(find src -name "*.ts" -exec grep -l "z\." {} \; | wc -l)
if [[ $zod_schemas -gt 0 ]]; then
  check_success "Found Zod schemas in $zod_schemas files"
else
  check_warning "No Zod schemas found"
fi
echo ""

# 7. Check error handling
echo "🔧 Checking error handling..."
if grep -q "executeWithRetry" src/core/client.ts 2>/dev/null; then
  check_success "Retry logic implemented"
else
  check_error "Retry logic not found (CRITICAL)"
fi

if grep -q "try" src/index.ts && grep -q "catch" src/index.ts; then
  check_success "Error handling in main server"
else
  check_error "No error handling in main server"
fi
echo ""

# 8. Check cache implementation
echo "💾 Checking cache implementation..."
if [[ -f "src/core/cache.ts" ]]; then
  check_success "Cache module implemented"
  if grep -q "TTL" src/core/cache.ts; then
    check_success "TTL support in cache"
  else
    check_warning "No TTL support detected in cache"
  fi
else
  check_error "Cache module not found (REQUIRED)"
fi
echo ""

# 9. Check package.json scripts
echo "📦 Checking package.json scripts..."
required_scripts=("build" "start" "test")
for script in "${required_scripts[@]}"; do
  if grep -q "\"$script\":" package.json; then
    check_success "Script defined: $script"
  else
    check_error "Missing script: $script"
  fi
done

# Check for MCP-specific scripts
if grep -q "\"validate\":" package.json; then
  check_success "Validation script defined"
else
  check_warning "No validation script in package.json"
fi
echo ""

# 10. Check for test files
echo "🧪 Checking test setup..."
test_files=$(find . -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l)
if [[ $test_files -gt 0 ]]; then
  check_success "Found $test_files test files"
else
  check_error "No test files found"
fi

if [[ -f "scripts/test-all-tools.js" ]]; then
  check_success "test-all-tools.js script exists"
else
  check_error "test-all-tools.js script missing"
fi
echo ""

# 11. Build test
echo "🔨 Testing build..."
if npm run build > /dev/null 2>&1; then
  check_success "Build completed successfully"
else
  check_error "Build failed"
fi
echo ""

# Summary
echo "============================================"
echo "📊 VALIDATION SUMMARY"
echo "============================================"
echo -e "✅ Success: ${GREEN}$SUCCESS${NC}"
echo -e "⚠️  Warnings: ${YELLOW}$WARNINGS${NC}"
echo -e "❌ Errors: ${RED}$ERRORS${NC}"
echo ""

# Calculate compliance score
TOTAL_CHECKS=$((SUCCESS + WARNINGS + ERRORS))
SCORE=$((SUCCESS * 100 / TOTAL_CHECKS))

echo "🏆 MCP COMPLIANCE SCORE: $SCORE%"
echo ""

if [[ $ERRORS -eq 0 ]]; then
  if [[ $WARNINGS -eq 0 ]]; then
    echo -e "${GREEN}✨ PERFECT! 100% MCP compliant!${NC}"
    exit 0
  else
    echo -e "${YELLOW}📈 Good compliance with minor improvements needed${NC}"
    exit 0
  fi
else
  echo -e "${RED}❌ Critical issues found. Fix errors for MCP compliance.${NC}"
  exit 1
fi