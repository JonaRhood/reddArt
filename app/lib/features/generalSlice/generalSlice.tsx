// features/gallery/gallerySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GalleryState {
  isAuthorized: boolean,
}

const initialState: GalleryState = {
  isAuthorized: false,
};

export const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    setAuthorized(state, action: PayloadAction<boolean>) {
      state.isAuthorized = action.payload;
    },
  }
});

export const {
  setAuthorized,
} = generalSlice.actions;
export default generalSlice.reducer;

