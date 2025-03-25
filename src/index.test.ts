import { describe, it, expect } from 'vitest'
import { withError } from '.'

describe('withError', () => {
  const testValue = { id: 1, name: 'item' }
  const errorMessage = Symbol('error-message')

  describe('synchronous operations', () => {
    it('should return data for successful operations', () => {
      const result = withError(() => testValue)

      expect(result).toEqual({
        data: testValue,
      })
      expect(result.error).toBeUndefined()
    })

    it('should return error for failed operations', () => {
      const error = new Error()
      const result = withError(() => {
        throw error
      })

      expect(result).toEqual({
        error,
      })
      expect(result.data).toBeUndefined()
    })

    it('should convert non-Error thrown values to Error objects', () => {
      const result = withError(() => {
        throw errorMessage
      })

      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe(String(errorMessage))
      expect(result.data).toBeUndefined()
    })

    it('should handle null and undefined return values', () => {
      const nullResult = withError(() => null)
      expect(nullResult).toEqual({ data: null })

      const undefinedResult = withError(() => undefined)
      expect(undefinedResult).toEqual({ data: undefined })
    })
  })

  describe('asynchronous operations', () => {
    it('should return data for successful async operations', async () => {
      const asyncValue = { ...testValue, async: true }
      const result = await withError(async () => asyncValue)

      expect(result).toEqual({
        data: asyncValue,
      })
      expect(result.error).toBeUndefined()
    })

    it('should return error for rejected promises', async () => {
      const error = new Error()
      const result = await withError(async () => {
        throw error
      })

      expect(result).toEqual({
        error,
      })
      expect(result.data).toBeUndefined()
    })

    it('should handle errors thrown inside async functions', async () => {
      const result = await withError(async () => {
        throw errorMessage
      })

      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe(String(errorMessage))
      expect(result.data).toBeUndefined()
    })

    it('should handle delayed async responses', async () => {
      const delayedValue = { ...testValue, delayed: true }
      const result = await withError(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return delayedValue
      })

      expect(result).toEqual({
        data: delayedValue,
      })
    })

    it('should handle delayed async errors', async () => {
      const error = new Error()
      const result = await withError(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        throw error
      })

      expect(result).toEqual({
        error,
      })
    })
  })

  describe('edge cases', () => {
    it('should handle functions returning promises', async () => {
      const promiseValue = { ...testValue, promise: true }
      const result = await withError(() => Promise.resolve(promiseValue))
      expect(result).toEqual({ data: promiseValue })
    })

    it('should handle complex data structures', () => {
      const complexData = {
        array: [1, 2, 3],
        nested: { value: Symbol('test') },
        fn: () => Symbol('function'),
      }

      const result = withError(() => complexData)
      expect(result).toEqual({ data: complexData })
    })

    it('should handle errors with custom properties', () => {
      class CustomError extends Error {
        code: symbol
        constructor(message: symbol, code: symbol) {
          super(String(message))
          this.code = code
        }
      }

      const errorSymbol = Symbol('custom-error')
      const codeSymbol = Symbol('code')
      const customError = new CustomError(errorSymbol, codeSymbol)
      const result = withError(() => {
        throw customError
      })

      expect(result.error).toBe(customError)
      expect((result.error as CustomError).code).toBe(codeSymbol)
    })
  })

  // Type checking
  describe('type discrimination', () => {
    it('should allow for type narrowing with property checks', () => {
      const result = withError(() => testValue)

      // Demonstrating type narrowing with property checks
      if ('data' in result) {
        expect(result.data).toBe(testValue)
      } else {
        // This branch shouldn't be reached in this test
        throw new Error('Type narrowing failed')
      }
    })

    it('should handle type narrowing with error property', () => {
      const expectedError = new Error()
      const result = withError(() => {
        throw expectedError
      })

      if ('error' in result && result.error !== undefined) {
        expect(result.error).toBe(expectedError)
      } else {
        // This branch shouldn't be reached in this test
        throw new Error('Type narrowing failed')
      }
    })
  })
})
