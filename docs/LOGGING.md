# MCP CWP Server - Logging Guide

## Overview

The MCP CWP Server implements the official MCP Descomplicar logging standards with dual-mode configuration:
- **Development**: Exhaustive logging for debugging (level: `silly`)
- **Production**: Minimal logging for performance (level: `error`)

## Logging Compliance

This implementation follows the MCP Guide requirements:
- ✅ Maximum logs during development → Minimum logs in production
- ✅ Multiple log files in development (50MB total)
- ✅ Single minimal log file in production (2MB)
- ✅ Tool call logging with performance metrics
- ✅ API request/response logging
- ✅ Error context with full stack traces

## Environment Configuration

### Development Mode (default)
```bash
# .env
NODE_ENV=development
LOG_LEVEL=debug  # or 'silly' for maximum verbosity
```

### Production Mode
```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=error              # Only errors
ENABLE_CONSOLE_LOGS=false    # Silent console
MCP_MODE=true               # Optimized for Claude Desktop
```

## Running with Different Log Levels

```bash
# Production mode - for Claude Desktop
npm run start:claude

# Silent mode - no logs at all
npm run start:silent

# Debug mode - detailed logging
npm run start:debug

# Verbose mode - maximum logging
npm run start:verbose
```

## Log Files

### Development
- `logs/development-full.log` - All logs (50MB)
- `logs/errors.log` - Error logs only (10MB)
- `logs/debug-tools.log` - Debug information (20MB)

### Production
- `logs/app.log` - Minimal logs (2MB)

## Log Levels

| Level | Development | Production | Description |
|-------|-------------|------------|-------------|
| error | ✓ | ✓ | Critical errors only |
| warn | ✓ | ✓ | Warnings (slow operations) |
| info | ✓ | ✗ | General information |
| debug | ✓ | ✗ | Detailed debugging |
| silly | ✓ | ✗ | Everything (max verbosity) |

## Performance Monitoring

Tools that take longer than threshold times are logged:
- Development: > 2 seconds → warning
- Production: > 5 seconds → warning

## Best Practices

1. **Use production mode for Claude Desktop** to avoid context exhaustion
2. **Enable debug mode only when troubleshooting** specific issues
3. **Monitor log file sizes** and rotate as needed
4. **Review performance warnings** to optimize slow tools

## Troubleshooting

### Issue: Claude Desktop context exhaustion
**Solution**: Use `npm run start:claude` or set `LOG_LEVEL=error`

### Issue: Can't see any logs
**Solution**: Check if `NODE_ENV=production` and `ENABLE_CONSOLE_LOGS=false`

### Issue: Need detailed debugging
**Solution**: Use `npm run start:verbose` temporarily