import app from "../../src/server";
import request from "supertest";

describe( 'POST /login', () => {
    test('관리자 로그인 테스트', (done) => {
        request(app)
            .post('/login/password')
            .send({
                username: 'test',
                password: 'test'
            })
            .expect('Location', '/classList')
            .expect(302, done);
    })
})

describe( 'POST /login', () => {
    test('비정상 로그인 테스트', (done) => {
        request(app)
            .post('/login/password')
            .send({
                username: 'test112',
                password: 'test1123'
            })
            .expect('Location', '/login')
            .expect(302, done);
    });
});

// //* 가입 테스트
// describe('POST /join', () => {
//     test('로그인 안 했으면 가입', done => {
//        request(app) // supertest에 app.js를 넣어줘서 미들웨어 실행되는 효과를 모킹한다.
//           .post('/auth/join') // 클라이언트에서 post 라우팅 한 효과
//           .send({
//              // post 데이터
//              email: 'test@example.com',
//              nick: 'test',
//              password: '123123',
//           })
//           //? auth.js에서 가입 성공하면 return res.redirect('/'); 와 비슷하게 설정
//           .expect('Location', '/') //? Location은 다음에 올 문자열이 경로라고 알려주는 거다.
//           .expect(302, done); //~ 비동기 메소드를 처리할때 콜백함수로 처리할경우 반드시 done을 써주어야 한다.
//     });
//  });
  
//  //* 로그인 중복 테스트
//  describe('POST /login', () => {
//     //? agent를 쓰면 상태를 유지시킬수 있어 여러 테스트를 할 수 있다. (로그인 상태를 유지시킨다 거나)
//     const agent = request.agent(app);
  
//     //? beforeEach 는 각 다음의 test()모듈들이 실행될때 이걸 먼저 실행하고 테스트하도록 하는 것이다.
//     //? beforeAll : test들을 하기전에 이걸 먼저 한번 실행하고 그 이후 쭉 테스트 시작
//     //? beforeEach : test들 할때마다(Each) 이걸 먼저 실행하고 테스트 하도록
//     beforeEach(done => {
//        //^ 테스트 하기전에 우선 agent로 로그인 하고 유지 시킨다.
//        agent
//           .post('/auth/login')
//           .send({
//              email: 'test@example.com',
//              password: '123123',
//           })
//           .end(done);
//     });
  
//     test('이미 로그인했으면 redirect /에러', done => {
//        // 위 beforeEach에서 이미 로그인 했는데, 또 로그인 시도를 하면 실패하게 되는 원리를 이용
//        const message = encodeURIComponent('로그인한 상태입니다.');
//        agent
//           .post('/auth/login')
//           .send({
//              email: 'test@example.com',
//              password: '123123',
//              nick: 'test',
//           })
//           .expect('Location', `/?error=${message}`)
//           .expect(302, done);
//     });
//  });
  