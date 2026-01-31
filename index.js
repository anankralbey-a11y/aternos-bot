const bedrock = require('bedrock-protocol');
const http = require('http');

// --- RENDER İÇİN WEB SUNUCU (Burası botun kapanmasını/uyumasını engeller) ---
const port = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write("Bot aktif ve Aternos sunucusunu bekliyor. Stabil versiyon.");
    res.end();
}).listen(port, () => {
    console.log(`Web sunucusu ${port} portunda başlatıldı. Bot çalışmaya hazır.`);
});

// --- BOT AYARLARI (BURAYI DÜZENLE) ---
const SERVER_IP = 'bxfhard.aternos.me';      // Sunucu adresin (Zaten doğru girmişsin)
const SERVER_PORT = 16317;                   // Port numaran (Zaten doğru girmişsin)
const BOT_NAME = '';              // Botun oyundaki adı

// --- BOT FONKSİYONU ---
function createBot() {
    console.log(`Sunucuya bağlanmaya çalışılıyor: ${SERVER_IP}:${SERVER_PORT}`);

    const client = bedrock.createClient({
        host: SERVER_IP,
        port: SERVER_PORT,
        username: BOT_NAME,
        offline: true, 
        skipPing: true
    });

    client.on('join', () => {
        console.log('[BAŞARILI] Bot sunucuya katıldı!');
        
        // Anti-AFK döngüsü
        setInterval(() => {
            console.log("Anti-AFK hareketi tetikleniyor...");
            try {
                // --- DÜZELTME BURADA ---
                // Sunucuya kimin animasyon yapacağını belirtiyoruz.
                // client.runtimeEntityId, botun oyundaki kendi kimliğidir.
                client.queue('animate', {
                    action_id: 1, // El sallama animasyonu
                    runtime_entity_id: client.runtimeEntityId 
                });
                console.log("Anti-AFK hareketi başarıyla gönderildi.");
            } catch (e) {
                console.error("Anti-AFK hareketi gönderilirken bir hata oluştu:", e);
            }
        }, 30000); // 30 saniyede bir
    });

    client.on('disconnect', (packet) => {
        console.log(`[UYARI] Bağlantı koptu: ${packet.reason}. 10 saniye sonra tekrar denenecek...`);
        setTimeout(createBot, 10000);
    });

    client.on('error', (err) => {
        // Bu hatanın tekrar etmemesi lazım ama garanti olsun diye loglayalım
        if (err.message.includes('BigInt')) {
            console.error('[KRİTİK HATA] Animate paketiyle ilgili sorun devam ediyor. Lütfen kodu kontrol edin.');
        } else {
            console.log(`[HATA] ${err.message}. 15 saniye sonra tekrar denenecek...`);
        }
        setTimeout(createBot, 15000);
    });
}

// Botu başlat
createBot();
