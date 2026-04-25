const { annotate, getAnnotation, getAllAnnotations, removeAnnotation, reset } = require('./annotations');

beforeEach(() => reset());

describe('annotate', () => {
  it('stores an annotation for a route', () => {
    annotate('GET', '/api/users', 'Returns all users');
    const ann = getAnnotation('GET', '/api/users');
    expect(ann).not.toBeNull();
    expect(ann.note).toBe('Returns all users');
    expect(ann.method).toBe('GET');
    expect(ann.path).toBe('/api/users');
  });

  it('normalizes method to uppercase', () => {
    annotate('post', '/api/items', 'Create item');
    const ann = getAnnotation('POST', '/api/items');
    expect(ann).not.toBeNull();
    expect(ann.method).toBe('POST');
  });

  it('overwrites existing annotation', () => {
    annotate('GET', '/api/users', 'Old note');
    annotate('GET', '/api/users', 'New note');
    const ann = getAnnotation('GET', '/api/users');
    expect(ann.note).toBe('New note');
  });

  it('throws if note is missing', () => {
    expect(() => annotate('GET', '/api/users')).toThrow();
  });

  it('includes updatedAt timestamp', () => {
    annotate('DELETE', '/api/items/:id', 'Delete an item');
    const ann = getAnnotation('DELETE', '/api/items/:id');
    expect(ann.updatedAt).toBeDefined();
  });
});

describe('getAllAnnotations', () => {
  it('returns empty array when none set', () => {
    expect(getAllAnnotations()).toEqual([]);
  });

  it('returns all stored annotations', () => {
    annotate('GET', '/a', 'note a');
    annotate('POST', '/b', 'note b');
    const all = getAllAnnotations();
    expect(all).toHaveLength(2);
  });
});

describe('removeAnnotation', () => {
  it('removes an existing annotation', () => {
    annotate('GET', '/api/users', 'Some note');
    const removed = removeAnnotation('GET', '/api/users');
    expect(removed).toBe(true);
    expect(getAnnotation('GET', '/api/users')).toBeNull();
  });

  it('returns false when annotation does not exist', () => {
    expect(removeAnnotation('GET', '/nonexistent')).toBe(false);
  });
});

describe('reset', () => {
  it('clears all annotations', () => {
    annotate('GET', '/x', 'note');
    reset();
    expect(getAllAnnotations()).toHaveLength(0);
  });
});
