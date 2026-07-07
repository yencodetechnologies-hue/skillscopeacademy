import "../styles/Loading.css"

// Usage:
// <LoadingOverlay />                                    → default message
// <LoadingOverlay message="Saving..." />                → custom message
// <LoadingOverlay message="Processing" sub="Please wait..." />

export default function Loading({
  message = "Processing your payment",
  sub     = "Please wait, do not close this page",
}) {
  return (
    <div className="lo-overlay">
      <div className="lo-box">
        <div className="lo-spinner" />
        <div className="lo-text">
          <p className="lo-message">{message}</p>
          {sub && <p className="lo-sub">{sub}</p>}
        </div>
      </div>
    </div>
  )
}