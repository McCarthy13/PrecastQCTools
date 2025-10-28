import { create } from 'zustand';
import { RootStackParamList } from '@/navigation/types';

type ScreenName = keyof RootStackParamList;

type ScreenStackItem = {
  name: ScreenName;
  params: RootStackParamList[ScreenName] | undefined;
};

interface NavigationState {
  stack: ScreenStackItem[];
  current: ScreenStackItem;
  push: <T extends ScreenName>(name: T, params?: RootStackParamList[T]) => void;
  replace: <T extends ScreenName>(name: T, params?: RootStackParamList[T]) => void;
  back: () => void;
  reset: <T extends ScreenName>(name: T, params?: RootStackParamList[T]) => void;
}

const initialScreen: ScreenStackItem = { name: 'Dashboard', params: undefined };

export const useNavigationStore = create<NavigationState>((set) => ({
  stack: [initialScreen],
  current: initialScreen,
  push: (name, params) =>
    set((state) => {
      const nextStack = [...state.stack, { name, params }];
      return {
        stack: nextStack,
        current: nextStack[nextStack.length - 1],
      };
    }),
  replace: (name, params) =>
    set((state) => {
      const nextStack = state.stack.slice(0, -1).concat({ name, params });
      const safeStack = nextStack.length > 0 ? nextStack : [initialScreen];
      return {
        stack: safeStack,
        current: safeStack[safeStack.length - 1],
      };
    }),
  back: () =>
    set((state) => {
      if (state.stack.length <= 1) {
        return state;
      }
      const nextStack = state.stack.slice(0, -1);
      return {
        stack: nextStack,
        current: nextStack[nextStack.length - 1] ?? initialScreen,
      };
    }),
  reset: (name, params) =>
    set(() => {
      const nextStack = [{ name, params }];
      return {
        stack: nextStack,
        current: nextStack[0],
      };
    }),
}));
