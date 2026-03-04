import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GameWonDialog from '../GameWonDialog';

describe('GameWonDialog', () => {
  it('shows content and triggers callbacks', () => {
    const onNextLevel = jest.fn();
    const onRestart = jest.fn();
    const onGoToMenu = jest.fn();

    const { getByText } = render(
      <GameWonDialog
        visible
        columns={6}
        onNextLevel={onNextLevel}
        onRestart={onRestart}
        onGoToMenu={onGoToMenu}
      />
    );

    expect(getByText('Victory!')).toBeTruthy();
    fireEvent.press(getByText('→ Next Level'));
    fireEvent.press(getByText('↺ Restart'));
    fireEvent.press(getByText('⌂ Menu'));

    expect(onNextLevel).toHaveBeenCalledTimes(1);
    expect(onRestart).toHaveBeenCalledTimes(1);
    expect(onGoToMenu).toHaveBeenCalledTimes(1);
  });

  it('hides next level button for max columns', () => {
    const { queryByText } = render(
      <GameWonDialog
        visible
        columns={7}
        onNextLevel={jest.fn()}
        onRestart={jest.fn()}
        onGoToMenu={jest.fn()}
      />
    );

    expect(queryByText('→ Next Level')).toBeNull();
  });
});
