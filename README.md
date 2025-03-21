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

## Highlights

- Type safe
- No dependencies
- Clean and simple
- Locally sourced by a human

## Install

```sh
npm install berrserk
```

Or whatever package manager you're currently using.

## Why

I'm not a fan of throwing errors - it breaks the flow of the code. Throwing somewhere, catching somewhere else - or hoping that someone else is catching it.

However, I am a fan of errors as values. Which makes the code a lot easier to read and follow. Therefore I always end up writing something similar to `berrserk` in each project to handle my errors as values.

## How

Basically - wrap whatever function you have with `withError` to catch thrown errors and rejected promises.

Basic usage:

```ts
const result = withError(() => 42)
```

Basic async usage:

```ts
const result = await withError(
  () => new Promise<number>((resolve) => resolve(42))
)
```

Synchronous throwing error:

```ts
const mustBeHigherThan5 = () => {
  const randomNumber = Math.floor(Math.random() * 10)
  if (randomNumber < 5) {
    throw new Error("Random number wasn\'t high enough")
  }
  return randomNumber
}
const isHigherThan5 = withError(mustBeHigherThan5)
if (isHigherThan5.isError) {
  console.error(isHigherThan5.error)
  return
}

console.log(isHigerThan5.data)
```

Async rejection:

```ts
const getGitHubUsers = () => fetch('...')
const githubUsersResult = await withError(getGitHubUsers)

if (githubUsersResult.isError) {
  console.error(githubUsersResult.error)
  return
}

console.log(githubUsersResult.data)
```

Async rejection with messages:

```ts
const getGitHubUsers = () => fetch('...')
const githubUsersResult = await withError(getGitHubUsers, {
  successMessage: 'Successfully fetched GitHub users',
  errorMessage: 'Failed to fetch GitHub users',
})

if (githubUsersResult.isError) {
  console.error(
    `[FAILED]: ${githubUsersResult.message}, [ERROR]: ${githubUsersResult.error}`
  )
  return
}

console.log(
  `[SUCCESS]: ${githubUsersResult.message}, [RESULT]: ${githubUsersResult.data}`
)
```

Async rejection with messages and destructure:

```ts
const getGitHubUsers = () => fetch('...')
const { data, isError, message, error } = await withError(getGitHubUsers, {
  successMessage: 'Successfully fetched GitHub users',
  errorMessage: 'Failed to fetch GitHub users',
})

if (isError) {
  console.error(`[FAILED]: ${message}, [ERROR]: ${error}`)
  return
}

console.log(`[SUCCESS]: ${message}, [RESULT]: ${data}`)
```

Synchronous throwing errors:

```ts
const mustBeHigherThan5 = () => {
  const randomNumber = Math.floor(Math.random() * 10)
  if (randomNumber < 5) {
    throw new Error("Random number wasn\'t high enough")
  }
  return randomNumber
}

const lotsOfFives = new Array(10)
  .fill(null)
  .map(() => withError(mustBeHigherThan5))
  .filter((result) => !result.isError)
  .map((result) => result.data)

console.log(lotsOfFives)
```

## Local setup

This should be rather straight forward:

1. Clone the repo
2. Install development dependencies `pnpm i`
3. Run with `pnpm dev`
4. Build with `pnpm build`
5. Format with `pnpm format`
6. Lint with `pnpm lint`

If you're having issues, file an issue.

---

Created with an unhealthy amount of hatred towards error-throwing.
