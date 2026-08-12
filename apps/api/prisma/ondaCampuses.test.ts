import { OBSOLETE_SEED_CAMPUS_IDS, ONDA_REGIONAL_CHURCHES } from './ondaCampuses';

describe('ONDA_REGIONAL_CHURCHES', () => {
  it('keeps the regional campus catalog aligned with ondadura.com.br', () => {
    expect(ONDA_REGIONAL_CHURCHES.map((church) => church.name)).toEqual([
      'Onda Brasil',
      'Onda USA',
      'Onda Europa',
      'Onda Japão',
    ]);
    expect(ONDA_REGIONAL_CHURCHES.map((church) => church.campuses.length)).toEqual([
      18, 2, 4, 1,
    ]);
    expect(ONDA_REGIONAL_CHURCHES[0]?.campuses.map((campus) => campus.name)).toEqual([
      'Joinville',
      'Av. Paulista',
      'Mooca',
      'Guarulhos',
      'Bauru',
      'Belo Horizonte',
      'Blumenau',
      'Cabo Frio',
      'Campinas',
      'Caxias do Sul',
      'Curitiba',
      'Florianópolis',
      'Itajaí',
      'Jaraguá do Sul',
      'Macapá',
      'Machado',
      'Porto Alegre',
      'Recife',
    ]);
    expect(ONDA_REGIONAL_CHURCHES[1]?.campuses.map((campus) => campus.name)).toEqual([
      'Charlotte',
      'Chicago',
    ]);
    expect(ONDA_REGIONAL_CHURCHES[2]?.campuses.map((campus) => campus.name)).toEqual([
      'Porto',
      'Sines',
      'Mallorca',
      'Londres',
    ]);
    expect(ONDA_REGIONAL_CHURCHES[3]?.campuses.map((campus) => campus.name)).toEqual([
      'Hamamatsu',
    ]);
  });

  it('uses unique campus ids across all regional churches', () => {
    const campusIds = ONDA_REGIONAL_CHURCHES.flatMap((church) =>
      church.campuses.map((campus) => campus.id),
    );
    expect(new Set(campusIds).size).toBe(campusIds.length);
  });

  it('retains legacy church ids for Brasil and USA', () => {
    expect(ONDA_REGIONAL_CHURCHES.map((church) => church.id)).toEqual([
      'seed-church-demo',
      'seed-church-norte',
      'seed-church-europa',
      'seed-church-japao',
    ]);
  });

  it('lists obsolete fake campus ids for re-seed cleanup', () => {
    expect([...OBSOLETE_SEED_CAMPUS_IDS]).toEqual([
      'seed-campus-central-sede',
      'seed-campus-central-sul',
      'seed-campus-norte-unico',
    ]);
  });
});
