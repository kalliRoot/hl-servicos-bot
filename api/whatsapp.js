const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Rota principal - Painel Web
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../public/index.html');
});

// API para agendamento
app.post('/api/agendar', (req, res) => {
  const { servico, nome, telefone, endereco, data, observacao } = req.body;
  
  console.log('📋 NOVO AGENDAMENTO:');
  console.log('👤 Nome:', nome);
  console.log('📞 Telefone:', telefone);
  console.log('📍 Endereço:', endereco);
  console.log('🛠️ Serviço:', servico);
  console.log('📅 Data:', data);
  console.log('📝 Observação:', observacao);
  
  res.json({ 
    success: true, 
    message: 'Agendamento recebido! Entraremos em contato para confirmar.',
    whatsapp_link: `https://wa.me/5516996259672?text=${encodeURIComponent(
      `Olá! Sou o ${nome}. Já enviei meu agendamento pelo site:\n\n` +
      `Serviço: ${servico}\n` +
      `Endereço: ${endereco}\n` +
      `Data: ${data}\n` +
      `Observação: ${observacao}`
    )}`
  });
});

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ HL Serviços ONLINE', timestamp: new Date().toISOString() });
});

module.exports = app;
