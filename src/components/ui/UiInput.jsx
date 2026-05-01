function UiInput({ label, placeholder, hint }) {
  const inputId = `input-${label}`

  return (
    <div className="uiField">
      <label htmlFor={inputId} className="uiFieldLabel">
        {label}
      </label>
      <input id={inputId} className="uiInput" placeholder={placeholder} />
      {hint ? <p className="uiHint">{hint}</p> : null}
    </div>
  )
}

export default UiInput
