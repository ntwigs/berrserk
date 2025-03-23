type Either<TResult, TError = Error> = Success<TResult> | Failure<TError>

type Success<TResult> = {
  data: TResult
  error?: undefined
}

type Failure<TError = Error> = {
  data?: undefined
  error: TError
}

export function withError(callback: () => never): Failure
export function withError<TResult>(
  callback: () => Promise<TResult>
): Promise<Either<TResult>>
export function withError<TResult>(callback: () => TResult): Either<TResult>
export function withError<TResult>(
  callback: () => TResult | Promise<TResult>
): Either<TResult> | Promise<Either<TResult>> {
  try {
    const result = callback()
    const isPromise = result instanceof Promise
    if (!isPromise) return getSuccess(result)

    return result.then(getSuccess).catch(getFailure)
  } catch (error) {
    return getFailure(error)
  }
}

const getFailure = (error: unknown): Failure => ({
  error: error instanceof Error ? error : new Error(String(error)),
})

const getSuccess = <TResult>(data: TResult): Success<TResult> => ({
  data,
})
