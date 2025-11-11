const twilio = require('twilio');

// Função para parsear form data
function parseFormData(body) {
  const params = new URLSearchParams(body);
  const data = {};
  for (const [key, value] of params) {
    data[key] = value;
  }
  return data;
}

module.exports = async (req, res) => {
  console.log('🔔 WEBHOOK CHAMADO - Método:', req.method);
  
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: '✅ HL Serviços ONLINE - Webhook funcionando',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('📦 Content-Type:', req.headers['content-type']);
    console.log('📦 Body raw:', req.body);
    
    // PARSE CORRETO DOS DADOS DO TWILIO
    let bodyData = {};
    
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      bodyData = parseFormData(req.body);
    } else {
      bodyData = req.body;
    }
    
    console.log('📦 DADOS PARSED:', bodyData);
    
    const mensagem = (bodyData.Body || '').toLowerCase().trim();
    const from = bodyData.From || '';

    console.log('👤 De:', from, '| Mensagem:', mensagem);

    if (!from) {
      console.log('❌ From vazio');
      res.setHeader('Content-Type', 'text/xml');
      return res.send('<?xml version="1.0"?><Response></Response>');
    }

    // RESPOSTA VIA TWIML (DIRETA - SEM API)
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

    console.log('📤 RESPOSTA:', resposta);

    // TWIML RESPONSE
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${resposta}</Message>
</Response>`;

    res.setHeader('Content-Type', 'text/xml');
    res.send(twiml);
    console.log('✅ RESPOSTA ENVIADA VIA TWIML');

  } catch (error) {
    console.error('❌ ERRO CRÍTICO:', error);
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>🔌 HL SERVIÇOS - Em instantes retornamos!</Message>
</Response>`;
    
    res.setHeader('Content-Type', 'text/xml');
    res.send(errorTwiml);
  }
};
