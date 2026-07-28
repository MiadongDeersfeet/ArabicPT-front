import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 헤더의 드롭다운·모바일 패널 공통 동작.
 * - 바깥 클릭 시 닫힘
 * - ESC 키로 닫히고 트리거 버튼으로 포커스 복귀
 *
 * @returns {{
 *   isOpen: boolean,
 *   open: () => void,
 *   close: () => void,
 *   toggle: () => void,
 *   containerRef: import('react').RefObject<HTMLElement>,
 *   triggerRef: import('react').RefObject<HTMLButtonElement>,
 * }}
 */
export default function useMenuDismiss() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return { isOpen, open, close, toggle, containerRef, triggerRef }
}
