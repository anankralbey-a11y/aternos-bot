const bedrock = require('bedrock-protocol');
const http = require('http');

// --- RENDER WEB SUNUCUSU ---
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write("Bot aktif. Surum: Ozel (1.21.132.3) veya Otomatik.");
    res.end();
}).listen(port, () => {
    console.log(`Web sunucusu ${port} portunda başlatıldı.`);
});

// --- BOT AYARLARI ---
const SERVER_IP = 'bxfhard.aternos.me';
const SERVER_PORT = 16317;
const BOT_NAME = 'AfkBotu';

// --- BOT FONKSİYONU ---
function createBot() {
    console.log(`Sunucuya bağlanmaya çalışılıyor: ${SERVER_IP}:${SERVER_PORT}`);

    const client = bedrock.createClient({
        host: SERVER_IP,
        port: SERVER_PORT,
        username: BOT_NAME,
        offline: true,
        
        // --- KRİTİK AYARLAR ---
        // 1. skipPing: false yapıyoruz ki bot sunucuya sürümünü sorsun (Otomatik algılama).
        skipPing: false, 

        // 2. Senin istediğin sürüm. 
        // Eğer otomatik algılama hata verirse bu satırı kullanır.
        // Aternos'ta yazan tam sayı neyse o olmalı.
        version: '1.21.130' 
    });

    // Kaynak paketi hatasını önleyen fonksiyon
    const acceptResourcePack = () => {
        const packetData = {
            response_status: 'completed',
            resourcepack_ids: [],
            resource_pack_ids: [],
            pack_ids: [], 
            experiments: []
        };

        try {
            client.write('resource_pack_client_response', packetData);
        } catch (err) {
            // Sessiz kal
        }
    };

    client.on('resource_packs_info', (packet) => {
        acceptResourcePack();
    });

    client.on('resource_pack_stack', (packet) => {
        acceptResourcePack();
    });

    client.on('join', () => {
        console.log('[BAŞARILI] Bot sunucuya katıldı!');
        
        // Anti-AFK
        setInterval(() => {
            try {
                client.queue('animate', {
                    action_id: 1, 
                    runtime_entity_id: client.runtimeEntityId 
                });
            } catch (e) { }
        }, 30000);
    });

    client.on('disconnect', (packet) => {
        console.log(`[UYARI] Bağlantı koptu: ${packet.reason}. 10 saniye sonra tekrar denenecek...`);
        setTimeout(createBot, 10000);
    });

    client.on('error', (err) => {
        // Version not supported hatası alırsan buraya düşer
        if (err.message.includes('not supported')) {
            console.log(`[HATA] Yazdığın 1.21.132.3 sürümü kütüphanede yok! Lütfen kodu 1.21.60 yaparak dene.`);
        } else if (!err.message.includes('BigInt')) {
            console.log(`[HATA] ${err.message}`);
        }
        setTimeout(createBot, 15000);
    });
}

createBot();

