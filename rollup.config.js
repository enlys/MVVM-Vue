import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
export default {
    input: './src/index.js',
    output: {
        file: './dist/vue.js',
        name: 'Vue',
        format: 'umd', // ESM ES6 COMMONJS IIFE UMD
        sourcemap: true,
    },
    plugins: [
        babel({
            exclude: 'node_modules/**' //排除
        }),
        resolve()
    ]
}