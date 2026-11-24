// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { MemoryStore } from './test/memoryStore'

describe('App', () => {
  it('se monta con un almacenamiento falso', () => {
    render(<App storage={new MemoryStore()} />)
    expect(screen.getByRole('heading', { name: 'tank-calc' })).toBeTruthy()
  })
})
