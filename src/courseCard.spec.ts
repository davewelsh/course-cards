import { courseCard } from './courseCard';

describe('courseCard', () => {

  it('should be a function', () => {
    expect(typeof courseCard).toBe('function');
  });

  it('should return a course card', async () => {
    await expect(courseCard('MZ', 'CA', 'ON')).resolves.toBeDefined();
  });
});
