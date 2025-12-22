/** @type {import('tailwindcss').Config} */
module.exports = {
    // 这里的路径非常关键！
    // 意思是：扫描 src 目录下所有 .js, .ts, .jsx, .tsx, .vue 结尾的文件
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx,vue}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}