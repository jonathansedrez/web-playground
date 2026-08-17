import { readFileSync } from 'fs';
import { resolve } from 'path';

const css = () => readFileSync(resolve(__dirname, '../src/styles/main.css'), 'utf-8');

describe('main.css', () => {
  it('matches snapshot', () => {
    expect(css()).toMatchSnapshot();
  });
});
