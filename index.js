const bedrock = require('bedrock-protocol');
const http = require('http');

// --- RENDER İÇİN WEB SUNUCU ---
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write("Bot aktif. Modlu sunucu bypass devrede.");
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
        skipPing: true
        // version: '1.21.60' // Gerekirse burayı açabilirsin ama şimdilik kapalı kalsın
    });

    // --- DÜZELTİLEN KISIM: KAYNAK PAKETİ BYPASS ---
    // Hatayı önlemek için hem 'resourcepack_ids' hem 'resource_pack_ids' gönderiyoruz.
    
    const acceptResourcePack = () => {
        client.write('resource_pack_client_response', {
            response_status: 'completed',
            resourcepack_ids: [],
            resource_pack_ids: [], // <--- Bu satır hatayı çözer
            experiments: []        // Bazı yeni sürümler bunu da isteyebilir
        });
    };

    client.on('resource_packs_info', (packet) => {
        acceptResourcePack();
    });

    client.on('resource_pack_stack', (packet) => {
        acceptResourcePack();
    });
    // ----------------------------------------------

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
        // Eğer kritik bir hataysa hemen tekrar deneme, biraz bekle
        setTimeout(createBot, 15000);
    });
}

createBot();
