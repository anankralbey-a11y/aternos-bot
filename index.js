const bedrock = require('bedrock-protocol');
const http = require('http');

// --- KOYEB İÇİN WEB SUNUCU (Burası botun kapanmasını engeller) ---
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write("Bot aktif ve çalışıyor.");
    res.end();
}).listen(port, () => {
    console.log(`Web sunucusu ${port} portunda başlatıldı. Bot çalışmaya hazır.`);
});

// --- BOT AYARLARI (BURAYI DÜZENLE) ---
const SERVER_IP = 'bxfhard.aternos.me'; // Aternos'taki sunucu adresin
const SERVER_PORT = 16317; // Aternos'taki port numaran
const BOT_NAME = 'AFK_BOT'; // Botun oyundaki adı

// --- BOT FONKSİYONU ---
function createBot() {
    console.log(`Sunucuya bağlanmaya çalışılıyor: ${SERVER_IP}:${SERVER_PORT}`);

    const client = bedrock.createClient({
        host: SERVER_IP,
        port: SERVER_PORT,
        username: BOT_NAME,
        // ÖNEMLİ DEĞİŞİKLİK: Sunucun korsan olduğu için bu ayarı 'true' yapıyoruz.
        offline: true, 
        skipPing: true
    });

    client.on('join', () => {
        console.log('[BAŞARILI] Bot sunucuya katıldı!');
        // AFK sayılmamak için 30 saniyede bir el sallar
        setInterval(() => {
            client.queue('animate', { action_id: 1, runtime_entity_id: client.entityId });
            console.log("Anti-AFK hareketi yapıldı.");
        }, 30000);
    });

    client.on('disconnect', (packet) => {
        console.log(`[UYARI] Bağlantı koptu. Sebep: ${packet.reason}`);
        console.log("10 saniye içinde tekrar bağlanılacak...");
        setTimeout(createBot, 10000);
    });

    client.on('error', (err) => {
        console.log(`[HATA] Bir hata oluştu: ${err.message}`);
        console.log("15 saniye içinde tekrar denenecek...");
        setTimeout(createBot, 15000);
    });
}

// Botu ilk kez başlat
createBot();