import {
  OBSOLETE_SEED_CAMPUS_IDS,
  ONDA_REGIONAL_CHURCHES,
  ONDA_SEED_DEMO_MEMBERSHIP_MINISTRY_IDS,
  ONDA_SEED_DEMO_MEMBERSHIP_STATUS,
  ONDA_SEED_DEMO_VOLUNTEER_ID,
  ONDA_SEED_GREETER_ASSIGNMENT,
  ONDA_SEED_MINISTRIES,
  ONDA_SEED_PUBLIC_EVENT,
} from './ondaCampuses';

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

describe('ONDA seed ministries, event, and demo memberships', () => {
  it('places Hospitality, Band, Louvor, Mídia, and Recepção on the regional churches', () => {
    expect(ONDA_SEED_MINISTRIES).toEqual([
      { id: 'seed-ministry-demo', name: 'Hospitality', churchId: 'seed-church-demo' },
      { id: 'seed-ministry-band', name: 'Band', churchId: 'seed-church-demo' },
      { id: 'seed-ministry-norte', name: 'Louvor', churchId: 'seed-church-norte' },
      { id: 'seed-ministry-europa', name: 'Mídia', churchId: 'seed-church-europa' },
      { id: 'seed-ministry-japao', name: 'Recepção', churchId: 'seed-church-japao' },
    ]);
  });

  it('keeps the public event and greeter assignment on Onda Brasil Hospitality', () => {
    expect(ONDA_SEED_PUBLIC_EVENT).toEqual({
      id: 'seed-event-public',
      churchId: 'seed-church-demo',
    });
    expect(ONDA_SEED_GREETER_ASSIGNMENT).toEqual({
      id: 'seed-assignment-public-greeter',
      eventId: 'seed-event-public',
      ministryId: 'seed-ministry-demo',
      volunteerId: 'seed-volunteer-demo',
      roleId: 'seed-role-greeter',
    });
  });

  it('gives the demo volunteer ACTIVE membership in every regional ministry', () => {
    expect(ONDA_SEED_DEMO_VOLUNTEER_ID).toBe('seed-volunteer-demo');
    expect(ONDA_SEED_DEMO_MEMBERSHIP_STATUS).toBe('ACTIVE');
    expect([...ONDA_SEED_DEMO_MEMBERSHIP_MINISTRY_IDS]).toEqual([
      'seed-ministry-demo',
      'seed-ministry-band',
      'seed-ministry-norte',
      'seed-ministry-europa',
      'seed-ministry-japao',
    ]);
  });
});
