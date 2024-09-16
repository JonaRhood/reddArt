// features/gallery/gallerySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GalleryState {
  posts: any[];  // Cambia el tipo `any[]` a lo que sea apropiado para los datos del post
  after: string | null;
  loading: boolean;
  scrollPosition: number;
}

const initialState: GalleryState = {
  posts: [],
  after: null,
  loading: false,
  scrollPosition: 0,
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
    resetGallery(state) {
      state.posts = [];
      state.after = null;
      state.loading = false;
      state.scrollPosition = 0;
    },
  },
});

export const { setPosts, setLoadMore, setLoading, setScrollPosition, resetGallery } = gallerySlice.actions;
export default gallerySlice.reducer;

