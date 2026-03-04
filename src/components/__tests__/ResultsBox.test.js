import React from 'react';
import { render } from '@testing-library/react-native';
import ResultsBox from '../ResultsBox';
import { gameResults } from '../../constants/gameResult';

const sampleHistory = [
  { round: 3, time: 10, result: gameResults.WIN },
  { round: 5, time: 12, result: gameResults.LOSE },
  { round: 4, time: 8, result: gameResults.WIN },
];

describe('ResultsBox', () => {
  it('renders nothing when not visible', () => {
    const { queryByText } = render(<ResultsBox history={sampleHistory} visible={false} />);
    expect(queryByText('Your Stats')).toBeNull();
  });

  it('renders computed stats in vertical mode', () => {
    const { getByText } = render(<ResultsBox history={sampleHistory} visible />);

    expect(getByText('Your Stats')).toBeTruthy();
    expect(getByText('Max Round')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('10.0s')).toBeTruthy();
    expect(getByText('67%')).toBeTruthy();
  });

  it('renders compact tile labels in horizontal mode', () => {
    const { getByText } = render(<ResultsBox history={sampleHistory} visible horizontal />);

    expect(getByText('Win Rate')).toBeTruthy();
    expect(getByText('Wins')).toBeTruthy();
    expect(getByText('Losses')).toBeTruthy();
  });
});
