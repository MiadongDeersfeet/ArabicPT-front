function UiButton({ children, variant = 'primary', disabled = false, type = 'button' }) {
  return (
    <button type={type} className={`uiButton uiButton--${variant}`} disabled={disabled}>
      {children}
    </button>
  )
}

export default UiButton
