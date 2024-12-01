import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ command, mode }) => {
    const config = {
        plugins: [
            vue(),
            VitePWA({
                registerType: 'autoUpdate',
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'google-fonts-cache',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                                },
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        },
                        {
                            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'cdn-cache',
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
                                },
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        }
                    ]
                }
            }),
            viteCompression({
                verbose: true,
                algorithm: 'gzip',
                ext: '.gz'
            }),
            viteImagemin({
                gifsicle: {
                    optimizationLevel: 7,
                    interlaced: false
                },
                optipng: {
                    optimizationLevel: 7
                },
                mozjpeg: {
                    quality: 80
                },
                pngquant: {
                    quality: [0.8, 0.9],
                    speed: 4
                },
                svgo: {
                    plugins: [
                        {
                            name: 'removeViewBox'
                        },
                        {
                            name: 'removeEmptyAttrs',
                            active: false
                        }
                    ]
                }
            })
        ],
        build: {
            target: 'es2015',
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true
                }
            },
            rollupOptions: {
                output: {
                    manualChunks: {
                        'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
                        'vue-vendor': ['vue', 'vue-router', 'vuex'],
                        'chart': ['chart.js']
                    }
                }
            },
            chunkSizeWarningLimit: 1000
        },
        optimizeDeps: {
            include: ['vue', 'firebase/app', 'chart.js']
        }
    };

    // Add bundle analyzer in analyze mode
    if (mode === 'analyze') {
        config.plugins.push(
            visualizer({
                open: true,
                filename: 'dist/stats.html',
                gzipSize: true,
                brotliSize: true
            })
        );
    }

    return config;
});
