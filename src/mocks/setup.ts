// src/mocks/setup.ts
import { server } from './server'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
