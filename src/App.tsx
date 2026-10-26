import { Navigate, Route, Routes } from 'react-router-dom'
import { ServicesHome, TranslateScreen } from './translate/TranslateScreens'

export default function App() {
  return (
    <div className="stage">
      <Routes>
        <Route path="/" element={<Navigate to="/services" replace />} />
        <Route path="/services" element={<ServicesHome />} />
        <Route path="/services/translate" element={<TranslateScreen />} />
        <Route path="*" element={<Navigate to="/services" replace />} />
      </Routes>
    </div>
  )
}
