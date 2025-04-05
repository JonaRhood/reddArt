// features/gallery/gallerySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GalleryState {
  posts: any[];
  backgroundPosts: any[];
  after: string | null;
  loading: boolean;
  scrollPosition: number;
  selectedSubReddit: string | null;
}

const initialState: GalleryState = {
  posts: [],
  backgroundPosts: [],
  after: null,
  loading: false,
  scrollPosition: 0,
  selectedSubReddit: null,
};

export const userGallerySlice = createSlice({
  name: "userGallery",
  initialState,
  reducers: {
    setPosts(state, action: PayloadAction<any[]>) {
      state.posts = action.payload;
    },
    setLoadMorePosts(state) {
      state.posts = [...state.posts, ...state.backgroundPosts];
    },
    setBackgroundPosts(state, action: PayloadAction<any[]>) {
      state.backgroundPosts = action.payload;
    },
    setSelectedSubReddit(state, action: PayloadAction<string | null>) {
        state.selectedSubReddit = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setScrollPosition(state, action: PayloadAction<number>) {
      state.scrollPosition = action.payload;
    },
    stopGalleryLoading(state) {
      state.posts = [];  // Vaciamos los posts de inmediato
      state.backgroundPosts = [];  // También vaciamos los backgroundPosts
      state.loading = false;  // Detenemos cualquier estado de carga
    },
    resetGallery(state) {
      return { ...initialState }
    },
  },
});

export const { setPosts, setLoadMorePosts, setBackgroundPosts, setLoading, setScrollPosition, setSelectedSubReddit, 
  stopGalleryLoading, resetGallery } = userGallerySlice.actions;
export default userGallerySlice.reducer;

