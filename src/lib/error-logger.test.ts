import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { logError } from './error-logger'

describe('logError', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    consoleSpy.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('logs an Error instance', () => {
    const error = new Error('boom')
    logError(error)
    expect(consoleSpy).toHaveBeenCalledOnce()
  })

  it('logs a string error', () => {
    logError('something bad')
    expect(consoleSpy).toHaveBeenCalledOnce()
  })

  it('includes context in the log call', () => {
    const error = new Error('ctx error')
    logError(error, { source: 'TestSource' })
    const args = consoleSpy.mock.calls[0]
    // At least one arg should reference the context
    expect(JSON.stringify(args)).toContain('TestSource')
  })
})
