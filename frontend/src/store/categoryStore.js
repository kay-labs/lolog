import { create } from 'zustand'

const useCategoryStore = create((set) => ({
  activeCategoryId: null,
  setActiveCategoryId: (id) => set({ activeCategoryId: id != null ? String(id) : null }),
  activePostId: null,
  setActivePostId: (id) => set({ activePostId: id != null ? String(id) : null }),
  treeVersion: 0,
  triggerRefresh: () => set((s) => ({ treeVersion: s.treeVersion + 1 })),
}))

export default useCategoryStore
