const express = require('express');
require('dotenv').config(); // .env 파일에서 환경변수 로드
const path = require('path');
const TTSService = require('./tts/TTSService');
const app = express();
const PORT = process.env.PORT || 3001;

// TTS 서비스 인스턴스 생성
const ttsService = new TTSService();

// JSON 파싱 미들웨어 추가
app.use(express.json());

// 정적 파일 제공
app.use(express.static('public'));

// 메인 라우트
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 음성 모델 목록 제공 엔드포인트
app.get('/api/voice-models/:ttsType', (req, res) => {
    try {
        const { ttsType } = req.params;
        const voiceModels = ttsService.voiceIds[ttsType] || {};
        res.json({ voiceModels });
    } catch (error) {
        console.error('음성 모델 목록 조회 중 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// TTS API 엔드포인트
app.post('/api/tts', async (req, res) => {
    try {
        const { text, options } = req.body;

        // TTS 서비스 타입과 음성 모델 설정
        await ttsService.updateTTSType(options.ttsType);
        ttsService.currentSelectedVoiceModel = options.voiceModel;

        // TTS 처리
        const result = await ttsService.processText(text, options);

        // 오디오 데이터를 클라이언트로 전송
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(result.audioData);
    } catch (error) {
        console.error('TTS 처리 중 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// API 엔드포인트
app.post('/api/submit', (req, res) => {
    try {
        const { name, message } = req.body;

        // 데이터 유효성 검사
        if (!name || !message) {
            return res.status(400).json({ error: '이름과 메시지는 필수 입력 항목입니다.' });
        }

        // 응답 데이터 생성
        const responseData = {
            name,
            message,
            timestamp: new Date().toLocaleString('ko-KR')
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// TTS 서비스 업데이트 엔드포인트
app.post('/update-tts-service', async (req, res) => {
    try {
        const { service } = req.body;
        const result = await ttsService.updateTTSType(service);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 