const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Spacing and text in Agitation Section
html = html.replace(/<section class="glass-panel p-10 rounded-2xl">/, '<section class="glass-panel p-6 lg:p-8 rounded-2xl">');
html = html.replace(/<h2 class="font-headline-xl text-headline-xl text-headline-white mb-6">/, '<h2 class="font-headline-xl text-2xl md:text-3xl lg:text-4xl leading-tight font-bold text-headline-white mb-4">');
html = html.replace(/<ul class="space-y-4 font-body-md text-body-md text-body-gray">/, '<ul class="space-y-2 lg:space-y-3 font-body-md text-body-md text-body-gray">');

// 2. Feature blocks typography and spacing
html = html.replace(/gap-section-gap/g, 'gap-12 lg:gap-16');
html = html.replace(/pb-section-gap/, 'pb-12 lg:pb-16');
html = html.replace(/<section class="flex flex-col gap-24">/, '<section class="flex flex-col gap-12 lg:gap-16">');
html = html.replace(/<h3 class="font-headline-lg text-headline-lg text-headline-white">/g, '<h3 class="font-headline-lg text-xl md:text-2xl font-bold text-headline-white">');
html = html.replace(/<div class="w-full md:w-1\/2 flex flex-col gap-4">/g, '<div class="w-full md:w-1/2 flex flex-col gap-2 lg:gap-3">');
html = html.replace(/<ul class="space-y-2 mt-4 text-body-gray">/g, '<ul class="space-y-2 mt-2 text-body-gray">');
html = html.replace(/<section class="glass-panel p-10/g, '<section class="glass-panel p-6 lg:p-8');
html = html.replace(/mt-12/g, 'mt-8');
html = html.replace(/mt-8/g, 'mt-6');
html = html.replace(/py-section-gap/g, 'py-12'); // footer

// 3. Add sticky bar HTML before </body>
const stickyBarHtml = `
<!-- Sticky Mobile Buy Button -->
<div id="stickyBuyBar" class="fixed bottom-0 left-0 right-0 p-4 bg-surface/95 backdrop-blur-xl border-t border-border-subtle z-50 transform translate-y-full transition-transform duration-300 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
    <a href="#checkout" class="relative overflow-hidden w-full bg-gradient-to-r from-construction-amber to-amber-500 text-black font-bold py-3.5 rounded-xl shadow-lg flex justify-center items-center gap-2 group">
        <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite] animate-[shimmer_2.5s_infinite]"></div>
        <span class="material-symbols-outlined text-lg">bolt</span>
        Buy Now — ₹248
    </a>
</div>
`;
html = html.replace('</body>', stickyBarHtml + '\n</body>');

// 4. Add keyframes to <style>
const styleAdditions = `
        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
`;
html = html.replace('</style>', styleAdditions + '\n    </style>');

// 5. Add JS listener in <script>
const jsAddition = `
    // Sticky Buy Bar Logic
    window.addEventListener('scroll', () => {
        const stickyBar = document.getElementById('stickyBuyBar');
        if (stickyBar) {
            if (window.scrollY > 450) {
                stickyBar.classList.remove('translate-y-full');
            } else {
                stickyBar.classList.add('translate-y-full');
            }
        }
    });
`;
html = html.replace('function initDynamicDiscounts() {', jsAddition + '\n    function initDynamicDiscounts() {');

fs.writeFileSync('index.html', html);
console.log('index.html updated successfully');
