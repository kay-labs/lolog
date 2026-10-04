import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import useCategoryStore from '../store/categoryStore'
import FlexCarousel from '../components/FlexCarousel'
import { createPostCardImage } from '../utils/postCardImage'

function findCategoryById(nodes, id) {
  for (const node of nodes) {
    if (String(node.id) === String(id)) return node
    if (node.children) {
      const found = findCategoryById(node.children, id)
      if (found) return found
    }
  }
  return null
}

export default function MainPage() {
  const [categories, setCategories] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setActiveCategoryId } = useCategoryStore()
  const isAdmin = !!token

  const categoryId = searchParams.get('categoryId')
  const selectedCategory = useMemo(
      () => (categoryId ? findCategoryById(categories, categoryId) : null),
      [categories, categoryId]
  )

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data))
  }, [])

  useEffect(() => {
    setActiveCategoryId(categoryId)
  }, [categoryId, setActiveCategoryId])

  useEffect(() => {
    setLoading(true)
    // 카테고리가 없으면 전체 글을 최신순으로 조회
    const params = categoryId ? { categoryId } : { sort: 'createdAt,desc', size: 30 }
    api.get('/posts', { params })
        .then(({ data }) => setPosts(data.content))
        .catch(() => setPosts([]))
        .finally(() => setLoading(false))
  }, [categoryId])

  const items = useMemo(
      () => posts.map((post) => ({
        src: createPostCardImage(post),
        alt: post.title,
        title: post.title,
        subtitle: `${post.categoryName} · ${new Date(post.createdAt).toLocaleDateString('ko-KR')}`,
        postId: post.id,
      })),
      [posts]
  )

  const canWrite = isAdmin && selectedCategory?.postAllowed

  return (
      <div className="relative h-full flex flex-col">
        {canWrite && (
            <div className="absolute top-4 right-4 z-10">
              <button
                  onClick={() => navigate(`/posts/new?categoryId=${categoryId}`)}
                  className="text-sm bg-white/10 text-white px-3 py-1 rounded hover:bg-white/20"
              >
                + 글쓰기
              </button>
            </div>
        )}

        {loading ? (
            <div className="m-auto text-gray-500 text-sm">불러오는 중...</div>
        ) : items.length === 0 ? (
            <div className="m-auto text-gray-500 text-sm">글이 없습니다.</div>
        ) : (
            <FlexCarousel
                key={categoryId ?? 'all'}
                items={items}
                fit="portrait"
                radius={12}
                // 기본 preset(liquid)은 휘어짐이 강해 글자가 일그러지므로 효과를 약하게 줄인다.
                preset="ribbon"
                bend={0.08}
                dispersion={0}
                squeeze={0.05}
                focusOnClick={false}
                className="flex-1 text-white"
                onSelect={(_, item) => navigate(`/posts/${item.postId}`)}
            />
        )}

        {selectedCategory && (
            <div className="absolute top-4 left-6 z-10 text-sm font-mono text-gray-500">// {selectedCategory.name}</div>
        )}
      </div>
  )
}
