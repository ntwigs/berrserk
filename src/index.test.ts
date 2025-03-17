import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withError, type Either, type SuccessResult, type ErrorResult } from '.'

// Test utilities
const createTestError = () => new Error('test-error')
const STATIC_VALUE = 'test-value'

// Type guards for better test assertions
const isResult = <T>(result: Either<T>): result is SuccessResult<T> =>
  !result.isError
const isErrorResult = (result: Either<any>): result is ErrorResult =>
  result.isError

// Test helpers
const testMessages = {
  success: 'success-message',
  error: 'error-message',
}

describe('withError', () => {
  describe('sync functions', () => {
    it('returns success result for successful execution', () => {
      const result = withError(() => STATIC_VALUE)

      expect(isResult(result)).toBe(true)
      expect(isErrorResult(result)).toBe(false)

      if (isResult(result)) {
        expect(result.data).toBe(STATIC_VALUE)
      }
    })

    it('returns error result when function throws', () => {
      const error = createTestError()
      const result = withError(() => {
        throw error
      })

      expect(isErrorResult(result)).toBe(true)

      if (isErrorResult(result)) {
        expect(result.error).toBe(error)
      }
    })

    it('converts non-Error throws to Error objects', () => {
      const result = withError(() => {
        throw 'not-an-error'
      })

      expect(isErrorResult(result)).toBe(true)

      if (isErrorResult(result)) {
        expect(result.error instanceof Error).toBe(true)
        expect(result.error.message).toBe('not-an-error')
      }
    })

    it('includes custom error message', () => {
      const result = withError(
        () => {
          throw createTestError()
        },
        { errorMessage: testMessages.error }
      )

      expect(isErrorResult(result)).toBe(true)

      if (isErrorResult(result)) {
        expect(result.message).toBe(testMessages.error)
      }
    })

    it('includes custom success message', () => {
      const result = withError(() => STATIC_VALUE, {
        successMessage: testMessages.success,
      })

      expect(isResult(result)).toBe(true)

      if (isResult(result)) {
        expect(result.message).toBe(testMessages.success)
      }
    })
  })

  describe('async functions', () => {
    it('returns success result for resolved promises', async () => {
      const result = await withError(() => Promise.resolve(STATIC_VALUE))

      expect(isResult(result)).toBe(true)

      if (isResult(result)) {
        expect(result.data).toBe(STATIC_VALUE)
      }
    })

    it('returns error result for rejected promises', async () => {
      const error = createTestError()
      const result = await withError(() => Promise.reject(error))

      expect(isErrorResult(result)).toBe(true)

      if (isErrorResult(result)) {
        expect(result.error).toBe(error)
      }
    })

    it('handles throws in async functions', async () => {
      const error = createTestError()
      const result = await withError(async () => {
        throw error
      })

      expect(isErrorResult(result)).toBe(true)

      if (isErrorResult(result)) {
        expect(result.error).toBe(error)
      }
    })

    it('includes custom messages with async results', async () => {
      const successResult = await withError(
        () => Promise.resolve(STATIC_VALUE),
        { successMessage: testMessages.success }
      )

      const errorResult = await withError(
        () => Promise.reject(createTestError()),
        { errorMessage: testMessages.error }
      )

      if (isResult(successResult)) {
        expect(successResult.message).toBe(testMessages.success)
      }

      if (isErrorResult(errorResult)) {
        expect(errorResult.message).toBe(testMessages.error)
      }
    })
  })

  describe('type handling', () => {
    interface TestType {
      id: number
      value: string
    }

    const testObject: TestType = { id: 1, value: 'test' }

    it('preserves return types', () => {
      const result = withError(() => testObject)

      expect(isResult(result)).toBe(true)

      if (isResult(result)) {
        expect(result.data).toEqual(testObject)
        expect(result.data.id).toBe(1)
        expect(result.data.value).toBe('test')
      }
    })

    it('preserves async return types', async () => {
      const result = await withError(() => Promise.resolve(testObject))

      expect(isResult(result)).toBe(true)

      if (isResult(result)) {
        expect(result.data).toEqual(testObject)
      }
    })
  })

  describe('fetch operations', () => {
    const mockResponse = { data: 'response-data' }

    beforeEach(() => {
      // Reset mocks between tests
      vi.resetAllMocks()
    })

    it('handles successful fetch', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const fetchData = () => fetch('dummy-url').then((res) => res.json())
      const result = await withError(fetchData, {
        errorMessage: testMessages.error,
        successMessage: testMessages.success,
      })

      expect(isResult(result)).toBe(true)

      if (isResult(result)) {
        expect(result.message).toBe(testMessages.success)
        expect(result.data).toBe(mockResponse)
      }
    })

    it('handles fetch failures', async () => {
      const networkError = createTestError()
      global.fetch = vi.fn().mockRejectedValue(networkError)

      const fetchData = () => fetch('dummy-url').then((res) => res.json())
      const result = await withError(fetchData, {
        resultMessage: testMessages.success,
        errorMessage: testMessages.error,
      })

      expect(isErrorResult(result)).toBe(true)

      if (isErrorResult(result)) {
        expect(result.message).toBe(testMessages.error)
        expect(result.error).toBe(networkError)
      }
    })
  })

  describe('edge cases', () => {
    it('handles null/undefined returns', () => {
      const nullResult = withError(() => null)
      const undefinedResult = withError(() => undefined)

      expect(isResult(nullResult)).toBe(true)
      expect(isResult(undefinedResult)).toBe(true)

      if (isResult(nullResult)) {
        expect(nullResult.data).toBe(null)
      }

      if (isResult(undefinedResult)) {
        expect(undefinedResult.data).toBe(undefined)
      }
    })

    it('supports nested withError calls', () => {
      const innerValue = 'inner-value'
      const transformValue = (val: string) => String(val).toUpperCase()

      const innerResult = withError(() => innerValue)
      const outerResult = withError(() => {
        if (isErrorResult(innerResult)) throw innerResult.error
        return transformValue(innerResult.data)
      })

      expect(isResult(outerResult)).toBe(true)

      if (isResult(outerResult)) {
        expect(typeof outerResult.data).toBe('string')
      }
    })
  })
})
