export type Message = { errorMessage?: string; successMessage?: string }

type ExtractErrorMessage<TMessage extends Message> = TMessage extends {
  errorMessage: infer TErrorMessage
}
  ? TErrorMessage
  : undefined

type ExtractSuccessMessage<TMessage extends Message> = TMessage extends {
  successMessage: infer TSuccessMessage
}
  ? TSuccessMessage
  : undefined

export type Either<TCallback, TMessage extends Message = Message> =
  | SuccessResult<TCallback, TMessage>
  | ErrorResult<TMessage>

export type SuccessResult<TResult, TMessage extends Message = Message> = {
  data: TResult
  message: ExtractSuccessMessage<TMessage>
  isError: false
}

export type ErrorResult<TMessage extends Message = Message> = {
  data?: undefined
  error: Error
  message: ExtractErrorMessage<TMessage>
  isError: true
}

export function withError(
  callback: () => never,
  message?: Message
): ErrorResult<Message>
export function withError<TCallback, const TMessage extends Message = Message>(
  callback: () => Promise<TCallback>,
  message?: TMessage
): Promise<Either<TCallback, TMessage>>
export function withError<TCallback, const TMessage extends Message = Message>(
  callback: () => TCallback,
  message?: TMessage
): Either<TCallback, TMessage>
export function withError<TCallback, const TMessage extends Message = Message>(
  callback: () => TCallback | Promise<TCallback>,
  message: TMessage = {} as TMessage
): Either<TCallback, TMessage> | Promise<Either<TCallback, TMessage>> {
  const response = getResponseWithMessage(message)

  try {
    const result = callback()
    const isPromise = result instanceof Promise
    if (!isPromise) return response.getSuccess(result)

    return result.then(response.getSuccess).catch(response.getError)
  } catch (error) {
    return response.getError(error)
  }
}

const getResponseWithMessage = <const TMessage extends Message>(
  message: TMessage
) => {
  const getError = (error: unknown): ErrorResult<TMessage> => ({
    error: error instanceof Error ? error : new Error(String(error)),
    message: message.errorMessage as ExtractErrorMessage<TMessage>,
    isError: true,
  })

  const getSuccess = <TResult>(
    data: TResult
  ): SuccessResult<TResult, TMessage> => ({
    data,
    message: message.successMessage as ExtractSuccessMessage<TMessage>,
    isError: false,
  })

  return {
    getError,
    getSuccess,
  }
}
