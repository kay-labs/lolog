import { useNavigate } from 'react-router-dom'

export default function PostList({ posts, loading }) {
  const navigate = useNavigate()

  if (loading) {
    return <div className="text-gray-400 text-sm p-4">불러오는 중...</div>
  }

  if (!posts || posts.length === 0) {
    return <div className="text-gray-400 text-sm p-4">글이 없습니다.</div>
  }

  return (
    <div className="divide-y divide-gray-100">
      {posts.map((post) => (
        <div
          key={post.id}
          className="p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => navigate(`/posts/${post.id}`)}
        >
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-800">{post.title}</h3>
            {!post.isPublic && (
              <span className="text-xs text-gray-400 border border-gray-300 px-1 rounded">비공개</span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {post.categoryName} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
          </div>
        </div>
      ))}
    </div>
  )
}
