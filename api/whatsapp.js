const twilio = require('twilio');

module.exports = async (req, res) => {
  // PERMITE REQUISIÇÕES POST E GET (para teste)
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: '✅ HL Serviços ONLINE',
      message: 'Webhook WhatsApp funcionando'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('📱 Webhook chamado pelo Twilio');
    
    // EXTRAI DADOS DO TWILIO
    const body = req.body || {};
    const mensagem = (body.Body || '').toLowerCase().trim();
    const from = body.From || '';

    console.log('Mensagem:', mensagem, 'De:', from);

    // SE NÃO VEIO DADOS, RETORNA SUCESSO
    if (!from) {
      console.log('❌ Dados incompletos do Twilio');
      res.setHeader('Content-Type', 'text/xml');
      return res.send('<?xml version="1.0"?><Response></Response>');
    }

    // INICIALIZA TWILIO CLIENT
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      console.log('❌ Credenciais Twilio não configuradas');
      res.setHeader('Content-Type', 'text/xml');
      return res.send('<?xml version="1.0"?><Response></Response>');
    }

    const client = twilio(accountSid, authToken);

    // RESPOSTAS DO BOT
    let resposta = `🔌 *HL SERVIÇOS* - Seja bem-vindo!

1️⃣ - FAZER ORÇAMENTO
2️⃣ - AGENDAR VISITA  
3️⃣ - FALAR COM ATENDENTE

Digite o número:`;

    if (mensagem === '1') {
      resposta = `✅ *ORÇAMENTO* - Escolha o serviço:

1️⃣ - Instalação Elétrica
2️⃣ - Câmeras Segurança  
3️⃣ - Portões Automáticos
4️⃣ - Cerca Elétrica
5️⃣ - Instalações Gerais

Digite o número:`;
    }
    else if (mensagem === '2') {
      resposta = `📅 *AGENDAR VISITA* - Escolha:

1️⃣ - Instalação Elétrica
2️⃣ - Câmeras Segurança  
3️⃣ - Portões Automáticos

Digite o número:`;
    }
    else if (mensagem === '3') {
      resposta = `👨‍💼 *ATENDIMENTO HUMANO*

✅ Solicitação registrada!
📞 Retornaremos em breve.

⏰ Horário: Seg-Sex: 8h-18h`;
    }
    else if (['11', '12', '13', '14', '15'].includes(mensagem)) {
      resposta = `✅ Serviço selecionado!

📍 *ENVIE SEU ENDEREÇO:*
Rua, número, bairro, cidade

⚠️ Necessário para avaliação`;
    }
    else if (mensagem.includes('rua') || mensagem.includes('av') || mensagem.length > 15) {
      resposta = `✅ *PEDIDO REGISTRADO!*

📋 Em breve entraremos em contato!

📱 WhatsApp: (16) 99625-9672
⏰ Horário: Seg-Sex: 8h-18h

Obrigado! 🛠️`;
    }

    // ENVIA RESPOSTA VIA TWILIO API
    console.log('📤 Enviando resposta para:', from);
    await client.messages.create({
      body: resposta,
      from: 'whatsapp:+14155238886',
      to: from
    });

    console.log('✅ Resposta enviada com sucesso');
    
    // RETORNA RESPOSTA PARA TWILIO
    res.setHeader('Content-Type', 'text/xml');
    res.send('<?xml version="1.0"?><Response></Response>');

  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error);
    
    // RETORNA SUCESSO MESMO COM ERRO (para não quebrar webhook)
    res.setHeader('Content-Type', 'text/xml');
    res.send('<?xml version="1.0"?><Response></Response>');
  }
};
