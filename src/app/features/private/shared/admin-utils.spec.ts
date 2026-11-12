import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage, matchesSearch, memberName, parseIsoDate, splitLines, toIsoDate } from './admin-utils';

describe('admin-utils', () => {
  it('converts backend LocalDate strings both ways without timezone shift', () => {
    const date = parseIsoDate('2027-12-31');
    expect(date?.getFullYear()).toBe(2027);
    expect(date?.getMonth()).toBe(11);
    expect(date?.getDate()).toBe(31);
    expect(toIsoDate(date)).toBe('2027-12-31');
    expect(parseIsoDate(null)).toBeNull();
    expect(toIsoDate(null)).toBeNull();
  });

  it('splits textarea content into clean lines', () => {
    expect(splitLines(' A. Author \n\nB. Author; C. Author ')).toEqual(['A. Author', 'B. Author', 'C. Author']);
    expect(splitLines(undefined)).toEqual([]);
  });

  it('searches without case or accents', () => {
    expect(matchesSearch('energetique', 'Énergétique solaire')).toBe(true);
    expect(matchesSearch('LARESI', null, 'LaRESI')).toBe(true);
    expect(matchesSearch('xyz', 'abc')).toBe(false);
    expect(matchesSearch('', 'anything')).toBe(true);
  });

  it('builds member display names', () => {
    expect(memberName({ firstName: 'Allaoui', lastName: 'Rabha' })).toBe('Allaoui Rabha');
    expect(memberName(null)).toBe('');
  });

  it('turns API errors into readable messages', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 403 }))).toContain('droits');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 0 }))).toBe('Serveur injoignable.');
    expect(apiErrorMessage(new HttpErrorResponse({
      status: 400,
      error: { message: 'Validation failed', errors: { title: 'must not be blank' } }
    }))).toBe('title : must not be blank');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 409, error: { message: 'Lab LaRESI is not empty' } })))
      .toBe('Lab LaRESI is not empty');
    expect(apiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });
});
