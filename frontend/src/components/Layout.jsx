import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import Header from './Header'

export default function Layout() {
  const { pathname, search } = useLocation()
  const { token } = useAuthStore()
  const isMain = pathname === '/'

  // 페이지 주소가 바뀔 때만 방문 로그를 한 번 남긴다. (관리자 로그인 상태는 제외)
  useEffect(() => {
    if (token) return
    api.post('/visits', { path: pathname + search }).catch(() => {})
  }, [pathname, search, token])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#060010]">
      <Header />
      <main className={`flex-1 min-h-0 overflow-y-auto ${isMain ? '' : 'bg-white'}`}>
        <Outlet />
      </main>
    </div>
  )
}
