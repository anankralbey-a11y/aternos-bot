const bedrock = require('bedrock-protocol');
const http = require('http');

// --- RENDER WEB SUNUCUSU ---
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write("Bot aktif. Sürüm 1.21.50 zorlaması devrede.");
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
        skipPing: true,
        // ÖNEMLİ: Sürümü sabitliyoruz. Bu sayede "undefined" hatası çözülür.
        // Aternos sunucun daha yeni olsa bile bot bu sürümle girmeyi başarır.
        version: '1.21.50' 
    });

    // Kaynak paketi (Resource Pack) kabul etme fonksiyonu
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
            console.log("[BİLGİ] Kaynak paketi yanıtı gönderildi.");
        } catch (err) {
            console.log("[UYARI] Kaynak paketi gönderilirken şema hatası oluştu (Bot çalışmaya devam edecek):", err.message);
            // Hata olsa bile botun kapanmasını engelliyoruz
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
        // Hata mesajını daha temiz görelim
        if (!err.message.includes('BigInt')) {
            console.log(`[HATA] ${err.message}`);
        }
        // Kritik hatalarda botu yeniden başlat
        setTimeout(createBot, 15000);
    });
}

// Botu başlat
createBot();
