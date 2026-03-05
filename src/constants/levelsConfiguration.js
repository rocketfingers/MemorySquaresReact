const generateLevels = () => {
  const levels = [];

  const pushBlock = (count, columns, rotateEvery = 0) => {
    for (let i = 0; i < count; i++) {
      const round = levels.length + 1;
      const rotate = rotateEvery > 0 && round % rotateEvery === 0;
      levels.push({ columns, rotate });
    }
  };

  // Easier progression curve:
  // - more rounds on smaller boards
  // - rotation appears later and less frequently
  pushBlock(12, 3, 0);  // rounds 1-12
  pushBlock(16, 4, 8);  // rounds 13-28
  pushBlock(24, 5, 6);  // rounds 29-52
  pushBlock(72, 6, 5);  // rounds 53-124

  return levels;
};

export const levelsConfiguration = generateLevels();
