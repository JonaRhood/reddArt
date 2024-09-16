// features/gallery/gallerySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GalleryState {
  posts: any[];  // Cambia el tipo `any[]` a lo que sea apropiado para los datos del post
  after: string | null;
  loading: boolean;
  scrollPosition: number;
  selectedSubReddit: string | null;
}

const initialState: GalleryState = {
  posts: [],
  after: null,
  loading: false,
  scrollPosition: 0,
  selectedSubReddit: null,
};

export const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {
    setPosts(state, action: PayloadAction<any[]>) {
      state.posts = action.payload;
    },
    setLoadMore(state, action: PayloadAction<any[]>) {
      state.posts = [...state.posts, ...action.payload];
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setScrollPosition(state, action: PayloadAction<number>) {
      state.scrollPosition = action.payload;
    },
    setSelectedSubReddit(state, action: PayloadAction<string>) {
      state.selectedSubReddit = action.payload;
    },
    resetGallery(state) {
      state.posts = [];
      state.after = null;
      state.loading = false;
      state.scrollPosition = 0;
    },
  },
});

export const { setPosts, setLoadMore, setLoading, setScrollPosition, setSelectedSubReddit, resetGallery } = gallerySlice.actions;
export default gallerySlice.reducer;

