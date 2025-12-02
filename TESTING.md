# Testing Guide

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run tests in watch mode (for development)
```bash
npm run test:watch
```

### Run specific test file
```bash
npm test -- <test-file-name>
# Example: npm test -- user.service.test.js
```

## Git Pre-Push Hook

This project has a **pre-push hook** that automatically runs all tests before allowing code to be pushed to the remote repository.

### Normal Push (with tests)
```bash
git push origin main
```
This will:
1. Run all tests automatically
2. If tests pass ✅ - Push proceeds
3. If tests fail ❌ - Push is blocked

### Skip Tests (Emergency/WIP)
If you need to push without running tests (not recommended for production):
```bash
git push --no-verify origin main
```

⚠️ **Warning**: Use `--no-verify` sparingly. It bypasses the safety check.

## Test Coverage

Current coverage: **91.58%** overall

- **248 tests** across 14 service files
- Statement Coverage: 91.58%
- Branch Coverage: 72.15%
- Function Coverage: 91.59%
- Line Coverage: 91.50%

### Coverage by Service

| Service | Coverage | Status |
|---------|----------|--------|
| analytics.service.js | 100% | ✅ Perfect |
| otp.service.js | 100% | ✅ Perfect |
| reminder.service.js | 100% | ✅ Perfect |
| user.service.js | 100% | ✅ Perfect |
| utility.service.js | 98.8% | ✅ Excellent |
| commercial.customer.service.js | 98.3% | ✅ Excellent |
| residential.customer.service.js | 98.3% | ✅ Excellent |
| commercial.property.service.js | 97.7% | ✅ Excellent |
| residential.property.service.js | 97.7% | ✅ Excellent |
| property.service.js | 97.9% | ✅ Excellent |
| match.service.js | 94.8% | ✅ Very Good |
| customer.service.js | 91.4% | ✅ Very Good |
| employee.service.js | 62.2% | ⚠️ Needs Improvement |
| global.search.service.js | 88.1% | ✅ Good |

## Best Practices

1. ✅ Always run tests before pushing
2. ✅ Write tests for new features
3. ✅ Maintain coverage above 90%
4. ✅ Fix failing tests immediately
5. ⚠️ Only use `--no-verify` for urgent hotfixes
