import { useEffect, useRef, type ReactNode, type RefObject } from 'react'

interface ScreenTitleProps {
  children: ReactNode
  /** Moves the focus here when the screen appears after navigating (CA33). */
  focusOnMount: boolean
  /** Lets the screen move the focus here later, e.g. after deleting a car. */
  ref?: RefObject<HTMLHeadingElement | null>
}

/** The `h1` of a screen; it can take the focus but is not in the tab order. */
export function ScreenTitle({ children, focusOnMount, ref }: ScreenTitleProps) {
  const ownRef = useRef<HTMLHeadingElement>(null)
  const titleRef = ref ?? ownRef

  useEffect(() => {
    if (focusOnMount) titleRef.current?.focus()
  }, [focusOnMount, titleRef])

  return (
    <h1
      ref={titleRef}
      tabIndex={-1}
      className="mt-6 text-3xl font-extrabold tracking-tight outline-none"
    >
      {children}
    </h1>
  )
}
