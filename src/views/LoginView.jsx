import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Lock } from 'lucide-react'
import '../App.css'

const ADMIN_PASSWORD = 'acar2026'

export default function LoginView() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin-auth', 'true')
      navigate('/admin')
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <main className="login-view">
      <div className="login-glass">
        <div className="login-lock-icon">
          <Lock size={24} />
        </div>
        <h1>Programa ACAR Sabatino</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Contrasena
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la contrasena"
            />
          </label>
          {error && <div className="status error">Contrasena incorrecta</div>}
          <button className="primary" type="submit">
            <LogIn size={18} />
            Ingresar
          </button>
        </form>
      </div>
    </main>
  )
}