// features/gallery/gallerySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GalleryState {
  isMobile: boolean,
  clickedNav: boolean,
}

const initialState: GalleryState = {
  isMobile: false,
  clickedNav: false,
};

export const mobileSlice = createSlice({
  name: "mobile",
  initialState,
  reducers: {
    setIsMobile(state, action: PayloadAction<boolean>) {
      state.isMobile = action.payload;
    },
    setClickedNav(state, action: PayloadAction<boolean>) {
      state.clickedNav = action.payload;
    },
  },
});

export const { 
  setIsMobile, setClickedNav
} = mobileSlice.actions;
export default mobileSlice.reducer;

