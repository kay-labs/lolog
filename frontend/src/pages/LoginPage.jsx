import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', { username, password })
      login(data.token, data.username)
      navigate('/')
    } catch {
      setError('아이디 또는 비밀번호가 틀렸습니다.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8 w-80 space-y-4">
        <h1 className="text-xl font-bold text-center text-gray-800">lolog</h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-gray-800 text-white py-2 rounded text-sm hover:bg-gray-700 transition"
        >
          로그인
        </button>
      </form>
    </div>
  )
}
