import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração pensada para correr como Web e, mais tarde, ser embrulhada
// pelo Capacitor para Android/iOS sem alterar a lógica de negócio.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
});
