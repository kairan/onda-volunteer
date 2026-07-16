import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const assignmentCardSrc = readFileSync(
  join(process.cwd(), 'src/components/AssignmentCard.tsx'),
  'utf8',
);

describe('AssignmentCard brand flourish contract', () => {
  it('does not use glass/backdrop-blur on assignment cards (BB-FLR-01 AC4)', () => {
    expect(assignmentCardSrc).not.toMatch(/backdrop-blur/);
    expect(assignmentCardSrc).not.toMatch(/supports-\[backdrop-filter\]/);
  });
});
