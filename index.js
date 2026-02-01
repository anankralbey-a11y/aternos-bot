const bedrock = require('bedrock-protocol');
const http = require('http');

// --- RENDER WEB SUNUCUSU ---
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write("Bot aktif. Fix v3 (pack_ids eklendi).");
    res.end();
}).listen(port, () => {
    console.log(`Web sunucusu ${port} portunda başlatıldı.`);
});

// --- BOT AYARLARI ---
const SERVER_IP = 'bxfhard.aternos.me';
const SERVER_PORT = 16317;
const BOT_NAME = 'AfkBotubycelo';

// --- BOT FONKSİYONU ---
function createBot() {
    console.log(`Sunucuya bağlanmaya çalışılıyor: ${SERVER_IP}:${SERVER_PORT}`);

    const client = bedrock.createClient({
        host: SERVER_IP,
        port: SERVER_PORT,
        username: BOT_NAME,
        offline: true,
        skipPing: true,
        // Sürüm belirtmek hataları azaltır. Aternos genelde en son sürümdür (1.21.60).
        // Eğer 1.21.132 yazdıysan o preview sürümü olabilir, 
        // burayı şimdilik kapalı tutuyoruz ki otomatik algılasın.
        // version: '1.21.60' 
    });

    // --- HATAYI ÇÖZEN KISIM ---
    const acceptResourcePack = () => {
        // Hata almamak için tüm olası isimleri gönderiyoruz.
        // 1.21 sürümlerinde genellikle 'pack_ids' kullanılır.
        const packetData = {
            response_status: 'completed',
            resourcepack_ids: [],
            resource_pack_ids: [],
            pack_ids: [],       // <-- İŞTE HATAYI ÇÖZECEK OLAN SATIR BU
            experiments: []
        };

        client.write('resource_pack_client_response', packetData);
    };

    // Sunucu paket bilgisi gönderdiğinde:
    client.on('resource_packs_info', (packet) => {
        acceptResourcePack();
    });

    // Sunucu paket yığını gönderdiğinde:
    client.on('resource_pack_stack', (packet) => {
        acceptResourcePack();
    });

    client.on('join', () => {
        console.log('[BAŞARILI] Bot sunucuya katıldı ve kaynak paketlerini atladı!');
        
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
        // Eğer kritik bir hataysa hemen tekrar deneme, biraz bekle
        setTimeout(createBot, 15000);
    });
}

createBot();
