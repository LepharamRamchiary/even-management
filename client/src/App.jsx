import { Route, Routes } from 'react-router-dom'
import Feed from './pages/Feed/Feed'
import NotFound from "./pages/NotFound"

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
