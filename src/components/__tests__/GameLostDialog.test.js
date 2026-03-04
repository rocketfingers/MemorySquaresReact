import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GameLostDialog from '../GameLostDialog';
import { typeOfLost } from '../../constants/gameConstants';

describe('GameLostDialog', () => {
  it('shows wrong-move content and button handlers', () => {
    const onRestart = jest.fn();
    const onGoToMenu = jest.fn();

    const { getByText } = render(
      <GameLostDialog
        visible
        reason={typeOfLost.WRONG_CLICKED}
        onRestart={onRestart}
        onGoToMenu={onGoToMenu}
      />
    );

    expect(getByText('Wrong Move')).toBeTruthy();
    fireEvent.press(getByText('↺ Try Again'));
    fireEvent.press(getByText('⌂ Return to Menu'));

    expect(onRestart).toHaveBeenCalledTimes(1);
    expect(onGoToMenu).toHaveBeenCalledTimes(1);
  });

  it('shows timeout text when reason is timeout', () => {
    const { getByText } = render(
      <GameLostDialog
        visible
        reason={typeOfLost.TIME_OUT}
        onRestart={jest.fn()}
        onGoToMenu={jest.fn()}
      />
    );

    expect(getByText("Time's Up!")).toBeTruthy();
  });
});
