document.addEventListener('DOMContentLoaded', () => {
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const toggleBtn = document.getElementById('toggle-btn');
    const generateBtn = document.getElementById('generate-btn');
    const playBtn = document.getElementById('play-btn');
    const flag = document.getElementById('flag');
    const body = document.body;
    const dayElementsContainer = document.querySelector('.day-elements');
    const nightElementsContainer = document.querySelector('.night-elements');
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const messageControls = document.getElementById('message-controls');
    let audioContext = null;

    let flagPosition = 100;

    const createElements = (type, count, container) => {
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.classList.add(type);
            el.style.left = `${Math.random() * 100}vw`;
            el.style.top = `${Math.random() * 80}vh`;
            if (type === 'star') {
                const size = Math.random() * 3 + 1;
                el.style.width = `${size}px`;
                el.style.height = `${size}px`;
            } else if (type === 'cloud') {
                const width = Math.random() * 100 + 80;
                el.style.width = `${width}px`;
                el.style.height = `${width/2}px`;
                el.style.animationDelay = `${Math.random() * 10}s`;
            } else if (type === 'bird') {
                el.style.animationDelay = `${Math.random() * 10}s`;
            }
            container.appendChild(el);
        }
    };

    createElements('cloud', 5, dayElementsContainer);
    createElements('bird', 3, dayElementsContainer);
    createElements('star', 50, nightElementsContainer);
    
    upBtn.addEventListener('click', () => {
        if (flagPosition > 10) {
            flagPosition -= 10;
            flag.style.top = `${flagPosition}%`;
        }
    });

    downBtn.addEventListener('click', () => {
        if (flagPosition < 100) {
            flagPosition += 10;
            flag.style.top = `${flagPosition}%`;
        }
    });

    toggleBtn.addEventListener('click', () => {
        body.classList.toggle('night');
        body.classList.toggle('day');
    });

    generateBtn.addEventListener('click', async () => {
        messageBox.classList.remove('hidden');
        messageText.innerHTML = '<div class="loading-spinner"></div>';
        messageControls.classList.add('hidden');
        
        const userQuery = "Genera una cita o proverbio inspirador corto de una figura histórica o un principio relacionado con la bandera y la independencia de la República Dominicana.";
        const systemPrompt = "Eres un historiador experto. Responde con un mensaje inspirador, en primera persona, como si fueras un héroe nacional dominicano. Mantén la respuesta concisa y en un solo párrafo. No uses comillas.";
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        try {
            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                tools: [{ "google_search": {} }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                messageText.textContent = text;
                messageControls.classList.remove('hidden');
                generateAudio(text);
            } else {
                messageText.textContent = "Lo siento, no pude generar un mensaje. Intenta de nuevo.";
            }
        } catch (error) {
            console.error("Error al generar el mensaje:", error);
            messageText.textContent = "Ocurrió un error. Por favor, intenta de nuevo.";
        }
    });

    const pcmToWav = (pcmData, sampleRate) => {
        const numChannels = 1;
        const bytesPerSample = 2;
        const headerSize = 44;
        const dataSize = pcmData.length * bytesPerSample;
        const buffer = new ArrayBuffer(headerSize + dataSize);
        const view = new DataView(buffer);
        
        let offset = 0;
        const writeString = (str) => {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset++, str.charCodeAt(i));
            }
        };

        // RIFF identifier
        writeString('RIFF');
        view.setUint32(offset, 36 + dataSize, true);
        offset += 4;
        // WAVE identifier
        writeString('WAVE');
        // fmt chunk
        writeString('fmt ');
        view.setUint32(offset, 16, true);
        offset += 4;
        view.setUint16(offset, 1, true);
        offset += 2;
        view.setUint16(offset, numChannels, true);
        offset += 2;
        view.setUint32(offset, sampleRate, true);
        offset += 4;
        view.setUint32(offset, sampleRate * numChannels * bytesPerSample, true);
        offset += 4;
        view.setUint16(offset, numChannels * bytesPerSample, true);
        offset += 2;
        view.setUint16(offset, bytesPerSample * 8, true);
        offset += 2;
        // data chunk
        writeString('data');
        view.setUint32(offset, dataSize, true);
        offset += 4;

        const pcm16 = new Int16Array(pcmData.buffer);
        for (let i = 0; i < pcm16.length; i++) {
            view.setInt16(offset, pcm16[i], true);
            offset += 2;
        }
        
        return new Blob([view], { type: 'audio/wav' });
    };

    const generateAudio = async (text) => {
        const audioApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
        
        try {
            const audioPayload = {
                contents: [{ parts: [{ text: text }] }],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: "Iapetus" }
                        }
                    }
                }
            };
            
            const audioResponse = await fetch(audioApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(audioPayload)
            });
            
            const audioResult = await audioResponse.json();
            const audioPart = audioResult?.candidates?.[0]?.content?.parts?.[0];
            const audioData = audioPart?.inlineData?.data;
            const mimeType = audioPart?.inlineData?.mimeType;

            if (audioData && mimeType && mimeType.startsWith("audio/")) {
                const sampleRateMatch = mimeType.match(/rate=(\d+)/);
                const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 16000;
                const pcmData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
                const wavBlob = pcmToWav(pcmData, sampleRate);
                const audioUrl = URL.createObjectURL(wavBlob);
                
                const audio = new Audio(audioUrl);
                playBtn.onclick = () => {
                    audio.play();
                };
            } else {
                console.error("No se pudo generar el audio.");
            }
        } catch (error) {
            console.error("Error al generar el audio:", error);
        }
    };
});
