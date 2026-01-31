const bedrock = require('bedrock-protocol');
const http = require('http');

// --- RENDER İÇİN WEB SUNUCU (Burası botun kapanmasını/uyumasını engeller) ---
const port = process.env.PORT || 10000; // Render'ın verdiği portu kullanır
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write("Bot aktif ve Aternos sunucusunu bekliyor.");
    res.end();
}).listen(port, () => {
    console.log(`Web sunucusu ${port} portunda başlatıldı. Bot çalışmaya hazır.`);
});

// --- BOT AYARLARI (BURAYI DÜZENLE) ---
const SERVER_IP = 'bxfhard.aternos.me'; // Aternos'taki sunucu adresin
const SERVER_PORT = 16317;                   // Aternos'taki port numaran
const BOT_NAME = 'AFK_BOT';              // Botun oyundaki adı

// --- BOT FONKSİYONU ---
function createBot() {
    console.log(`Sunucuya bağlanmaya çalışılıyor: ${SERVER_IP}:${SERVER_PORT}`);

    const client = bedrock.createClient({
        host: SERVER_IP,
        port: SERVER_PORT,
        username: BOT_NAME,
        offline: true, // Korsan sunucu olduğu için 'true' kalacak
        skipPing: true
    });

    client.on('join', () => {
        console.log('[BAŞARILI] Bot sunucuya katıldı!');
        setInterval(() => {
            client.queue('animate', { action_id: 1 }); // Anti-AFK
            console.log("Anti-AFK hareketi yapıldı.");
        }, 30000);
    });

    client.on('disconnect', (packet) => {
        console.log(`[UYARI] Bağlantı koptu: ${packet.reason}. 10 saniye sonra tekrar denenecek...`);
        setTimeout(createBot, 10000);
    });

    client.on('error', (err) => {
        console.log(`[HATA] ${err.message}. 15 saniye sonra tekrar denenecek...`);
        setTimeout(createBot, 15000);
    });
}

// Botu başlat
createBot();