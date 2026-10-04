import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import useCategoryStore from '../store/categoryStore'
import CategoryTree from './CategoryTree'

// 마우스가 버튼에서 패널로 옮겨가는 사이에 닫히지 않도록 약간 늦게 닫는다.
const CLOSE_DELAY = 200

export default function Header() {
  const [categories, setCategories] = useState([])
  const [open, setOpen] = useState(false)
  const { token, username, logout } = useAuthStore()
  const { activeCategoryId, treeVersion } = useCategoryStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const wrapperRef = useRef(null)
  const closeTimer = useRef(null)
  const hoverOpenedAt = useRef(0)
  const isAdmin = !!token

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data))
  }, [treeVersion])

  // 글 상세 등 다른 페이지로 이동하면 목록을 닫는다.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current)
    if (!open) hoverOpenedAt.current = Date.now()
    setOpen(true)
  }

  // 호버로 막 열린 직후의 클릭은 닫지 않는다. (호버하고 바로 클릭하면 열자마자 닫히는 문제 방지)
  const handleArrowClick = () => {
    if (open && Date.now() - hoverOpenedAt.current < 400) return
    setOpen((v) => !v)
  }

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY)
  }

  return (
    <header className="shrink-0 h-14 px-6 flex items-center justify-end bg-[#060010]">
      <div ref={wrapperRef} className="relative">
        <div className="flex items-center gap-1 text-white">
          <button
            onClick={() => navigate('/')}
            className="text-lg font-bold px-2 py-1 rounded hover:bg-white/10"
          >
            lolog
          </button>
          <button
            onClick={handleArrowClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label="글 목록 열기"
            aria-expanded={open}
            className="p-1 rounded hover:bg-white/10"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={`transition-transform ${open ? 'rotate-180' : ''}`}
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
        </div>

        {open && (
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="absolute right-0 top-full mt-2 z-50 w-80 max-h-[70vh] overflow-y-auto rounded-xl bg-white p-3 shadow-2xl"
          >
            <CategoryTree
              categories={categories}
              selectedId={activeCategoryId}
              onSelect={(node) => navigate(`/?categoryId=${node.id}`)}
              isAdmin={isAdmin}
            />
            {isAdmin && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs space-y-2">
                <button onClick={() => navigate('/admin')} className="block text-gray-500 hover:text-gray-800">
                  관리
                </button>
                <button onClick={logout} className="block text-gray-500 hover:text-gray-800">
                  로그아웃 ({username})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
