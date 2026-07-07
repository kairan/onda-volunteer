import { ONDA_REGIONAL_CHURCHES } from './ondaCampuses';

describe('ONDA_REGIONAL_CHURCHES', () => {
  it('keeps the regional campus catalog aligned with ondadura.com.br', () => {
    expect(ONDA_REGIONAL_CHURCHES.map((church) => church.name)).toEqual([
      'Onda Brasil',
      'Onda USA',
      'Onda Europa',
    ]);
    expect(ONDA_REGIONAL_CHURCHES.map((church) => church.campuses.length)).toEqual([
      18, 2, 4,
    ]);
  });

  it('uses unique campus ids across all regional churches', () => {
    const campusIds = ONDA_REGIONAL_CHURCHES.flatMap((church) =>
      church.campuses.map((campus) => campus.id),
    );
    expect(new Set(campusIds).size).toBe(campusIds.length);
  });
});
