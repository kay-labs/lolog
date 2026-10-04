import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useCategoryStore from '../store/categoryStore'

function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [postsByCategory, setPostsByCategory] = useState({})
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [postAllowed, setPostAllowed] = useState(false)
  const { triggerRefresh } = useCategoryStore()

  const flattenCategories = (nodes, depth = 0) => {
    return nodes.flatMap((n) => [
      { ...n, depth },
      ...flattenCategories(n.children || [], depth + 1),
    ])
  }

  const load = () => api.get('/categories').then(({ data }) => setCategories(data))

  useEffect(() => { load() }, [])

  const flat = flattenCategories(categories)

  useEffect(() => {
    flat.filter((c) => c.postAllowed).forEach((c) => {
      api.get('/posts', { params: { categoryId: c.id, size: 200, sort: 'sortOrder,asc' } })
        .then(({ data }) => setPostsByCategory((prev) => ({ ...prev, [c.id]: data.content })))
    })
  }, [categories]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    if (!name.trim()) return
    await api.post('/categories', {
      name,
      parentId: parentId ? Number(parentId) : null,
      postAllowed,
    })
    setName('')
    setParentId('')
    setPostAllowed(false)
    load()
    triggerRefresh()
  }

  const handleDelete = async (id) => {
    if (!confirm('삭제하면 하위 카테고리도 삭제됩니다. 계속할까요?')) return
    await api.delete(`/categories/${id}`)
    load()
    triggerRefresh()
  }

  const handleDeletePost = async (postId, categoryId) => {
    if (!confirm('이 글을 삭제하시겠습니까?')) return
    await api.delete(`/posts/${postId}`)
    triggerRefresh()
    setPostsByCategory((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId].filter((p) => p.id !== postId),
    }))
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-700">카테고리 관리</h2>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          placeholder="카테고리명"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
        >
          <option value="">루트</option>
          {flat.map((c) => (
            <option key={c.id} value={c.id}>
              {'—'.repeat(c.depth)} {c.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={postAllowed} onChange={(e) => setPostAllowed(e.target.checked)} />
          글 작성 허용
        </label>
        <button
          onClick={handleCreate}
          className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
        >
          추가
        </button>
      </div>

      <div className="border rounded divide-y">
        {flat.map((c) => (
          <div key={c.id}>
            <div className="flex items-center justify-between px-3 py-2 text-sm">
              <span style={{ paddingLeft: `${c.depth * 16}px` }}>
                {c.name}
                {c.postAllowed && <span className="ml-2 text-xs text-blue-500">글허용</span>}
              </span>
              <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 text-xs">
                삭제
              </button>
            </div>
            {c.postAllowed && (postsByCategory[c.id] || []).map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between px-3 py-1 text-xs text-gray-500 bg-gray-50"
                style={{ paddingLeft: `${c.depth * 16 + 20}px` }}
              >
                <span className="truncate">· {post.title}</span>
                <button onClick={() => handleDeletePost(post.id, c.id)} className="text-red-300 hover:text-red-600">
                  삭제
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function VisitLogViewer() {
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    api.get('/admin/visit-logs', { params: { page, size: 50 } }).then(({ data }) => {
      setLogs(data.content)
      setTotalPages(data.totalPages)
    })
  }, [page])

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-700">방문 로그</h2>
      <div className="border rounded overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">IP</th>
              <th className="p-2 text-left">경로</th>
              <th className="p-2 text-left">시간</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="p-2">{log.ip}</td>
                <td className="p-2">{log.path}</td>
                <td className="p-2">{new Date(log.visitedAt).toLocaleString('ko-KR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 justify-center">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`px-2 py-1 text-xs rounded border ${page === i ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('category')

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">관리자</h1>
        <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-gray-700">
          ← 메인
        </button>
      </div>

      <div className="flex gap-4 border-b pb-2">
        {['category', 'visitlog'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm pb-1 ${tab === t ? 'border-b-2 border-gray-800 font-semibold' : 'text-gray-400'}`}
          >
            {t === 'category' ? '카테고리' : '방문 로그'}
          </button>
        ))}
      </div>

      {tab === 'category' && <CategoryManager />}
      {tab === 'visitlog' && <VisitLogViewer />}
    </div>
  )
}
