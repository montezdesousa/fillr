import { useState } from "react"

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div
      style={{
        padding: 16
      }}>
      <h1>Fillr</h1>
      <p>To use Fillr just right-click on any form page and select "Fill from..."</p>
    </div>
  )
}

export default IndexPopup
