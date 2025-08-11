import replace from 'rollup-plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import {uglify} from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';

const isDev = process.env.NODE_ENV !== 'production';

export default {
    input: './packages/player/src/index.js',
    output: [{
        file: isDev ? 'dist/sugarPlayer.js' : 'dist/sugarPlayer.js',
        name: 'sugarPlayer',
        format: 'umd',
        sourcemap: true
    }, {
        file: isDev ? 'dist/sugarPlayer.bundle.js' : 'dist/sugarPlayer.bundle.js',
        name: 'sugarPlayer',
        format: 'es',
        sourcemap: true
    }],
    plugins: [
        commonjs(),
        babel({
            exclude: 'node_modules/**'
        }),
        postcss({
            plugins: [],
            extract: true
        }),
        resolve(),
        replace({
            ENV: JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        !isDev ? uglify() : null,
        // 热更新 默认监听根文件夹
        isDev ? livereload() : null,
        // 本地服务器
        // eslint-disable-next-line multiline-ternary
        isDev ? serve({
            open: true, // 自动打开页面
            port: 8000,
            openPage: '/index.html', // 打开的页面
            contentBase: ''
        }) : null
    ]
};
