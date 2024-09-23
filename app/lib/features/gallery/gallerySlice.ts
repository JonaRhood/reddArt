// features/gallery/gallerySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GalleryState {
  posts: any[];
  backgroundPosts: any[];
  after: string | null;
  loading: boolean;
  scrollPosition: number;
  selectedSubReddit: string | null;
  pastSubReddit: string | null,
  zoomedIn: boolean,
}

const initialState: GalleryState = {
  posts: [],
  backgroundPosts: [],
  after: null,
  loading: false,
  scrollPosition: 0,
  selectedSubReddit: null,
  pastSubReddit: null,
  zoomedIn: false,
};

export const gallerySlice = createSlice({
  name: "gallery",
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
    setPastSubReddit(state, action: PayloadAction<string | null>) {
        state.pastSubReddit = action.payload;
    },
    setZoomedIn(state, action: PayloadAction<boolean>) {
        state.zoomedIn = action.payload
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setScrollPosition(state, action: PayloadAction<number>) {
      state.scrollPosition = action.payload;
    },
    resetGallery(state) {
      return { ...initialState }
    },
  },
});

export const { setPosts, setLoadMorePosts, setBackgroundPosts, setLoading, setScrollPosition, setSelectedSubReddit, setPastSubReddit, setZoomedIn, resetGallery } = gallerySlice.actions;
export default gallerySlice.reducer;

