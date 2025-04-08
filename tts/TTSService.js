const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const textToSpeech = require('@google-cloud/text-to-speech');
require('dotenv').config(); // .env 파일에서 환경변수 로드


class TTSService {
    constructor() {
        this._serviceAccountPath = 'service_account.json'; //groov@groovworks.com
        this.initialized = false;
        this.tempDir = path.join(__dirname, 'temp');
        this.ensureTempDirectory();

        // TTS 설정
        this.globalVolume = 20.0;
        this.speakingRate = 1.0;
        this.pitch = 0.0;
        this.selectedTTSType = 'google'; // 기본값
        this.currentSelectedVoiceModel = 'ko-KR-Neural2-A'; // 기본값

        // API 키들
        this.apiKeys = {
            azure: process.env.AZURE_API_KEY,
            supertone: process.env.SUPERTONE_API_KEY,
            elevenLabs: process.env.ELEVENLABS_API_KEY,
            openAI: process.env.OPENAI_API_KEY,
            typecast: process.env.TYPECAST_API_KEY,
            minimax: process.env.MINIMAX_API_KEY
        };

        // 음성 ID들
        this.voiceIds = {
            google: {
                'ko-KR-Neural2-A': 'ko-KR-Neural2-A',
                'ko-KR-Neural2-B': 'ko-KR-Neural2-B'
            },
            openai: {
                'nova': 'nova',
                'alloy': 'alloy'
            },
            minimax: {
                'Wise_Woman': 'Wise_Woman',
                'Friendly_Person': 'Friendly_Person',
                'Inspirational_girl': 'Inspirational_girl',
                'Deep_Voice_Man': 'Deep_Voice_Man',
                'Calm_Woman': 'Calm_Woman',
                'Casual_Guy': 'Casual_Guy',
                'Lively_Girl': 'Lively_Girl',
                'Patient_Man': 'Patient_Man',
                'Young_Knight': 'Young_Knight',
                'Determined_Man': 'Determined_Man',
                'Lovely_Girl': 'Lovely_Girl',
                'Decent_Boy': 'Decent_Boy',
                'Imposing_Manner': 'Imposing_Manner',
                'Elegant_Man': 'Elegant_Man',
                'Abbess': 'Abbess',
                'Sweet_Girl_2': 'Sweet_Girl_2',
                'Exuberant_Girl': 'Exuberant_Girl'
            },
            elevenLabs: {
                'jennie': 'z6Kj0hecH20CdetSElRT',
                'yuna': 'AZnzlk1XvdvUeBnXmlld',
                'groov_1': 'LhmvWr6Wdcfrs8P9yiZU'
            },
            typecast: {
                'yeonah': '61e748d0fd9fb2d2cacbb04d',
                'gunwoo': '624cccbcadcd568510764d65',
                'bonggyu': '6596849ea3ecaa12a8b13989',
                'kwak': '606c6c684085209e5555abb0',
                'pangpang': '61532cab9119555d352f5c69',
                'hayoon': '66d01e7c8e625c91c92acfc5',
                'seohui': '66d91cac31a58a718f750a49'
            }
        };

        // Google TTS 관련 설정
        this.serviceAccountPath = path.join(__dirname, 'service_account.json');
    }

    ensureTempDirectory() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async initialize() {
        this.initialized = true;
        return true;
    }

    async processText(text, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const processedText = this.preprocessText(text);
            const audioData = await this.convertToSpeech(processedText, options);

            return {
                success: true,
                audioData: audioData,
                format: options.format || 'wav',
                duration: 0
            };
        } catch (error) {
            console.error('TTS 처리 중 오류 발생:', error);
            throw new Error('TTS 처리 중 오류가 발생했습니다.');
        }
    }

    preprocessText(text) {
        return text.trim();
    }

    async convertToSpeech(text, options = {}) {
        const { ttsType = this.selectedTTSType } = options;

        switch (ttsType.toLowerCase()) {
            case 'google':
                return await this.speakGoogle(text, options);
            case 'openai':
                return await this.speakOpenAI(text, options);
            case 'typecast':
                return await this.speakTypecast(text, options);
            case 'elevenlabs':
                return await this.speakElevenLabs(text, options);
            case 'minimax':
                return await this.speakMinimax(text, options);
            case 'supertone':
                return await this.speakSupertone(text, options);
            case 'azure':
                return await this.speakAzure(text, options);
            default:
                throw new Error('지원하지 않는 TTS 타입입니다.');
        }
    }

    async speakAzure(text, options) {
        const region = 'koreacentral';
        const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

        const headers = {
            'Ocp-Apim-Subscription-Key': this.apiKeys.azure,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
            'Accept': 'audio/mpeg',
            'User-Agent': 'node-tts-app'
        };

        const ssml = `
            <speak version='1.0' xml:lang='en-US'>
                <voice xml:lang='ko-KR' xml:gender='Female' name='ko-KR-SunHiNeural'>
                    ${text}
                </voice>
            </speak>
        `;

        try {
            const response = await axios.post(url, ssml, {
                headers: headers,
                responseType: 'arraybuffer'
            });

            return response.data;
        } catch (error) {
            console.error('Azure TTS 오류:', error);
            throw error;
        }
    }

    async speakSupertone(text, options) {
        const url = "https://supertoneapi.com/v1/text-to-speech/54CyP2zU9HCeLVCpzDRFPi";

        try {
            const response = await axios.post(url, {
                text: text,
                language: "ko",
                model: "turbo",
                voice_settings: {
                    pitch_shift: 0,
                    pitch_variance: 1,
                    speed: 1
                }
            }, {
                headers: {
                    "x-sup-api-key": this.apiKeys.supertone,
                    "Content-Type": "application/json"
                },
                responseType: 'arraybuffer'
            });

            return response.data;
        } catch (error) {
            console.error('Supertone TTS 오류:', error);
            throw error;
        }
    }

    async speakMinimax(text, options) {
        const groupId = "1909038592223617722";
        const url = `https://api.minimaxi.chat/v1/t2a_async_v2?GroupId=${groupId}`;

        const voiceId = options.voiceModel || Object.keys(this.voiceIds.minimax)[0];
        console.log(`🔊 Minimax TTS voiceId: ${voiceId}`);

        const payload = {
            model: "speech-01-turbo",
            text: text,
            voice_setting: {
                voice_id: voiceId,
                speed: this.speakingRate,
                vol: 1,
                pitch: this.pitch
            },
            pronunciation_dict: {
                tone: ["omg/oh my god"]
            },
            audio_setting: {
                audio_sample_rate: 32000,
                bitrate: 128000,
                format: "mp3",
                channel: 1
            }
        };

        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'authorization': `Bearer ${this.apiKeys.minimax}`,
                    'Content-Type': 'application/json'
                }
            });

            const taskId = response.data.task_id;
            return await this.pollMinimaxTaskStatus(groupId, taskId);
        } catch (error) {
            console.error('Minimax TTS 오류:', error);
            throw error;
        }
    }

    async pollMinimaxTaskStatus(groupId, taskId) {
        const url = `https://api.minimaxi.chat/v1/query/t2a_async_query_v2?GroupId=${groupId}&task_id=${taskId}`;

        while (true) {
            try {
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKeys.minimax}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data.status === 'Success') {
                    console.log('✅ Minimax TTS 상태: 변환 완료');
                    return await this.retrieveMinimaxAudio(response.data.file_id, groupId);
                }

                console.log(`🔄 Minimax TTS 상태: ${response.data.status || '처리 중'}`);
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error('❌ Minimax 상태 확인 오류:', error);
                throw error;
            }
        }
    }

    async retrieveMinimaxAudio(fileId, groupId) {
        const url = `https://api.minimaxi.chat/v1/files/retrieve?GroupId=${groupId}&file_id=${fileId}`;

        try {
            const response = await axios.get(url, {
                headers: {
                    'authority': 'api.minimaxi.chat',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.minimax}`
                }
            });

            const downloadUrl = response.data.file.download_url;
            const downloadResponse = await axios.get(downloadUrl, {
                responseType: 'arraybuffer'
            });

            return downloadResponse.data;
        } catch (error) {
            console.error('Minimax 오디오 다운로드 오류:', error);
            throw error;
        }
    }

    async speakElevenLabs(text, options) {
        const voiceId = options.voiceModel || Object.keys(this.voiceIds.elevenLabs)[0];
        console.log(`🔊 ElevenLabs TTS voiceId: ${voiceId}`);
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

        try {
            const response = await axios.post(url, {
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.3,
                    similarity_boost: 1,
                    style_exaggeration: 0.1
                }
            }, {
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': this.apiKeys.elevenLabs,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            });

            return response.data;
        } catch (error) {
            console.error('ElevenLabs TTS 오류:', error);
            throw error;
        }
    }

    async speakTypecast(text, options) {
        const url = 'https://typecast.ai/api/speak';
        const actorId = options.voiceModel || Object.keys(this.voiceIds.typecast)[0];
        console.log(`🔊 Typecast TTS voiceId: ${actorId}`);

        try {
            const response = await axios.post(url, {
                actor_id: actorId,
                text: text,
                lang: 'auto',
                tempo: this.speakingRate,
                volume: 100,
                pitch: this.pitch,
                xapi_hd: true,
                max_seconds: 60,
                model_version: 'latest',
                xapi_audio_format: 'mp3'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.typecast}`
                }
            });

            const audioUrl = response.data.result.speak_v2_url;
            return await this.downloadAndPlayAudio(audioUrl);
        } catch (error) {
            console.error('Typecast TTS 오류:', error);
            throw error;
        }
    }

    async speakOpenAI(text, options) {
        const url = 'https://api.openai.com/v1/audio/speech';
        const voice = options.voiceModel || Object.keys(this.voiceIds.openai)[0];
        console.log(`🔊 OpenAI TTS voiceId: ${voice}`);

        try {
            const response = await axios.post(url, {
                model: 'gpt-4o-mini-tts',
                input: text,
                voice: voice,
                response_format: 'mp3',
                instructions: "Voice Affect: Cheerful and full of energy.\n\nTone: Soft-hearted and compassionate"
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.openAI}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            });

            return response.data;
        } catch (error) {
            console.error('OpenAI TTS 오류:', error);
            throw error;
        }
    }

    async speakGoogle(text, options) {
        const voiceName = options.voiceModel || Object.keys(this.voiceIds.google)[0];
        console.log(`🔊 Google TTS voiceId: ${voiceName}`);

        try {
            // 서비스 계정 파일 읽기
            const serviceAccount = JSON.parse(fs.readFileSync(this.serviceAccountPath, 'utf8'));

            // JWT 토큰 생성
            const jwt = require('jsonwebtoken');
            const now = Math.floor(Date.now() / 1000);
            const token = jwt.sign(
                {
                    iss: serviceAccount.client_email,
                    scope: 'https://www.googleapis.com/auth/cloud-platform',
                    aud: 'https://oauth2.googleapis.com/token',
                    exp: now + 3600,
                    iat: now
                },
                serviceAccount.private_key,
                { algorithm: 'RS256' }
            );

            // 액세스 토큰 요청
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: token
            });

            const accessToken = tokenResponse.data.access_token;

            // TTS API 호출
            const url = 'https://texttospeech.googleapis.com/v1/text:synthesize';
            const response = await axios.post(url, {
                input: { text: text },
                voice: {
                    languageCode: 'ko-KR',
                    name: voiceName
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: this.speakingRate,
                    pitch: this.pitch
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            // Base64 디코딩
            const audioContent = response.data.audioContent;
            const audioBuffer = Buffer.from(audioContent, 'base64');

            return audioBuffer;
        } catch (error) {
            console.error('Google TTS 오류:', error);
            throw error;
        }
    }

    async downloadAndPlayAudio(audioUrl) {
        try {
            const response = await axios.get(audioUrl, {
                responseType: 'arraybuffer'
            });
            return response.data;
        } catch (error) {
            console.error('오디오 다운로드 오류:', error);
            throw error;
        }
    }

    // 설정 관련 메서드들
    async updateTTSType(newType) {
        if (['google', 'openai', 'minimax'].includes(newType)) {
            this.selectedTTSType = newType;
            return { success: true, message: `TTS 서비스가 ${newType}로 변경되었습니다.` };
        } else {
            throw new Error('지원하지 않는 TTS 서비스입니다.');
        }
    }

    async updateSpeakingRate(newRate) {
        this.speakingRate = newRate;
    }

    async updatePitch(newPitch) {
        this.pitch = newPitch;
    }

    getAvailableTTSTypes() {
        return ['google', 'openAI', 'typecast', 'elevenLabs', 'minimax', 'supertone', 'azure'];
    }
}

module.exports = TTSService; 