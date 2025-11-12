const venom = require('venom-bot');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// ==================== CONFIGURAÇÃO ====================
const CONFIG = {
  whatsappNumber: '5516996259672',
  businessName: 'HL Serviços',
  services: [
    { id: 1, name: 'Instalação Elétrica', emoji: '⚡', desc: 'Tomadas, fiação, quadros, reformas' },
    { id: 2, name: 'Câmeras Segurança', emoji: '📹', desc: 'Instalação e manutenção de CFTV' },
    { id: 3, name: 'Portões Automáticos', emoji: '🚪', desc: 'Instalação e reparos' },
    { id: 4, name: 'Cerca Elétrica', emoji: '🔌', desc: 'Instalação e manutenção' },
    { id: 5, name: 'Instalações Gerais', emoji: '🛠️', desc: 'Diversos serviços residenciais' }
  ]
};

// ==================== WHATSAPP BOT ====================
let whatsappClient = null;

function iniciarWhatsAppBot() {
  venom.create({
    session: 'hl-servicos-bot',
    headless: true,
    multidevice: true
  })
  .then((client) => {
    whatsappClient = client;
    console.log('✅ WhatsApp Bot CONECTADO!');
    
    // Ouvir mensagens
    client.onMessage(async (message) => {
      if (message.isGroupMsg === false) {
        await processarMensagem(client, message);
      }
    });
  })
  .catch((error) => {
    console.log('❌ Erro WhatsApp:', error);
  });
}

// ==================== PROCESSAR MENSAGENS ====================
async function processarMensagem(client, message) {
  const mensagem = message.body.toLowerCase().trim();
  const from = message.from;
  
  console.log(`📱 De: ${from} | Msg: ${mensagem}`);
  
  let resposta = '';
  
  // FLUXO DE CONVERSA
  if (mensagem.includes('oi') || mensagem.includes('olá') || mensagem.includes('menu')) {
    resposta = gerarMenuPrincipal();
  }
  else if (mensagem.includes('1') || mensagem.includes('orçamento')) {
    resposta = gerarMenuServicos();
  }
  else if (mensagem.includes('2') || mensagem.includes('agendar')) {
    resposta = `📅 *AGENDAMENTO* - Perfeito!

${gerarMenuServicos()}

*Digite o número do serviço para agendar:*`;
  }
  else if (mensagem.includes('3') || mensagem.includes('atendente')) {
    resposta = `👨‍💼 *ATENDIMENTO HUMANO*

✅ Sua solicitação foi registrada!
📞 Nossa equipe entrará em contato em breve.

⏰ *Horário de atendimento:*
Segunda a Sexta: 8h às 18h
Sábado: 8h às 12h

📱 *WhatsApp:* (16) 99625-9672`;
  }
  else if (['11','12','13','14','15'].includes(mensagem)) {
    const servico = CONFIG.services[parseInt(mensagem) - 11];
    resposta = `✅ *${servico.emoji} ${servico.name}* selecionado!

📍 *Por favor, envie:*
• Seu *ENDEREÇO COMPLETO*
• *DATA* preferencial
• *HORÁRIO* desejado

📝 *Exemplo:*
"Rua das Flores, 123 - Centro
Amanhã às 14h"`;
  }
  else if (mensagem.includes('rua') || mensagem.includes('av') || mensagem.includes('endereço')) {
    resposta = `✅ *SOLICITAÇÃO REGISTRADA!*

📋 Sua solicitação foi enviada para nossa equipe!

👨‍💼 *Em breve entraremos em contato para confirmar:*
• Detalhes do serviço
• Data e horário
• Orçamento

📱 *WhatsApp:* (16) 99625-9672
⏰ *Horário:* Seg-Sex: 8h-18h

*Obrigado pela preferência!* 🛠️`;
  }
  else {
    resposta = `🔌 *${CONFIG.businessName}*

Não entendi sua mensagem. 

Digite *MENU* para ver as opções:
1️⃣ - Orçamento
2️⃣ - Agendar visita  
3️⃣ - Falar com atendente`;
  }
  
  // ENVIAR RESPOSTA
  await client.sendText(from, resposta);
  console.log('✅ Resposta enviada para:', from);
}

// ==================== GERADORES DE MENU ====================
function gerarMenuPrincipal() {
  return `🔌 *${CONFIG.businessName}* - Seja bem-vindo!

⚡ *Especialistas em serviços elétricos e segurança*

*Escolha uma opção:*
1️⃣ - FAZER ORÇAMENTO
2️⃣ - AGENDAR VISITA  
3️⃣ - FALAR COM ATENDENTE

📲 *Ou acesse nosso painel web:*
https://hl-servicos.vercel.app

*Digite o número da opção:*`;
}

function gerarMenuServicos() {
  let menu = `📋 *ESCOLHA O SERVIÇO:*\n\n`;
  
  CONFIG.services.forEach((servico, index) => {
    menu += `${index + 1}1️⃣ - ${servico.emoji} ${servico.name}\n   ${servico.desc}\n\n`;
  });
  
  menu += `*Digite o número do serviço:*\n(Ex: 11 para ${CONFIG.services[0].name})`;
  
  return menu;
}

// ==================== PAINEL WEB ====================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/servicos', (req, res) => {
  res.json(CONFIG.services);
});

app.post('/api/agendar', async (req, res) => {
  const { servico, nome, telefone, endereco, data } = req.body;
  
  // Enviar mensagem pelo WhatsApp
  if (whatsappClient) {
    const mensagem = `📋 *NOVO AGENDAMENTO VIA SITE*\n\n👤 *Cliente:* ${nome}\n📞 *Telefone:* ${telefone}\n📍 *Endereço:* ${endereco}\n🛠️ *Serviço:* ${servico}\n📅 *Data:* ${data}`;
    
    await whatsappClient.sendText(`${CONFIG.whatsappNumber}@c.us`, mensagem);
  }
  
  res.json({ success: true, message: 'Agendamento enviado com sucesso!' });
});

// ==================== INICIAR TUDO ====================
app.listen(3000, () => {
  console.log('🚀 Servidor rodando na porta 3000');
  console.log('🌐 Painel web: http://localhost:3000');
  iniciarWhatsAppBot();
});

// Export para Vercel
module.exports = app;
