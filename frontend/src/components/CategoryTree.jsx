import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useCategoryStore from '../store/categoryStore'

function CategoryNode({ node, selectedId, onSelect, isAdmin, dragProps }) {
  const [open, setOpen] = useState(true)
  const [posts, setPosts] = useState([])
  const dragIndex = useRef(null)
  const navigate = useNavigate()
  const { treeVersion } = useCategoryStore()
  const hasChildren = node.children && node.children.length > 0
  const hasPosts = node.postAllowed && posts.length > 0
  const isExpandable = hasChildren || hasPosts

  const loadPosts = () => {
    if (!node.postAllowed) return
    api.get('/posts', { params: { categoryId: node.id, size: 200, sort: 'sortOrder,asc' } })
      .then(({ data }) => setPosts(data.content))
  }

  useEffect(loadPosts, [node.id, node.postAllowed, treeVersion])

  const handleDrop = (dropIndex) => {
    const from = dragIndex.current
    dragIndex.current = null
    if (from === null || from === dropIndex) return

    // 드래그 이벤트 처리 도중 window.confirm()을 바로 띄우면 브라우저의
    // 네이티브 드래그 제스처가 깔끔히 종료되지 못해 이후 클릭이 씹히는 경우가 있어,
    // 드롭 처리가 끝난 다음 tick으로 confirm을 미룬다.
    setTimeout(() => {
      if (!window.confirm('글 순서를 변경하시겠습니까?')) return

      const reordered = [...posts]
      const [moved] = reordered.splice(from, 1)
      reordered.splice(dropIndex, 0, moved)

      api.patch('/posts/reorder', reordered.map((p) => p.id))
        .then(loadPosts)
        .catch(() => alert('순서 변경에 실패했습니다.'))
    }, 0)
  }

  return (
    <div>
      <div
        {...dragProps}
        className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 text-sm
          ${String(selectedId) === String(node.id) ? 'bg-gray-200 font-semibold' : ''}
          ${node.postAllowed ? 'text-gray-800' : 'text-gray-500 font-medium'}
          ${dragProps ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onClick={() => {
          onSelect(node)
          if (isExpandable) setOpen(!open)
        }}
      >
        {isExpandable && (
          <span className="text-xs text-gray-400">{open ? '▾' : '▸'}</span>
        )}
        {!isExpandable && <span className="w-3" />}
        <span>{node.name}</span>
      </div>

      {open && (
        <div className="pl-4">
          {hasChildren && (
            <CategoryNodeList
              nodes={node.children}
              selectedId={selectedId}
              onSelect={onSelect}
              isAdmin={isAdmin}
            />
          )}
          {hasPosts && posts.map((post, index) => (
            <div
              key={post.id}
              draggable={isAdmin}
              onDragStart={() => { dragIndex.current = index }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              onClick={() => navigate(`/posts/${post.id}`)}
              className={`px-2 py-1 rounded cursor-pointer hover:bg-gray-100 text-xs text-gray-500 truncate
                ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''}`}
            >
              {index + 1}. {post.title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryNodeList({ nodes, selectedId, onSelect, isAdmin }) {
  const dragIndex = useRef(null)
  const { triggerRefresh } = useCategoryStore()

  const handleDrop = (dropIndex) => {
    const from = dragIndex.current
    dragIndex.current = null
    if (from === null || from === dropIndex) return

    setTimeout(() => {
      if (!window.confirm('카테고리 순서를 변경하시겠습니까?')) return

      const reordered = [...nodes]
      const [moved] = reordered.splice(from, 1)
      reordered.splice(dropIndex, 0, moved)

      api.patch('/categories/reorder', reordered.map((n) => n.id))
        .then(triggerRefresh)
        .catch(() => alert('순서 변경에 실패했습니다.'))
    }, 0)
  }

  return (
    <div className="space-y-1">
      {nodes.map((node, index) => (
        <CategoryNode
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
          isAdmin={isAdmin}
          dragProps={isAdmin ? {
            draggable: true,
            onDragStart: () => { dragIndex.current = index },
            onDragOver: (e) => e.preventDefault(),
            onDrop: () => handleDrop(index),
          } : undefined}
        />
      ))}
    </div>
  )
}

export default function CategoryTree({ categories, selectedId, onSelect, isAdmin }) {
  return (
    <CategoryNodeList nodes={categories} selectedId={selectedId} onSelect={onSelect} isAdmin={isAdmin} />
  )
}
