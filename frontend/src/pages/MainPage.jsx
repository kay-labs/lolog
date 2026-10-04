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

// 카테고리 트리를 위에서부터 순서대로 펼쳐 { categoryId: 순번 } 맵을 만든다. (드롭다운 목록과 같은 순서)
function buildCategoryOrder(nodes, order = new Map()) {
  for (const node of nodes) {
    order.set(node.id, order.size)
    if (node.children) buildCategoryOrder(node.children, order)
  }
  return order
}

export default function MainPage() {
  const [categories, setCategories] = useState([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)
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
    api.get('/categories')
        .then(({ data }) => setCategories(data))
        .finally(() => setCategoriesLoaded(true))
  }, [])

  useEffect(() => {
    setActiveCategoryId(categoryId)
  }, [categoryId, setActiveCategoryId])

  useEffect(() => {
    setLoading(true)
    // 카테고리가 없으면 전체 글을 조회 (순서는 아래에서 카테고리 순서대로 다시 정렬)
    const params = categoryId ? { categoryId, size: 200 } : { size: 200 }
    api.get('/posts', { params })
        .then(({ data }) => setPosts(data.content))
        .catch(() => setPosts([]))
        .finally(() => setLoading(false))
  }, [categoryId])

  // 카드 순서: 카테고리 트리 순서 → 카테고리 안의 글 순서(sortOrder)
  const sortedPosts = useMemo(() => {
    const categoryOrder = buildCategoryOrder(categories)
    const rank = (post) => categoryOrder.get(post.categoryId) ?? Number.MAX_SAFE_INTEGER
    return [...posts].sort((a, b) => rank(a) - rank(b) || a.sortOrder - b.sortOrder)
  }, [posts, categories])

  const items = useMemo(
      () => sortedPosts.map((post) => ({
        src: createPostCardImage(post),
        alt: post.title,
        title: post.title,
        subtitle: `${post.categoryName} · ${new Date(post.createdAt).toLocaleDateString('ko-KR')}`,
        postId: post.id,
      })),
      [sortedPosts]
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

        {loading || !categoriesLoaded ? (
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
