# TTS for Groovworks

1. 저장소 클론:
```bash
git clone https://github.com/chewbacca-grvwrk/projectTTS.git
```

2. 의존성 패키지 설치:
```bash
npm install
```

3. `.env` 파일 생성 및 API 키 설정: 각 key는 Chewbacca 에게 요청
```
AZURE_API_KEY=your_azure_api_key
SUPERTONE_API_KEY=your_supertone_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
OPENAI_API_KEY=your_openai_api_key
TYPECAST_API_KEY=your_typecast_api_key
MINIMAX_API_KEY=your_minimax_api_key
```

4. Google Cloud 서비스 계정 키 파일 설정:
   - Google Cloud Console에서 서비스 계정 키(JSON 형식)를 Chewbacca 에게 요청
   - `tts/service_account.json`으로 저장

## 사용된 패키지

- **express**: 웹 서버 프레임워크
- **dotenv**: 환경변수 관리
- **@google-cloud/text-to-speech**: Google Cloud TTS API 클라이언트
- **axios**: HTTP 요청 클라이언트
- **jsonwebtoken**: JWT 인증 처리

## 실행 방법

1. 서버 실행:
```bash
npm start
```

2. 브라우저에서 접속:
```
http://localhost:3001
```
