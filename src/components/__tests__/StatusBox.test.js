import React from 'react';
import { render } from '@testing-library/react-native';
import StatusBox from '../StatusBox';

describe('StatusBox', () => {
  const baseProps = {
    round: 3,
    currentTime: 6,
    totalTime: 18,
    solved: 2,
    total: 4,
    visible: true,
  };

  it('renders nothing when not visible', () => {
    const { queryByText } = render(<StatusBox {...baseProps} visible={false} />);
    expect(queryByText('Current Game')).toBeNull();
  });

  it('renders default mode values', () => {
    const { getByText } = render(<StatusBox {...baseProps} />);

    expect(getByText('Current Game')).toBeTruthy();
    expect(getByText('Round Time')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
    expect(getByText('Total Time')).toBeTruthy();
  });

  it('renders horizontal mode values', () => {
    const { getByText } = render(<StatusBox {...baseProps} horizontal />);

    expect(getByText('Time')).toBeTruthy();
    expect(getByText('/15s')).toBeTruthy();
    expect(getByText('Total')).toBeTruthy();
  });

  it('renders vertical mode with warning threshold', () => {
    const { getByText } = render(
      <StatusBox {...baseProps} currentTime={12} solved={3} total={3} vertical />
    );

    expect(getByText('Round Time')).toBeTruthy();
    expect(getByText('12/15s')).toBeTruthy();
    expect(getByText('100%')).toBeTruthy();
  });
});
