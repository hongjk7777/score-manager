import app from "../../src/app";
import request from "supertest";

//로그인 확인 테스트
describe( 'POST /login', () => {
    test('관리자 로그인', (done) => {
        request(app)
            .post('/login/password')
            .send({
                username: 'test',
                password: 'test'
            })
            .expect('Location', '/classList')
            .expect(302, done);
    })

    test('ID, 비밀번호 틀린 경우', (done) => {
        request(app)
            .post('/login/password')
            .send({
                username: 'test112',
                password: 'test1123'
            })
            .expect(401, done);
    });

    test('비밀번호 틀림', (done) => {
        request.agent(app)
            .post('/login/password')
            .send({
                username: 'test',
                password: 'test1123'
            })
            .expect(401, done)
            // .expect('Location', '/login')
            // .expect(302, done);
    });
});

// 로그아웃 테스트
describe('POST /logout', () => {

    //테스트 전 로그인을 일괄적으로 실행
   const agent = request.agent(app);

   beforeEach((done) => {
      agent
         .post('/auth/login')
         .send({
            email: 'test@example.com',
            password: '123123',
         })
         .end(done);
   });
 
   test('로그아웃 수행', (done) => {
      agent.post('/logout')
        .send()
        .expect('Location', `/`)
        .expect(302, done);
   });
})