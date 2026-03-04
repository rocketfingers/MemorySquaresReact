import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHistory } from '../useHistory';

const mockOrder = jest.fn();
const mockEqSelect = jest.fn(() => ({ order: mockOrder }));
const mockSelect = jest.fn(() => ({ eq: mockEqSelect }));
const mockInsert = jest.fn();
const mockEqDelete = jest.fn();
const mockDelete = jest.fn(() => ({ eq: mockEqDelete }));
const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
}));

const mockUnsubscribe = jest.fn();
const mockChannelObject = {
  on: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: mockUnsubscribe,
};
mockChannelObject.on.mockReturnValue(mockChannelObject);
mockChannelObject.subscribe.mockReturnValue(mockChannelObject);
const mockChannel = jest.fn(() => mockChannelObject);

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
    channel: (...args) => mockChannel(...args),
  },
}));

describe('useHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrder.mockResolvedValue({ data: [], error: null });
    mockInsert.mockResolvedValue({ data: null, error: null });
    mockEqDelete.mockResolvedValue({ data: null, error: null });
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  it('loads guest history from AsyncStorage', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify([{ round: 2, time: 8, total_game_time: 12, result: 1 }])
    );

    const { result } = renderHook(() => useHistory(null));

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });

    expect(result.current.history[0].round).toBe(2);
  });

  it('adds and clears guest history locally', async () => {
    const { result } = renderHook(() => useHistory(null));

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('gameHistory');
    });

    await act(async () => {
      await result.current.addGameToHistory(3, 9, 21, 1);
    });

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });
    expect(AsyncStorage.setItem).toHaveBeenCalled();

    await act(async () => {
      await result.current.clearGameHistory();
    });

    expect(result.current.history).toEqual([]);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('gameHistory');
  });

  it('loads and writes cloud history for authenticated users', async () => {
    mockOrder.mockResolvedValueOnce({
      data: [{ id: 'a', user_id: 'u1', round: 4, time: 11, total_game_time: 32, result: 0 }],
      error: null,
    });

    const user = { id: 'u1' };
    const { result } = renderHook(() => useHistory(user));

    await waitFor(() => {
      expect(result.current.history).toHaveLength(1);
    });

    expect(mockFrom).toHaveBeenCalledWith('games_history');
    expect(mockChannel).toHaveBeenCalledWith('games_history_changes');

    await act(async () => {
      await result.current.addGameToHistory(5, 10, 40, 1);
    });

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'u1',
      round: 5,
      time: 10,
      total_game_time: 40,
      result: 1,
    });

    await act(async () => {
      await result.current.clearGameHistory();
    });

    expect(mockDelete).toHaveBeenCalled();
    expect(mockEqDelete).toHaveBeenCalledWith('user_id', 'u1');
  });
});
