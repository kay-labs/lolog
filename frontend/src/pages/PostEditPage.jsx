import { useEffect, useRef, useState } from 'react' // useState: 상태값 저장, useEffect: 화면 처음 로드될 때 실행, useRef: 에디터 객체 직접 접근
import { useNavigate, useParams, useSearchParams } from 'react-router-dom' // useNavigate: 페이지 이동, useParams: URL 파라미터 가져오기, useSearchParams: 쿼리 스트링 읽기
import api from '../api/axios'
import useCategoryStore from '../store/categoryStore'
import '@toast-ui/editor/dist/toastui-editor.css'

export default function PostEditPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const editorRef = useRef(null)
  const { setActiveCategoryId } = useCategoryStore()

  const [title, setTitle] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '')
  const [content, setContent] = useState('')
  const [Editor, setEditor] = useState(null)
  const [ready, setReady] = useState(false)
  const isEdit = !!id

  useEffect(() => {
    const loadEditor = import('@toast-ui/react-editor').then((mod) => setEditor(() => mod.Editor))

    if (isEdit) {
      api.get(`/posts/${id}`).then(({ data }) => {
        setTitle(data.title)
        setIsPublic(data.isPublic)
        setCategoryId(data.categoryId)
        setContent(data.content)
        loadEditor.then(() => setReady(true))
      })
    } else {
      loadEditor.then(() => setReady(true))
    }
  }, [id, isEdit])

  useEffect(() => {
    if (ready && isEdit && editorRef.current) {
      editorRef.current.getInstance().setMarkdown(content)
    }
  }, [ready])

  useEffect(() => {
    setActiveCategoryId(categoryId)
  }, [categoryId, setActiveCategoryId])

  const handleSubmit = async () => {
    const content = editorRef.current?.getInstance().getMarkdown() || ''
    const payload = { title, content, categoryId: Number(categoryId), isPublic }

    if (isEdit) {
      await api.put(`/posts/${id}`, payload)
      navigate(`/posts/${id}`, { replace: true })
    } else {
      const { data } = await api.post('/posts', payload)
      navigate(`/posts/${data.id}`, { replace: true })
    }
  }

  return (
    <div className="w-full p-8 space-y-4">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-gray-700">
          ← 뒤로
        </button>
      </div>
      <input
        className="w-full text-2xl font-bold border-b border-gray-200 pb-2 focus:outline-none"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          공개
        </label>
      </div>

      {Editor && ready && (
        <Editor
          ref={editorRef}
          initialValue={content}
          initialEditType="markdown"
          previewStyle="vertical"
          height="500px"
          useCommandShortcut
        />
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 text-sm"
        >
          {isEdit ? '수정' : '저장'}
        </button>
      </div>
    </div>
  )
}
