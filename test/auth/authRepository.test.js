import AuthRepository from "../../src/auth/authRepository"

const authRepository = new AuthRepository();

describe( 'findOneByUsername 테스트', () => {
    test('정상 테스트', async () => {
        const user = await authRepository.findOneByUsername('test');

        expect(user.username).toBe('test');
    })

    test('유저가 존재하지 않을 경우', async () => {
        const user = await authRepository.findOneByUsername('noIdHere');

        expect(user).toBe(null);
    })
})