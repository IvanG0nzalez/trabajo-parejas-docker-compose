const env = process.env.NODE_ENV || 'development';

if (env === 'production') {
  const schedule = require('node-schedule');
  const axios = require('axios');

  const ruleBack = new schedule.RecurrenceRule();
  ruleBack.minute = 0;
  ruleBack.minute = new schedule.Range(0, 59, 4);

  const ruleFront = new schedule.RecurrenceRule();
  ruleFront.minute = 0;
  ruleFront.minute = new schedule.Range(0, 59, 4);
  ruleFront.hour = new schedule.Range(10, 21);

  async function mantenerServidorVivo() {
    try {
      const response = await axios.get('https://ortegada-back-end.onrender.com/api/keepalive');
      console.log('Solicitud exitosa al back:', response.status);
    } catch (error) {
      console.error('Error al hacer la solicitud al back:', error.message);
    }
  }

  async function mantenerServidorFrontVivo() {
    try {
      const response = await axios.get('https://reunion-familiar-anual.onrender.com');
      console.log('Solicitud exitosa al front:', response.status);
    } catch (error) {
      console.error('Error al hacer la solicitud al front:', error.message);
    }
  }

  const job = schedule.scheduleJob(ruleBack, mantenerServidorVivo);
  const job_front = schedule.scheduleJob(ruleFront, mantenerServidorFrontVivo);
}