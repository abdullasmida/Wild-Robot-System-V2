import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // تأكد إن مفيش سطر زي base: '/app' هنا، لو موجود امسحه
})