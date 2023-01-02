import crypto from "crypto";
const { default: AuthRepository } = require("../../src/auth/authRepository");
const { default: AuthService } = require("../../src/auth/authService");
const { default: AuthDTO } = require("../../src/dto/authDTO");
const { getInitPassword } = require("../../src/auth/initPw");

const authService = new AuthService();
const authRepository = new AuthRepository();

describe('signUpByPhoneNum 테스트', () => {
    test('정상 테스트', async () => {
        const testPhoneNum = '010-0000-0000';
        const testUsername = '01000000000';

        //db 초기화가 안돼서 테스트 전에 삭제
        await authRepository.deleteByUsername(testUsername);

        expect(await authService.signUpByPhoneNum(testPhoneNum)).toBe(true);

        const user = await authRepository.findOneByUsername(testUsername);
        expect(user.getUsername()).toBe(testUsername);

        const password = getInitPassword(testUsername);
        const hashedPassword = getHashedPassword(password, user.getSalt());
        expect(user.getHashedPassword().toString()).toBe(hashedPassword);

        const success = await authRepository.deleteByUsername(testUsername);
        expect(success).toBe(true);

    })
})

describe('changePassword 테스트', () => {
    test('정상 테스트', async () => {
        const testPhoneNum = '010-0000-0000';
        const testUsername = '01000000000';
        const newPassword = '1234';

        //db 초기화가 안돼서 테스트 전에 삭제
        await authRepository.deleteByUsername(testUsername);

        expect(await authService.signUpByPhoneNum(testPhoneNum)).toBe(true);

        expect(await authService.changePassword(testUsername, newPassword)).toBe(true);

        const user = await authRepository.findOneByUsername(testUsername);
        expect(user.getUsername()).toBe(testUsername);
        const hashedPassword = getHashedPassword(newPassword, user.getSalt());
        expect(user.getHashedPassword().toString()).toBe(hashedPassword);

        const success = await authRepository.deleteByUsername(testUsername);
        expect(success).toBe(true);

    })
})

describe('initPassword 테스트', () => {
    test('정상 테스트', async () => {
        const testPhoneNum = '010-0000-0000';
        const testUsername = '01000000000';
        const newPassword = '1234';
        const initPassword = getInitPassword(testUsername);

        //db 초기화가 안돼서 테스트 전에 삭제
        await authRepository.deleteByUsername(testUsername);

        expect(await authService.signUpByPhoneNum(testPhoneNum)).toBe(true);

        expect(await authService.changePassword(testUsername, newPassword)).toBe(true);
        
        expect(await authService.initPassword(testUsername));

        const user = await authRepository.findOneByUsername(testUsername);
        expect(user.getUsername()).toBe(testUsername);
        const hashedPassword = getHashedPassword(initPassword, user.getSalt());
        expect(user.getHashedPassword().toString()).toBe(hashedPassword);

        const success = await authRepository.deleteByUsername(testUsername);
        expect(success).toBe(true);

    })
})

describe('isAdmin 테스트', () => {
    test('관리자 계정 테스트', () => {
        expect(authService.isAdmin(new AuthDTO('test'))).toBe(true);
        expect(authService.isAdmin(new AuthDTO('admin'))).toBe(true);
    })

    test('일반 계정 테스트', () => {
        expect(authService.isAdmin(new AuthDTO('normal'))).toBe(false);
        expect(authService.isAdmin(new AuthDTO('plain'))).toBe(false);
    })
})


function getHashedPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString("hex");
}

