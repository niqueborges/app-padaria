import { User } from './user.entity.js';

describe('User Entity (Domain)', () => {
  it('should create a valid user instance and normalize email', () => {
    const user = new User({
      name: 'Pedro',
      email: '  PEDRO@padaria.com  ',
      password: 'hashed_password',
    });

    expect(user.name).toBe('Pedro');
    expect(user.email).toBe('pedro@padaria.com');
    expect(user.password).toBe('hashed_password');
  });
});
