const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const insertionPoint = `            // Changed rotation interval from 1500ms to 3000ms (3 seconds)
            setInterval(rotateCarousel, 3000);
        });
    </script>`;

const newSection = `

<!-- Modules Section -->
<div style="background-color: #f8fafc; padding: 80px 20px; text-align: center; font-family: 'Roboto', sans-serif;">
    <div style="max-width: 1200px; margin: 0 auto;">
        <h3 style="color: #1e3a8a; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 15px;">What's Inside</h3>
        <h2 style="color: #0f172a; font-size: 36px; font-weight: 800; margin-bottom: 20px; line-height: 1.2;">6 Powerful Modules — Built for Real Site Work</h2>
        <p style="color: #475569; font-size: 18px; margin-bottom: 50px; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.6;">Every module covers one essential skill — clear, practical, and immediately usable on your projects.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px;">
            <!-- Module 01 -->
            <div style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; text-align: left;">
                <img src="assets/modules/boq.jpg" alt="BOQ Preparation" style="width: 100%; height: auto; display: block;" loading="lazy">
                <div style="padding: 30px;">
                    <span style="color: #2563eb; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Module 01</span>
                    <h4 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 12px 0 20px;">Step-by-Step BOQ Preparation Video Course</h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #475569; font-size: 15px; line-height: 1.5;">
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Real item-wise quantity take-off method</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> BOQ format explanation (item, unit, rate)</li>
                    </ul>
                </div>
            </div>
            
            <!-- Module 02 -->
            <div style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; text-align: left;">
                <img src="assets/modules/qs-guide.jpg" alt="Quantity Surveying Guide" style="width: 100%; height: auto; display: block;" loading="lazy">
                <div style="padding: 30px;">
                    <span style="color: #2563eb; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Module 02</span>
                    <h4 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 12px 0 20px;">Complete Practical Quantity Surveying Guide (PDF)</h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #475569; font-size: 15px; line-height: 1.5;">
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Real site-based practical explanations</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Step-by-step quantity calculation methods</li>
                    </ul>
                </div>
            </div>

            <!-- Module 03 -->
            <div style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; text-align: left;">
                <img src="assets/modules/billing.jpg" alt="Estimation & Billing Methods" style="width: 100%; height: auto; display: block;" loading="lazy">
                <div style="padding: 30px;">
                    <span style="color: #2563eb; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Module 03</span>
                    <h4 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 12px 0 20px;">Estimation & Billing Methods</h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #475569; font-size: 15px; line-height: 1.5;">
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Abstract sheet preparation</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Running bill (RA Bill) calculation method</li>
                    </ul>
                </div>
            </div>
            
            <!-- Module 04 -->
            <div style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; text-align: left;">
                <img src="assets/modules/rate-analysis.jpg" alt="Rate Analysis" style="width: 100%; height: auto; display: block;" loading="lazy">
                <div style="padding: 30px;">
                    <span style="color: #2563eb; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Module 04</span>
                    <h4 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 12px 0 20px;">Rate Analysis with Real Calculations</h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #475569; font-size: 15px; line-height: 1.5;">
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Material quantity breakdown</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Labour cost calculation</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Equipment & machinery costing</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Overhead & profit percentage method</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Complete rate analysis example with numbers</li>
                    </ul>
                </div>
            </div>

            <!-- Module 05 -->
            <div style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; text-align: left;">
                <img src="assets/modules/bbs.jpg" alt="BBS Formats" style="width: 100%; height: auto; display: block;" loading="lazy">
                <div style="padding: 30px;">
                    <span style="color: #2563eb; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Module 05</span>
                    <h4 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 12px 0 20px;">Bar Bending Schedule (BBS) Formats</h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #475569; font-size: 15px; line-height: 1.5;">
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Steel quantity calculation formula</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Cutting length calculation method</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> BBS table preparation format</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Shape code explanation</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Sample slab & footing BBS example</li>
                    </ul>
                </div>
            </div>

            <!-- Module 06 -->
            <div style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; text-align: left;">
                <img src="assets/modules/excel-sheets.jpg" alt="Excel Sheets" style="width: 100%; height: auto; display: block;" loading="lazy">
                <div style="padding: 30px;">
                    <span style="color: #2563eb; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Module 06</span>
                    <h4 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 12px 0 20px;">Ready-to-Use Excel Sheets</h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #475569; font-size: 15px; line-height: 1.5;">
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> BOQ working Excel template</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Rate analysis calculation sheet</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> BBS auto-calculation format</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Billing format template</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Editable and easy-to-customize sheets</li>
                    </ul>
                </div>
            </div>

            <!-- Module 07 -->
            <div style="background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; text-align: left; max-width: 400px; margin: 0 auto; width: 100%;" class="module-7">
                <img src="assets/modules/lifetime-access.jpg" alt="Lifetime Access" style="width: 100%; height: auto; display: block;" loading="lazy">
                <div style="padding: 30px;">
                    <span style="color: #2563eb; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Module 07</span>
                    <h4 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 12px 0 20px;">Lifetime Access</h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #475569; font-size: 15px; line-height: 1.5;">
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> One-time payment</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Instant PDF download</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Future updates included</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> No recurring charges</li>
                        <li style="margin-bottom: 12px; display: flex; gap: 10px; align-items: flex-start;"><svg style="color: #2563eb; flex-shrink: 0; width: 22px; height: 22px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Access anytime, anywhere</li>
                    </ul>
                </div>
            </div>
            
        </div>
    </div>
</div>
<!-- End Modules Section -->

`;

const finalHtml = html.replace(insertionPoint, insertionPoint + newSection);
fs.writeFileSync('index.html', finalHtml);
console.log('Inserted HTML block');
