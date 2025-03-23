<p align="center">
  <img alt='berrserk-logo' src='https://raw.githubusercontent.com/ntwigs/berrserk/main/assets/berrserk.png' width='400'/>
  <p align="center">Lightweight TypeScript library for type-safe errors-as-values</p>
  <p align="center">
    <a href="https://github.com/ntwigs/berrserk/blob/main/LICENSE"><img src="https://img.shields.io/dub/l/vibe-d.svg?style=for-the-badge" alt="mit license"></a>
    <a href="https://www.npmjs.org/package/berrserk"><img src="https://img.shields.io/npm/v/berrserk?style=for-the-badge" alt="npm version"></a>
    <a href="https://bundlephobia.com/result?p=berrserk"><img src="https://img.shields.io/bundlephobia/minzip/berrserk?label=size&style=for-the-badge" alt="bundlephobia"></a>
  </p>
</div>

---

## Installation

```bash
npm add berrserk
# or
yarn add berrserk
# or
pnpm add berrserk
```

Or whatever package manager you're currently using.

## Highlights

- Handle errors as values rather than exceptions
- Support for both synchronous and asynchronous functions
- Type-safe return values with proper TypeScript definitions
- Zero dependencies
- It's also _very_ cool

## Usage

### Basic Usage

```typescript
import { withError } from 'berrserk'

// Synchronous example
const result = withError(() => {
  // This might throw an error
  return JSON.parse('{"valid": "json"}')
})

result.error
  ? console.log('Parsed data:', result.data)
  : console.error('Error parsing:', result.error.message)

// Asynchronous example
const fetchData = async () => {
  const result = await withError(async () => {
    const response = await fetch('https://api.example.com/data')
    return response.json()
  })

  if (result.error) {
    console.error('API Error:', result.error)
    return null
  }

  return result.data
}
```

### Type Definitions

```typescript
type Either<TResult, TError = Error> = Success<TResult> | Failure<TError>

type Success<TResult> = {
  data: TResult
  error?: undefined
}

type Failure<TError = Error> = {
  data?: undefined
  error: TError
}
```

## API Reference

### `withError()`

Executes a callback function and handles any errors that may be thrown, returning a structured result object.

```typescript
function withError<TResult>(
  callback: () => TResult | Promise<TResult>
): Either<TResult> | Promise<Either<TResult>>
```

#### Parameters

- `callback`: A function that returns a value or a promise. If this function throws or rejects, the error will be caught and wrapped in the return value.

#### Returns

- For synchronous functions: `Either<TResult, Error>`
- For asynchronous functions: `Promise<Either<TResult, Error>>`

## Examples

### Form Validation

```typescript
import { withError } from 'berrserk'

const validateForm = (formData) => {
  return withError(() => {
    if (!formData.email) {
      throw new Error('Email is required')
    }
    if (!formData.password) {
      throw new Error('Password is required')
    }
    return { valid: true }
  })
}

const result = validateForm({ email: 'user@example.com' })
if (result.error) {
  displayError(result.error.message) // "Password is required"
}
```

### API Requests

```typescript
import { withError } from 'berrserk'

const getUserData = async (userId) => {
  const result = await withError(async () => {
    const response = await fetch(`/api/users/${userId}`)
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    return response.json()
  })

  return result
}

// Usage
const userResult = await getUserData(123)
userResult.error ? showError(userResult.error) : renderUser(userResult.data)
```

## Benefits Over Traditional Try/Catch

- Enforces error handling at compile time with TypeScript
- Makes error paths explicit in your code
- Eliminates the possibility of unhandled exceptions
- Seamlessly works with both synchronous and asynchronous code
- Provides consistent error handling patterns across your codebase

## Local Development

Setting up the project for local development is straightforward:

1. Clone the repository

   ```bash
   git clone https://github.com/ntwigs/berrserk.git
   cd berrserk
   ```

2. Install development dependencies

   ```bash
   pnpm i
   ```

3. Available scripts:

   ```bash
   # Watch mode during development
   pnpm dev

   # Build the library
   pnpm build

   # Run tests
   pnpm test

   # Format code
   pnpm format

   # Check formatting
   pnpm format:check

   # Lint code
   pnpm lint
   ```

The project uses `rslib` for building, `vitest` for testing, and follows the configuration from `@goatee/prettier` for code style.

If you encounter any issues during setup or development, please [file an issue](https://github.com/ntwigs/berrserk/issues).

---

Created with an unhealthy amount of hatred towards error-throwing.
