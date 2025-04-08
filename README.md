# TTS 서비스 선택기

다양한 TTS(Text-to-Speech) 서비스를 하나의 인터페이스에서 사용할 수 있는 웹 애플리케이션입니다. Google Cloud TTS, OpenAI, ElevenLabs, TypeCast, MiniMax, Supertone, Azure 등 다양한 TTS 제공업체를 지원합니다.

## 주요 기능

- 다양한 TTS 서비스 지원: Google, OpenAI, ElevenLabs, TypeCast, MiniMax, Supertone, Azure
- 각 서비스별 음성 모델 선택
- 속도, 피치, 볼륨 조절 기능
- 음성 변환 과정에서 경과 시간 표시

## 설치 방법

1. 저장소 클론:
```bash
git clone https://github.com/chewbacca-grvwrk/projectTTS.git
cd projectTTS
```

2. 의존성 패키지 설치:
```bash
npm install
```

3. `.env` 파일 생성 및 API 키 설정:
```
AZURE_API_KEY=your_azure_api_key
SUPERTONE_API_KEY=your_supertone_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
OPENAI_API_KEY=your_openai_api_key
TYPECAST_API_KEY=your_typecast_api_key
MINIMAX_API_KEY=your_minimax_api_key
```

4. Google Cloud 서비스 계정 키 파일 설정:
   - Google Cloud Console에서 서비스 계정 키(JSON 형식)를 다운로드
   - 다운로드한 파일을 `tts/service_account.json`으로 저장

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

## 사용 방법

1. 웹 인터페이스에서 TTS 서비스 선택
2. 해당 서비스에서 제공하는 음성 모델 선택
3. 필요시 속도, 피치, 볼륨 조절
4. 변환할 텍스트 입력
5. '음성 변환' 버튼 클릭
6. 변환 후 자동으로 음성 재생

## 주의사항

- 각 TTS 서비스는 API 키가 필요하며, 사용량에 따라 요금이 부과될 수 있습니다.
- Google Cloud의 경우 서비스 계정 키가 필요합니다.
- OpenAI TTS 사용 시 피치와 속도 조절 기능은 비활성화됩니다.

## 프로젝트 구조

- `server.js`: 메인 서버 파일
- `tts/TTSService.js`: TTS 서비스 통합 관리 클래스
- `tts/service_account.json`: Google Cloud 서비스 계정 키
- `public/`: 프론트엔드 파일 (HTML, CSS, JS)
- `.env`: API 키 등 환경변수

## 라이선스

이 프로젝트는 MIT 라이선스로 배포됩니다. 