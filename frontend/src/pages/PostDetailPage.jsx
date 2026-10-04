import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import useCategoryStore from '../store/categoryStore'

export default function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const { setActiveCategoryId } = useCategoryStore()
  const [post, setPost] = useState(null)
  const [Viewer, setViewer] = useState(null)

  useEffect(() => {
    setPost(null)
    api.get(`/posts/${id}`).then(({ data }) => {
      setPost(data)
      setActiveCategoryId(data.categoryId)
    })
    import('@toast-ui/react-editor').then((mod) => setViewer(() => mod.Viewer))
  }, [id, setActiveCategoryId])

  if (!post) return <div className="max-w-3xl mx-auto px-6 py-8 text-gray-400">불러오는 중...</div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-gray-700">
          ← 뒤로
        </button>
        {token && (
          <button
            onClick={() => navigate(`/posts/${id}/edit`)}
            className="text-sm text-gray-500 hover:text-gray-800 border border-gray-300 px-2 py-1 rounded"
          >
            수정
          </button>
        )}
      </div>

      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h1>
        <div className="text-xs text-gray-400 mb-8">
          {post.categoryName} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
          {!post.isPublic && <span className="ml-2 border border-gray-300 px-1 rounded">비공개</span>}
        </div>

        {Viewer && <Viewer key={post.id} initialValue={post.content} />}
      </div>
    </div>
  )
}
