class DataHandler {
    constructor() {
        this.form = document.getElementById('dataForm');
        this.resultDiv = document.getElementById('result');
        this.initializeEventListeners();
        this.initializeRangeInputs();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // TTS 서비스 변경 시 음성 모델 옵션 업데이트
        document.getElementById('ttsService').addEventListener('change', async (e) => {
            await this.updateVoiceModelOptions(e.target.value);
        });
    }

    initializeRangeInputs() {
        // 슬라이더 값 표시 업데이트
        ['speed', 'pitch', 'volume'].forEach(id => {
            const input = document.getElementById(id);
            const valueSpan = document.getElementById(`${id}Value`);

            input.addEventListener('input', (e) => {
                valueSpan.textContent = e.target.value;
            });
        });
    }

    async updateVoiceModelOptions(ttsType) {
        try {
            const response = await fetch(`/api/voice-models/${ttsType}`);
            const data = await response.json();

            const voiceModelSelect = document.getElementById('voiceModel');
            voiceModelSelect.innerHTML = '';

            Object.keys(data.voiceModels).forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                voiceModelSelect.appendChild(option);
            });

            // OpenAI TTS 선택 시 pitch와 speed 컨트롤 비활성화
            const pitchControl = document.getElementById('pitch');
            const speedControl = document.getElementById('speed');
            const pitchLabel = document.querySelector('label[for="pitch"]');
            const speedLabel = document.querySelector('label[for="speed"]');

            if (ttsType === 'openai') {
                pitchControl.disabled = true;
                speedControl.disabled = true;
                pitchLabel.style.opacity = '0.5';
                speedLabel.style.opacity = '0.5';
            } else {
                pitchControl.disabled = false;
                speedControl.disabled = false;
                pitchLabel.style.opacity = '1';
                speedLabel.style.opacity = '1';
            }
        } catch (error) {
            console.error('음성 모델 옵션 업데이트 중 오류:', error);
        }
    }

    async handleSubmit() {
        const convertButton = document.getElementById('convertButton');
        const loadingIndicator = document.getElementById('loadingIndicator');

        // 버튼 비활성화 및 로딩 표시
        convertButton.disabled = true;
        loadingIndicator.style.display = 'flex';

        const formData = {
            text: document.getElementById('message').value,
            options: {
                ttsType: document.getElementById('ttsService').value,
                voiceModel: document.getElementById('voiceModel').value,
                speed: parseFloat(document.getElementById('speed').value),
                pitch: parseFloat(document.getElementById('pitch').value),
                volume: parseFloat(document.getElementById('volume').value)
            }
        };

        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'TTS 처리 중 오류가 발생했습니다.');
            }

            // 오디오 데이터를 Blob으로 변환
            const audioBlob = await response.blob();

            // 오디오 재생을 위한 URL 생성
            const audioUrl = URL.createObjectURL(audioBlob);

            // 오디오 요소 생성 및 재생
            const audio = new Audio(audioUrl);
            audio.play();

            // 결과 표시
            this.displayResult({
                success: true,
                message: 'TTS 변환이 완료되었습니다.'
            });

        } catch (error) {
            console.error('Error:', error);
            this.displayResult({ error: error.message });
        } finally {
            // 버튼 활성화 및 로딩 표시 숨김
            convertButton.disabled = false;
            loadingIndicator.style.display = 'none';
        }
    }

    displayResult(data) {
        if (data.error) {
            this.resultDiv.innerHTML = `<p class="error">${data.error}</p>`;
        } else {
            this.resultDiv.innerHTML = `<p>${data.message}</p>`;
        }
    }
}

// 클래스 인스턴스 생성
const dataHandler = new DataHandler(); 