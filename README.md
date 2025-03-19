# Berrserk

## Lightweight TypeScript library for type-safe errors-as-values

## Why

I'm not a fan of throwing errors - it breaks the flow of the code. Throwing somewhere, catching somewhere else - or hope that someone else is catching it.

However - I am a fan of errors as values. Which makes the code a lot easier to read and follow. Therefore I always end up writing something similar to Berrserk in each project to handle my errors as values.

## How

Basically - wrap whatever function you have with `withError` to catch thrown errors and rejected promises.

Basic usage:

```
const result = withError(() => 42)
```

Basic async usage:

```
const result = await withError(() => new Promise<number>(resolve => resolve(42)))
```

Sync throwing error:

```
const mustBeHigherThan5 = () => {
    const randomNumber = Math.floor(Math.random() * 10)
    if (randomNumber < 5) {
        throw new Error("Random number wasn\'t high enough")
    }
    return randomNumber
}
const isHigerThan5 = withError(mustBeHigherThan5)
if (isHigerThan5.isError) {
    console.error(isHigerThan5.error)
    return
}

console.log(isHigerThan5.data)
```

Async rejection:

```
const getGitHubUsers = () => fetch('...')
const githubUsersResult = await withError(getGitHubUsers)

if (githubUsersResult.isError) {
  console.error(githubUsersResult.error)
  return
}

console.log(githubUsersResult.data)
```

Async rejection with messages:

```
const getGitHubUsers = () => fetch('...')
const githubUsersResult = await withError(getGitHubUsers, {
    successMessage: 'Successfully fetched GitHub users',
    errorMessage: 'Failed to fetch GitHub users',
})

if (githubUsersResult.isError) {
    console.error(`[FAILED]: ${githubUsersResult.message}, [ERROR]: ${githubUsersResult.error}`)
    return
}

console.log(`[SUCCESS]: ${githubUsersResult.message}, [RESULT]: ${githubUsersResult.data}`)
```

Async rejection with messages and destruct:

```
const getGitHubUsers = () => fetch('...')
const { data, isError, message, error } = await withError(getGitHubUsers, {
    successMessage: 'Successfully fetched GitHub users',
    errorMessage: 'Failed to fetch GitHub users',
})

if (isError) {
    console.error(`[FAILED]: ${message}, [ERROR]: ${error}`) // Error from fetching users
    return
}

console.log(`[SUCCESS]: ${message}, [RESULT]: ${data}`) // The callback result
```

Sync throwing errors:

```
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
