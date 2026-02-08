import { create } from 'zustand';

interface CameraState {
    camera: { x: number; y: number };
    zoom: number;
    setCamera: (camera: { x: number; y: number }) => void;
    setZoom: (zoom: number) => void;
    updateCamera: (params: { x?: number; y?: number; zoom?: number }) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
    camera: { x: 0, y: 0 },
    zoom: 1,
    setCamera: (camera) => set({ camera }),
    setZoom: (zoom) => set({ zoom }),
    updateCamera: (params) => set((state) => ({
        camera: {
            x: params.x !== undefined ? params.x : state.camera.x,
            y: params.y !== undefined ? params.y : state.camera.y
        },
        zoom: params.zoom !== undefined ? params.zoom : state.zoom
    }))
}));
