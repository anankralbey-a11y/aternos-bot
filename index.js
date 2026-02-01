const bedrock = require('bedrock-protocol');
const http = require('http');

// --- RENDER İÇİN WEB SUNUCU ---
// Bu kısım Render.com'un botu kapatmaması için gereklidir.
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write("Bot aktif. Modlu Aternos sunucusu icin kaynak paketlerini bypass ediyor.");
    res.end();
}).listen(port, () => {
    console.log(`Web sunucusu ${port} portunda başlatıldı. Bot çalışmaya hazır.`);
});

// --- BOT AYARLARI ---
const SERVER_IP = 'bxfhard.aternos.me';
const SERVER_PORT = 16317;
const BOT_NAME = 'AfkBotubycelo'; // Bot ismini buraya yazdık, sakın boş bırakma.

// --- BOT FONKSİYONU ---
function createBot() {
    console.log(`Sunucuya bağlanmaya çalışılıyor: ${SERVER_IP}:${SERVER_PORT}`);

    const client = bedrock.createClient({
        host: SERVER_IP,
        port: SERVER_PORT,
        username: BOT_NAME,
        offline: true,       // Korsan/Offline mod
        skipPing: true       // Ping işlemini atla (Bazen bağlantıyı hızlandırır)
        // Eğer sürüm hatası alırsan alttaki satırın başındaki // işaretini kaldır ve sürümü yaz.
        // version: '1.21.60' 
    });

    // --- ÖNEMLİ: MODLU SUNUCU GİRİŞ AYARLARI ---
    // Sunucu "Modları indir" dediğinde "Tamam indirdim (yalan)" diyerek geçiştiriyoruz.
    
    client.on('resource_packs_info', (packet) => {
        client.write('resource_pack_client_response', {
            response_status: 'completed',
            resourcepack_ids: []
        });
    });

    client.on('resource_pack_stack', (packet) => {
        client.write('resource_pack_client_response', {
            response_status: 'completed',
            resourcepack_ids: []
        });
    });
    // -------------------------------------------

    client.on('join', () => {
        console.log('[BAŞARILI] Bot sunucuya katıldı!');
        
        // Anti-AFK döngüsü
        setInterval(() => {
            try {
                // El sallama (Arm Swing) animasyonu
                client.queue('animate', {
                    action_id: 1, 
                    runtime_entity_id: client.runtimeEntityId 
                });
            } catch (e) {
                // Hata olursa konsolu kirletmemesi için sessiz geçiyoruz
            }
        }, 30000); // 30 saniyede bir
    });

    client.on('disconnect', (packet) => {
        console.log(`[UYARI] Bağlantı koptu: ${packet.reason}. 10 saniye sonra tekrar denenecek...`);
        setTimeout(createBot, 10000);
    });

    client.on('error', (err) => {
        // BigInt hatası genellikle önemsizdir, diğer hataları logluyoruz
        if (!err.message.includes('BigInt')) {
            console.log(`[HATA] ${err.message}. 15 saniye sonra tekrar denenecek...`);
        }
        setTimeout(createBot, 15000);
    });
}

// Botu başlat
createBot();
