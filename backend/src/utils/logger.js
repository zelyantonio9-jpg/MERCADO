// Logger estruturado mínimo, sem dependências externas (evita instalar
// pino/winston só para isto). Cada linha é um JSON com nível, timestamp,
// requestId (quando disponível) e o resto do contexto — pronto para ser
// recolhido por qualquer agregador (CloudWatch, Loki, Datadog, etc.) sem
// alterações.
function write(level, message, context = {}) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message, context) => write('info', message, context),
  warn: (message, context) => write('warn', message, context),
  error: (message, context) => write('error', message, context),
};
