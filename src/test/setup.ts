import { afterEach } from 'vitest'

// Only the component tests (`.test.tsx`) run in jsdom (D11); the rest run in Node.
if (typeof document !== 'undefined') {
  const { cleanup } = await import('@testing-library/react')
  afterEach(cleanup)

  // jsdom does not implement modal dialogs: a minimal stand-in that only
  // toggles `open`. Focus and Escape are checked by hand in the browser.
  const dialog = HTMLDialogElement.prototype
  if (typeof dialog.showModal !== 'function') {
    dialog.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
    dialog.close = function close(this: HTMLDialogElement) {
      if (!this.open) return
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
}
