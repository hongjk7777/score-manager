import AuthRepository from "../../src/auth/authRepository"
import container from "../../src/container";
import User from "../../src/domain/entity/user";

const authRepository = container.resolve('authRepository');

//TODO: 추후에 sequalize를 사용해 테스트마다 디비를 초기화 시킬 수 있도록 해서 save delete 유닛 테스트 해야 함.

describe( 'findOneByUsername 테스트', () => {
    test('정상 테스트', async () => {
        const user = await authRepository.findOneByUsername('test');
        console.log(user);
        expect(user.getUsername()).toBe('test');
    })

    test('유저가 존재하지 않을 경우', async () => {
        const user = await authRepository.findOneByUsername('noIdHere');

        expect(user).toBe(null);
    })
})

describe('통합 테스트', () => {
    test('INSERT SELECT DELETE 테스트', async() => {
        const user = getTempUser();

        const saveResult = await authRepository.save(user);
        expect(saveResult).toBe(true);
        
        let tempUser = await authRepository.findOneByUsername(user.getUsername());
        expect(user.getUsername()).toBe(tempUser.getUsername());

        const deleteResult = await authRepository.deleteByUsername(user.getUsername());
        expect(deleteResult).toBe(true);

        tempUser = await authRepository.findOneByUsername(user.getUsername());
        expect(tempUser).toBe(null);

    })
})

function getTempUser() {

    return new User('realTestName', 'hashedPassword', 'salt');
}