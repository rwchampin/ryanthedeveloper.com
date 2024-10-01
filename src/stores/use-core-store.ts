import { create } from 'zustand';

type CoreStore = {
	isLoading: boolean;
	gpuStatus: string | boolean | null;
	setLoading: (isLoading: boolean) => void;
	toggleLoading: () => void;
	progress: number;
	setProgress: (progress: number) => void;
};

const useCoreStore = create<CoreStore>((set) => ({
	isLoading: true,
	gpuStatus: useDetectGPU(),
	setLoading: (isLoading) => set({ isLoading }),
	toggleLoading: () => set((state) => ({ isLoading: !state.isLoading })),
	progress: 0,
	setProgress: (progress) => set({ progress }),
}));

export default useCoreStore;